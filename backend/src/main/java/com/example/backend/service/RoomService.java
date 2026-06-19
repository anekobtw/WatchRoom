package com.example.backend.service;

import com.example.backend.model.StateUpdateDto;
import com.example.backend.model.RoomEntity;
import com.example.backend.repository.RoomRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;
import tools.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RoomService {

  private final RoomRepository roomRepository;
  private final ObjectMapper mapper;

  private final Map<WebSocketSession, String> sessionRoom = new ConcurrentHashMap<>();
  private final Map<String, Set<WebSocketSession>> sessions = new ConcurrentHashMap<>();

  @Transactional
  public void joinRoom(String roomId, WebSocketSession session) {
    RoomEntity entity = roomRepository.findById(roomId)
            .orElseGet(() -> roomRepository.save(
                    RoomEntity.builder()
                            .roomId(roomId)
                            .videoTimestamp(0L)
                            .playing(false)
                            .videoUrl(null)
                            .build()
            ));

    sessionRoom.put(session, roomId);

    sessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet())
            .add(session);

    broadcast(entity);
  }

  public void removeSession(WebSocketSession session) {
    String room = sessionRoom.remove(session);
    if (room == null) return;

    Set<WebSocketSession> set = sessions.get(room);
    if (set == null) return;

    set.remove(session);

    if (set.isEmpty()) {
      sessions.remove(room);
    }
  }

  public void updateRoom(StateUpdateDto dto, WebSocketSession session) {
    String roomId = sessionRoom.get(session);
    if (roomId == null) return;

    RoomEntity entity = roomRepository.findById(roomId).orElse(null);
    if (entity == null) return;

    if (dto.getVideoUrl() != null) entity.setVideoUrl(dto.getVideoUrl());
    if (dto.getVideoTimestamp() != null) entity.setVideoTimestamp(dto.getVideoTimestamp());
    if (dto.getPlaying() != null) entity.setPlaying(dto.getPlaying());

    roomRepository.save(entity);
    broadcast(entity);
  }

  public void broadcastChat(WebSocketSession sender, String text) {
    String roomId = sessionRoom.get(sender);
    if (roomId == null) return;

    var node = mapper.createObjectNode();
    node.put("type", "CHAT");
    node.put("text", text);
    node.put("ts", System.currentTimeMillis());

    broadcastToRoom(roomId, node);
  }

  private void broadcast(RoomEntity entity) {
    var dto = StateUpdateDto.builder()
            .type("STATE")
            .videoUrl(entity.getVideoUrl())
            .videoTimestamp(entity.getVideoTimestamp())
            .playing(entity.isPlaying())
            .build();

    broadcastToRoom(entity.getRoomId(), dto);
  }

  private void broadcastToRoom(String roomId, Object payload) {
    Set<WebSocketSession> roomSessions = sessions.get(roomId);
    if (roomSessions == null) return;

    try {
      String json = mapper.writeValueAsString(payload);
      TextMessage msg = new TextMessage(json);

      List<WebSocketSession> dead = new ArrayList<>();

      for (WebSocketSession s : roomSessions) {
        try {
          if (s.isOpen()) {
            s.sendMessage(msg);
          } else {
            dead.add(s);
          }
        } catch (Exception e) {
          dead.add(s);
        }
      }

      dead.forEach(roomSessions::remove);

    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}