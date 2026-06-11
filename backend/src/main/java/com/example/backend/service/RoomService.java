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

  private final Map<String, Set<WebSocketSession>> sessions = new ConcurrentHashMap<>();

  public void joinRoom(String roomId, WebSocketSession session) {

    RoomEntity entity = roomRepository.findById(roomId).orElseGet(() ->
            roomRepository.save(RoomEntity.builder()
                    .roomId(roomId)
                    .videoTimestamp(0L)
                    .playing(false)
                    .videoLink(null)
                    .build()
            )
    );

    sessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);

    broadcast(entity);
  }

  public void updateState(String roomId, long timestamp, boolean playing) {

    RoomEntity entity = roomRepository.findById(roomId).orElse(null);
    if (entity == null) return;

    entity.setVideoTimestamp(timestamp);
    entity.setPlaying(playing);
    roomRepository.save(entity);

    broadcast(entity);
  }

  private void broadcast(RoomEntity entity) {
    try {
      MessageDto dto = MessageDto.builder()
              .type("STATE")
              .roomId(entity.getRoomId())
              .videoLink(entity.getVideoLink())
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
