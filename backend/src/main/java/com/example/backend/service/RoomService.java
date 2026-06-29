package com.example.backend.service;

import com.example.backend.model.ClientInfo;
import com.example.backend.model.RoomState;
import com.example.backend.model.dto.ChatDto;
import com.example.backend.model.dto.JoinRoomDto;
import com.example.backend.model.dto.RoomUpdateDto;
import com.example.backend.model.entity.RoomEntity;
import com.example.backend.model.view.*;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RoomService {

  private final RoomRepository roomRepository;
  private final ObjectMapper mapper;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(14);

  private final Map<WebSocketSession, ClientInfo> clients = new ConcurrentHashMap<>();
  private final Map<String, RoomState> rooms = new ConcurrentHashMap<>();

  public void joinRoom(JoinRoomDto data, WebSocketSession session) {
    RoomEntity entity = roomRepository.findById(data.getRoomId()).orElse(null);

    if (entity == null) {
      entity = roomRepository.save(RoomEntity.builder()
              .roomId(data.getRoomId())
              .adminId(data.getClientId())
              .hashedPassword(
                      data.getRawPassword() == null || data.getRawPassword().isBlank()
                              ? null
                              : passwordEncoder.encode(data.getRawPassword())
              )
              .videoUrl(null)
              .videoTimestamp(0L)
              .playing(false)
              .build());
    } else {
      if (entity.getHashedPassword() != null &&
              !passwordEncoder.matches(data.getRawPassword(), entity.getHashedPassword())) {
        sendError(session, "Invalid password");
        return;
      }
    }

    removeSession(session);

    clients.put(session, ClientInfo.builder()
            .clientId(data.getClientId())
            .name(data.getName())
            .roomId(data.getRoomId())
            .build());

    rooms.computeIfAbsent(data.getRoomId(), k -> new RoomState())
            .getSessions()
            .add(session);

    send(session, JoinRoomView.builder()
            .roomId(data.getRoomId())
            .adminId(entity.getAdminId())
            .build());

    broadcastUsers(data.getRoomId());
  }

  public void updateRoom(RoomUpdateDto data, WebSocketSession session) {
    ClientInfo client = clients.get(session);
    if (client == null) return;

    String roomId = client.getRoomId();
    RoomEntity entity = roomRepository.findById(roomId).orElse(null);
    if (entity == null) return;

    if (!Objects.equals(entity.getAdminId(), client.getClientId())) {
      sendError(session, "Unauthorized");
      return;
    }

    if (data.getVideoUrl() != null) entity.setVideoUrl(data.getVideoUrl());
    if (data.getVideoTimestamp() != null) entity.setVideoTimestamp(data.getVideoTimestamp());
    if (data.getPlaying() != null) entity.setPlaying(data.getPlaying());

    roomRepository.save(entity);

    WsMessage message = WsMessage.builder()
            .type("STATE")
            .data(RoomUpdateDto.builder()
                    .videoUrl(entity.getVideoUrl())
                    .videoTimestamp(entity.getVideoTimestamp())
                    .playing(entity.isPlaying())
                    .build())
            .build();

    broadcast(roomId, message);
  }

  public void sendChatMessage(ChatDto data, WebSocketSession session) {
    ClientInfo client = clients.get(session);
    if (client == null) return;

    String roomId = client.getRoomId();

    WsMessage message = WsMessage.builder()
            .type("CHAT")
            .data(ChatView.builder()
                    .text(data.getText())
                    .ts(System.currentTimeMillis())
                    .senderClientId(client.getClientId())
                    .build())
            .build();

    broadcast(roomId, message);
  }

  public void removeSession(WebSocketSession session) {
    ClientInfo client = clients.remove(session);
    if (client == null) return;

    RoomState state = rooms.get(client.getRoomId());
    if (state != null) {
      state.getSessions().remove(session);
      if (state.getSessions().isEmpty()) {
        rooms.remove(client.getRoomId());
      }
    }

    broadcastUsers(client.getRoomId());
  }

  private void broadcast(String roomId, Object payload) {
    RoomState state = rooms.get(roomId);
    if (state == null) return;

    for (WebSocketSession session : state.getSessions()) {
      send(session, payload);
    }
  }

  private void broadcastUsers(String roomId) {
    RoomState state = rooms.get(roomId);
    if (state == null) return;

    RoomEntity room = roomRepository.findById(roomId).orElse(null);
    if (room == null) return;

    List<UserView> users = state.getSessions().stream()
            .map(s -> {
              ClientInfo c = clients.get(s);
              if (c == null) return null;

              return UserView.builder()
                      .clientId(c.getClientId())
                      .name(c.getName())
                      .admin(Objects.equals(c.getClientId(), room.getAdminId()))
                      .build();
            })
            .filter(Objects::nonNull)
            .toList();

    broadcast(roomId, WsMessage.builder()
            .type("USERS")
            .data(UsersView.builder().users(users).build())
            .build());
  }

  private void sendError(WebSocketSession session, String message) {
    send(session, WsMessage.builder()
            .type("ERROR")
            .data(ErrorView.builder()
                    .errorMessage(message)
                    .build())
            .build());
  }

  private void send(WebSocketSession session, Object payload) {
    if (session == null || !session.isOpen()) return;

    try {
      session.sendMessage(new TextMessage(mapper.writeValueAsString(payload)));
    } catch (Exception e) {
      removeSession(session);
    }
  }
}