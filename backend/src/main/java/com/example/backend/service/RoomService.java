package com.example.backend.service;

import com.example.backend.model.MessageDto;
import com.example.backend.model.RoomEntity;
import com.example.backend.repository.RoomRepository;
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

  public void joinRoom(String roomId, WebSocketSession session) {

    String oldRoom = sessionRoom.put(session, roomId);

    if (oldRoom != null && !oldRoom.equals(roomId)) {
      Set<WebSocketSession> oldSet = sessions.get(oldRoom);
      if (oldSet != null) {
        oldSet.remove(session);
      }
    }

    RoomEntity entity = roomRepository.findById(roomId).orElseGet(() ->
            roomRepository.save(RoomEntity.builder()
                    .roomId(roomId)
                    .videoTimestamp(0L)
                    .playing(false)
                    .videoUrl(null)
                    .build()
            )
    );

    sessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);

    broadcast(entity);
  }

  public void removeSession(WebSocketSession session) {
    String room = sessionRoom.remove(session);
    if (room != null) {
      Set<WebSocketSession> set = sessions.get(room);
      if (set != null) set.remove(session);
    }
  }

  public void updateRoom(MessageDto dto) {
    RoomEntity entity = roomRepository.findById(dto.getRoomId()).orElse(null);
    if (entity == null) return;

    if (dto.getVideoUrl() != null) entity.setVideoUrl(dto.getVideoUrl());
    if (dto.getVideoTimestamp() != null) entity.setVideoTimestamp(dto.getVideoTimestamp());
    if (dto.getPlaying() != null) entity.setPlaying(dto.getPlaying());

    roomRepository.save(entity);
    broadcast(entity);
  }

  private void broadcast(RoomEntity entity) {
    try {
      MessageDto dto = MessageDto.builder()
              .type("STATE")
              .roomId(entity.getRoomId())
              .videoUrl(entity.getVideoUrl())
              .videoTimestamp(entity.getVideoTimestamp())
              .playing(entity.isPlaying())
              .build();

      String json = mapper.writeValueAsString(dto);
      TextMessage msg = new TextMessage(json);

      Set<WebSocketSession> roomSessions = sessions.get(entity.getRoomId());
      if (roomSessions == null) return;

      roomSessions.removeIf(s -> {
        try {
          if (s.isOpen()) {
            s.sendMessage(msg);
            return false;
          }
        } catch (Exception e) {
          e.printStackTrace();
        }
        return true;
      });

    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
