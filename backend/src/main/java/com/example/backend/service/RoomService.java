package com.example.backend.service;

import com.example.backend.model.dto.ChatDto;
import com.example.backend.model.dto.JoinRoomDto;
import com.example.backend.model.dto.RoomUpdateDto;
import com.example.backend.model.entity.RoomEntity;
import com.example.backend.model.view.ChatView;
import com.example.backend.model.view.ErrorView;
import com.example.backend.model.view.WsMessage;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Service
@RequiredArgsConstructor
public class RoomService {

  private final RoomRepository roomRepository;
  private final ObjectMapper mapper;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(14);

  private final Map<String, WebSocketSession> sessionsByClientId = new ConcurrentHashMap<>();
  private final Map<WebSocketSession, String> sessionToClientId = new ConcurrentHashMap<>();

  private final Map<String, String> clientToRoom = new ConcurrentHashMap<>();
  private final Map<String, Set<String>> roomToClients = new ConcurrentHashMap<>();

  public void joinRoom(JoinRoomDto data, WebSocketSession session) {
    String clientId = data.getClientId();
    String roomId = data.getRoomId();

    RoomEntity entity = roomRepository.findById(roomId).orElse(null);

    if (entity == null) {
      roomRepository.save(RoomEntity.builder()
              .roomId(roomId)
              .adminId(clientId)
              .hashedPassword(passwordEncoder.encode(data.getRawPassword()))
              .videoUrl(null)
              .videoTimestamp(0L)
              .playing(false)
              .build());
    } else {
      if (!passwordEncoder.matches(data.getRawPassword(), entity.getHashedPassword())) {
        sendError(session, "Invalid password");
        return;
      }
    }

    removeSession(session);

    sessionsByClientId.put(clientId, session);
    sessionToClientId.put(session, clientId);

    clientToRoom.put(clientId, roomId);

    roomToClients
            .computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet())
            .add(clientId);
  }

  public void updateRoom(RoomUpdateDto data, WebSocketSession session) {
    String clientId = sessionToClientId.get(session);
    String roomId = clientToRoom.get(clientId);

    RoomEntity entity = roomRepository.findById(roomId).orElse(null);
    if (entity == null) return;

    if (!Objects.equals(entity.getAdminId(), clientId)) {
      sendError(session, "Unauthorized");
      return;
    }

    if (data.getVideoUrl() != null) entity.setVideoUrl(data.getVideoUrl());
    if (data.getVideoTimestamp() != null) entity.setVideoTimestamp(data.getVideoTimestamp());
    if (data.getPlaying() != null) entity.setPlaying(data.getPlaying());

    roomRepository.save(entity);

    RoomUpdateDto payload = RoomUpdateDto.builder()
            .videoUrl(entity.getVideoUrl())
            .videoTimestamp(entity.getVideoTimestamp())
            .playing(entity.isPlaying())
            .build();

    WsMessage message = WsMessage.builder()
            .type("STATE")
            .data(payload)
            .build();

    broadcastToRoom(roomId, message);
  }

  public void sendChatMessage(ChatDto data, WebSocketSession session) {
    String roomId = clientToRoom.get(sessionToClientId.get(session));
    if (roomId == null) return;

    ChatView payload = ChatView.builder()
            .text(data.getText())
            .ts(System.currentTimeMillis())
            .senderClientId(sessionToClientId.get(session))
            .build();

    WsMessage message = WsMessage.builder()
            .type("CHAT")
            .data(payload)
            .build();

    broadcastToRoom(roomId, message);
  }

  private void broadcastToRoom(String roomId, Object payload) {
    Set<String> clients = roomToClients.get(roomId);
    if (clients == null || clients.isEmpty()) return;

    for (String clientId : clients) {
      WebSocketSession session = sessionsByClientId.get(clientId);
      if (session != null) {
        send(session, payload);
      }
    }
  }

  private void sendError(WebSocketSession session, String message) {
    ErrorView payload = ErrorView.builder()
            .errorMessage(message)
            .build();

    WsMessage msg = WsMessage.builder()
            .type("ERROR")
            .data(payload)
            .build();

    send(session, msg);
  }

  private void send(WebSocketSession session, Object payload) {
    if (session == null || !session.isOpen()) return;

    try {
      String json = mapper.writeValueAsString(payload);
      session.sendMessage(new TextMessage(json));
    } catch (Exception e) {
      removeSession(session);
    }
  }

  public void removeSession(WebSocketSession session) {
    String clientId = sessionToClientId.remove(session);
    if (clientId == null) return;

    sessionsByClientId.remove(clientId);

    String roomId = clientToRoom.remove(clientId);
    if (roomId == null) return;

    Set<String> clients = roomToClients.get(roomId);
    if (clients != null) {
      clients.remove(clientId);
      if (clients.isEmpty()) {
        roomToClients.remove(roomId);
      }
    }
  }
}