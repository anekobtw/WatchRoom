package com.example.backend.websocket.session;

import com.example.backend.websocket.model.RoomState;
import com.example.backend.room.model.entity.RoomEntity;
import com.example.backend.websocket.model.WsMessage;
import com.example.backend.room.repository.ChatMessageRepository;
import com.example.backend.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SessionManager {
  private final RoomRepository roomRepository;
  private final ChatMessageRepository messageRepository;
  private final ObjectMapper mapper;

  private final Map<WebSocketSession, ClientInfo> sessions = new ConcurrentHashMap<>();

  public boolean validateAdmin(WebSocketSession session) {
    ClientInfo client = sessions.get(session);
    if (client == null) return false;

    return roomRepository.findById(client.getRoomId())
            .map(room -> room.getAdminId().equals(client.getClientId()))
            .orElse(false);
  }

  public ClientInfo getClientInfo(WebSocketSession session) {
    return sessions.get(session);
  }

  public void addSession(WebSocketSession session, String roomId, String clientId, String name) {
    removeSession(session);

    ClientInfo client = ClientInfo.builder()
            .clientId(clientId)
            .name(name)
            .roomId(roomId)
            .build();

    sessions.put(session, client);
  }

  public void removeSession(WebSocketSession session) {
    sessions.remove(session);
  }

  public void broadcastState(String roomId) {
    RoomEntity room = roomRepository.findById(roomId).orElse(null);
    if (room == null) return;

    Set<ClientInfo> roomUsers = sessions.values().stream()
            .filter(client -> client.getRoomId().equals(roomId))
            .collect(Collectors.toSet());

    WsMessage message = WsMessage.builder()
            .type("STATE")
            .data(RoomState.builder()
                    .roomId(roomId)
                    .videoUrl(room.getVideoUrl())
                    .videoTimestamp(room.getVideoTimestamp())
                    .playing(room.isPlaying())
                    .users(roomUsers)
                    .messages(messageRepository.findTop100ByRoomIdOrderByTsDesc(room.getRoomId()))
                    .build())
            .build();

    broadcastToRoom(roomId, message);
  }

  private void broadcastToRoom(String roomId, Object payload) {
    String json = mapper.writeValueAsString(payload);

    sessions.entrySet().stream()
            .filter(e -> e.getValue().getRoomId().equals(roomId))
            .forEach(e -> broadcastToUser(e.getKey(), json));
  }

  private void broadcastToUser(WebSocketSession session, String json) {
    if (session == null || !session.isOpen()) return;

    try {
      session.sendMessage(new TextMessage(json));
    } catch (Exception e) {
      log.warn("Failed to send message to session", e);
      removeSession(session);
    }
  }
}