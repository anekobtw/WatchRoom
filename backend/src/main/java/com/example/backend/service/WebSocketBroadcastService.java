package com.example.backend.service;

import com.example.backend.model.entity.ChatMessage;
import com.example.backend.model.entity.RoomEntity;
import com.example.backend.model.enums.WsType;
import com.example.backend.model.websocket.RoomState;
import com.example.backend.model.websocket.WsMessage;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Set;
import java.util.Map;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketBroadcastService {

  private final AtomicInteger version = new AtomicInteger();
  private final ObjectMapper mapper;
  private final RoomRepository roomRepository;
  private final Map<String, ScheduledFuture<?>> pendingSyncs = new ConcurrentHashMap<>();
  private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

  public void scheduleSync(String roomId, Set<WebSocketSession> sessions, String updatedBy, List<ChatMessage> messages) {
    pendingSyncs.compute(roomId, (id, oldTask) -> {
      if (oldTask != null) {
        oldTask.cancel(false);
      }

      return scheduler.schedule(() -> {
        RoomEntity room = roomRepository.findById(roomId).orElse(null);
        if (room == null) return;

        RoomState data;

        if (updatedBy == null) {
          data = RoomState.builder()
                  .version(version.incrementAndGet())
                  .users(sessions.stream().map(s -> (String) s.getAttributes().get("userName")).collect(Collectors.toSet()))
                  .build();
        } else {
          data = RoomState.builder()
                  .version(version.incrementAndGet())
                  .updatedBy(updatedBy)
                  .videoUrl(room.getVideoUrl())
                  .videoTimestamp(room.getVideoTimestamp())
                  .playing(room.isPlaying())
                  .users(sessions.stream().map(s -> (String) s.getAttributes().get("userName")).collect(Collectors.toSet()))
                  .messages(messages)
                  .build();
        }

        WsMessage payload = WsMessage.builder()
                .type(WsType.STATE)
                .data(data)
                .build();

        pendingSyncs.remove(roomId);
        broadcast(sessions, payload);
      }, 100, TimeUnit.MILLISECONDS);
    });
  }

  private void broadcast(Set<WebSocketSession> sessions, Object payload) {
    if (sessions.isEmpty()) return;

    String json;

    try {
      json = mapper.writeValueAsString(payload);
    } catch (Exception e) {
      log.error("Failed to serialize websocket payload", e);
      return;
    }

    for (WebSocketSession session : sessions) {
      if (!session.isOpen()) {
        sessions.remove(session);
        continue;
      }

      try {
        synchronized (session) {
          session.sendMessage(new TextMessage(json));
        }
      } catch (Exception e) {
        log.error("Failed to send websocket message", e);
        sessions.remove(session);
      }
    }
  }
}
