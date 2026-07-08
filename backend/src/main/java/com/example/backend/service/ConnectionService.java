package com.example.backend.service;

import com.example.backend.model.entity.ChatMessageEntity;
import com.example.backend.model.enums.WsType;
import com.example.backend.model.view.ChatMessageView;
import com.example.backend.model.websocket.ConnectionToken;
import com.example.backend.model.view.UserView;
import com.example.backend.model.websocket.RoomState;
import com.example.backend.model.entity.RoomEntity;
import com.example.backend.model.websocket.WsMessage;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConnectionService {
  private final RoomRepository roomRepository;
  private final ChatMessageRepository messageRepository;
  private final ObjectMapper mapper;

  private final Map<String, ConnectionToken> tokens = new ConcurrentHashMap<>();

  public String issueConnectionId(WebSocketSession session, String name, String roomId) {
    String connectionId = UUID.randomUUID().toString();

    tokens.put(connectionId, ConnectionToken.builder()
            .connectionId(connectionId)
            .session(session)
            .name(name)
            .roomId(roomId)
            .expiresAt(Instant.now().plusSeconds(43200))  // 12 hours
            .connected(false)
            .build());

    return connectionId;
  }

  public void removeConnectionId(String connectionId) {
    tokens.remove(connectionId);
  }

  public void closeConnection(WebSocketSession session) {
    ConnectionToken token = getTokenInfo(session);

    if (token == null) return;

    if (token.getExpiresAt().isBefore(Instant.now())) {
      removeConnectionId(token.getConnectionId());
    } else {
      token.setConnected(false);
    }

    broadcastState(token.getRoomId());
  }

  public ConnectionToken getTokenInfo(String connectionId) {
    return tokens.get(connectionId);
  }

  public ConnectionToken getTokenInfo(WebSocketSession session) {
    return tokens.values().stream()
            .filter(t -> t.getSession().equals(session))
            .findFirst()
            .orElse(null);
  }

  public boolean validateSession(String connectionId, WebSocketSession session) {
    ConnectionToken client = getTokenInfo(connectionId);
    if (client == null) return false;

    if (client.getExpiresAt().isBefore(Instant.now())) {
      removeConnectionId(connectionId);
      return false;
    }

    return (client.getSession().equals(session));
  }

  public void broadcastState(String roomId) {
    RoomEntity room = roomRepository.findById(roomId).orElse(null);
    if (room == null) return;

    String roomAdminConnectionId = room.getAdminConnectionId();

    Set<UserView> roomUsers = tokens.values().stream()
            .filter(t -> roomId.equals(t.getRoomId()) && t.isConnected())
            .map(t -> UserView.builder()
                    .name(t.getName())
                    .admin(Objects.equals(t.getConnectionId(), roomAdminConnectionId))
                    .build()
            )
            .collect(Collectors.toSet());

    List<ChatMessageEntity> rawMessages = messageRepository.findTop100ByRoomIdOrderByTsAsc(roomId);

    tokens.values().stream()
            .filter(t -> roomId.equals(t.getRoomId()) && t.isConnected())
            .forEach(t -> {
              String connectionId = t.getConnectionId();

              List<ChatMessageView> messages = rawMessages.stream()
                      .map(message -> ChatMessageView.builder()
                              .senderName(message.getSenderName())
                              .text(message.getText())
                              .ts(message.getTs())
                              .mine(Objects.equals(message.getSenderConnectionId(), connectionId))
                              .build()
                      )
                      .toList();

              WsMessage<Object> payload = WsMessage.builder()
                      .type(WsType.STATE)
                      .data(RoomState.builder()
                              .roomId(roomId)
                              .videoUrl(room.getVideoUrl())
                              .videoTimestamp(room.getVideoTimestamp())
                              .playing(room.isPlaying())
                              .users(roomUsers)
                              .messages(messages)
                              .build())
                      .build();

              broadcastToUser(connectionId, mapper.writeValueAsString(payload));
            });
  }

  private void broadcastToUser(String connectionId, String json) {
    if (connectionId == null) return;
    ConnectionToken client = getTokenInfo(connectionId);
    if (client == null) return;

    try {
      client.getSession().sendMessage(new TextMessage(json));
    } catch (Exception e) {
      log.warn("Failed to send message", e);

      if (client.getExpiresAt().isBefore(Instant.now())) {
        removeConnectionId(connectionId);
      } else {
        client.setConnected(false);
      }
    }
  }
}