package com.example.backend.service;

import com.example.backend.model.dto.RoomChatDto;
import com.example.backend.model.dto.RoomConnectDto;
import com.example.backend.model.dto.RoomUpdateDto;
import com.example.backend.model.entity.ChatMessage;
import com.example.backend.model.entity.RoomEntity;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class RoomWebSocketService {

  private final RoomRepository roomRepository;
  private final WebSocketBroadcastService webSocketBroadcastService;

  private Map<String, Set<WebSocketSession>> rooms = new ConcurrentHashMap<>();
  private Map<String, List<ChatMessage>> messages = new ConcurrentHashMap<>();

  public void connectRoom(RoomConnectDto data, WebSocketSession session) {
    session.getAttributes().put("userId", data.getUserId());
    session.getAttributes().put("roomId", data.getRoomId());
    // TODO: change the default username
    session.getAttributes().put("userName", "John Doe");

    String roomId = data.getRoomId();

    RoomEntity entity = roomRepository.findById(roomId).orElse(null);

    if (entity == null) {
      try {
        session.close();
      } catch (IOException ignored) {
      }
      return;
    }

    rooms.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);

    webSocketBroadcastService.scheduleSync(roomId, rooms.get(roomId), null, messages.get(roomId));
  }

  public void updateRoom(RoomUpdateDto data, WebSocketSession session) {
    String roomId = session.getAttributes().get("roomId").toString();
    RoomEntity room = roomRepository.findById(roomId).orElse(null);
    if (room == null) return;

    System.out.println("UPDATE REQUEST user=" + session.getAttributes().get("userId") + " room=" + roomId);
    System.out.println("Admin=" + room.getAdminId());

    if (!room.getAdminId().equals(session.getAttributes().get("userId"))) {
      return;
    }

    if (data.getVideoUrl() != null) room.setVideoUrl(data.getVideoUrl());
    if (data.getVideoTimestamp() != null) room.setVideoTimestamp(data.getVideoTimestamp());
    if (data.getPlaying() != null) room.setPlaying(data.getPlaying());

    roomRepository.save(room);

    webSocketBroadcastService.scheduleSync(roomId, rooms.get(roomId), session.getAttributes().get("userName").toString(), messages.get(roomId));
  }

  public void sendChatMessage(RoomChatDto data, WebSocketSession session) {
    ChatMessage message = ChatMessage.builder()
            .userId(session.getAttributes().get("userId").toString())
            .userName(session.getAttributes().get("userName").toString())
            .text(data.getText())
            .ts(System.currentTimeMillis())
            .build();

    String roomId = session.getAttributes().get("roomId").toString();
    messages.get(roomId).add(message);

    webSocketBroadcastService.scheduleSync(roomId, rooms.get(roomId), null, messages.get(roomId));
  }

  public void leaveRoom(WebSocketSession session) {
    String roomId = session.getAttributes().get("roomId").toString();
    if (roomId == null) return;

    Set<WebSocketSession> sessions = rooms.get(roomId);
    if (sessions == null) return;

    sessions.remove(session);

    if (sessions.isEmpty()) {
      rooms.remove(roomId);
    } else {
      webSocketBroadcastService.scheduleSync(roomId, rooms.get(roomId), null, messages.get(roomId));
    }

    session.getAttributes().remove("roomId");
  }
}
