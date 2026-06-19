package com.example.backend.service;

import com.example.backend.model.RoomEntity;
import com.example.backend.model.StateUpdateDto;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RoomService {

  private final RoomRepository roomRepository;
  private final ObjectMapper mapper;

  private final Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();

  public void joinRoom(String roomId, WebSocketSession session) {

    rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet());

    for (Set<WebSocketSession> sessions : rooms.values()) {
      sessions.remove(session);
    }

    rooms.get(roomId).add(session);

    RoomEntity entity = roomRepository.findById(roomId)
            .orElseGet(() -> roomRepository.save(
                    RoomEntity.builder()
                            .roomId(roomId)
                            .videoUrl(null)
                            .videoTimestamp(0L)
                            .playing(false)
                            .build()
            ));

    broadcastState(entity);
  }

  public void updateRoom(StateUpdateDto dto, WebSocketSession session) {

    String roomId = findRoom(session);
    if (roomId == null) return;

    RoomEntity entity = roomRepository.findById(roomId).orElse(null);
    if (entity == null) return;

    if (dto.getVideoUrl() != null) entity.setVideoUrl(dto.getVideoUrl());
    if (dto.getVideoTimestamp() != null) entity.setVideoTimestamp(dto.getVideoTimestamp());
    if (dto.getPlaying() != null) entity.setPlaying(dto.getPlaying());

    roomRepository.save(entity);

    broadcastState(entity);
  }

  public void broadcastChat(WebSocketSession sender, String text) {

    String roomId = findRoom(sender);
    if (roomId == null) return;

    ObjectNode node = mapper.createObjectNode();
    node.put("type", "CHAT");
    node.put("text", text);
    node.put("ts", System.currentTimeMillis());

    broadcast(roomId, node);
  }

  private void broadcastState(RoomEntity entity) {

    ObjectNode node = mapper.createObjectNode();
    node.put("type", "STATE");
    node.put("videoUrl", entity.getVideoUrl());
    node.put("videoTimestamp", entity.getVideoTimestamp());
    node.put("playing", entity.isPlaying());

    broadcast(entity.getRoomId(), node);
  }

  private void broadcast(String roomId, Object payload) {

    Set<WebSocketSession> sessions = rooms.get(roomId);
    if (sessions == null) return;

    List<WebSocketSession> dead = new ArrayList<>();

    try {
      String json = mapper.writeValueAsString(payload);
      TextMessage message = new TextMessage(json);

      for (WebSocketSession session : sessions) {
        try {
          if (session.isOpen()) {
            session.sendMessage(message);
          } else {
            dead.add(session);
          }
        } catch (Exception e) {
          dead.add(session);
        }
      }

      dead.forEach(sessions::remove);

      if (sessions.isEmpty()) {
        rooms.remove(roomId);
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  private String findRoom(WebSocketSession session) {
    for (var entry : rooms.entrySet()) {
      if (entry.getValue().contains(session)) {
        return entry.getKey();
      }
    }
    return null;
  }

  public void removeSession(WebSocketSession session) {
    String roomId = findRoom(session);
    if (roomId == null) return;

    Set<WebSocketSession> sessions = rooms.get(roomId);
    if (sessions != null) {
      sessions.remove(session);
      if (sessions.isEmpty()) {
        rooms.remove(roomId);
      }
    }
  }
}