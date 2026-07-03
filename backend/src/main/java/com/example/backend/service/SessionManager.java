package com.example.backend.service;

import com.example.backend.model.ClientInfo;
import com.example.backend.model.entity.RoomEntity;
import com.example.backend.model.view.RoomStateView;
import com.example.backend.model.view.WsMessage;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionManager {

  private final RoomRepository roomRepository;
  private final MessageRepository messageRepository;
  private final ObjectMapper mapper;

  private final Map<WebSocketSession, ClientInfo> clients = new ConcurrentHashMap<>();
  private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
  private final Map<String, Set<ClientInfo>> rooms = new ConcurrentHashMap<>();

  public boolean validateAdmin(WebSocketSession session) {
    ClientInfo client = clients.get(session);
    if (client == null) return false;

    RoomEntity room = roomRepository.findById(client.getRoomId()).orElse(null);
    if (room == null) return false;

    return room.getAdminId().equals(client.getClientId());
  }

  public ClientInfo getClientInfo(WebSocketSession session) {
    return clients.get(session);
  }

  public void joinRoom(WebSocketSession session, String roomId, String clientId, String name) {

    removeSession(session);

    ClientInfo client = ClientInfo.builder()
            .clientId(clientId)
            .name(name)
            .roomId(roomId)
            .build();

    clients.put(session, client);
    sessions.put(clientId, session);

    rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet())
            .add(client);
  }

  public void removeSession(WebSocketSession session) {
    ClientInfo client = clients.remove(session);
    if (client == null) return;

    sessions.remove(client.getClientId());

    Set<ClientInfo> state = rooms.get(client.getRoomId());
    if (state != null) {
      state.remove(client);
    }
  }

  public void broadcastState(String roomId) {
    RoomEntity room = roomRepository.findById(roomId).orElse(null);
    if (room == null) return;

    Set<ClientInfo> state = rooms.get(roomId);

    broadcastToRoom(roomId, WsMessage.builder()
            .type("STATE")
            .data(RoomStateView.builder()
                    .roomId(roomId)
                    .videoUrl(room.getVideoUrl())
                    .videoTimestamp(room.getVideoTimestamp())
                    .playing(room.isPlaying())
                    .users(state)
                    .messages(messageRepository.findTop100ByRoomOrderByTsDesc(room))
                    .build())
            .build());
  }

  private void broadcastToRoom(String roomId, Object payload) {
    Set<ClientInfo> state = rooms.get(roomId);
    if (state == null) return;

    for (ClientInfo client : state) {
      WebSocketSession session = sessions.get(client.getClientId());
      broadcastToUser(session, payload);
    }
  }

  private void broadcastToUser(WebSocketSession session, Object payload) {
    if (session == null || !session.isOpen()) return;

    try {
      session.sendMessage(new TextMessage(mapper.writeValueAsString(payload)));
    } catch (Exception e) {
      removeSession(session);
    }
  }
}