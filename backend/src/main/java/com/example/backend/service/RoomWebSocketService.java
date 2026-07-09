package com.example.backend.service;

import com.example.backend.model.dto.ChatDto;
import com.example.backend.model.dto.ConnectRoomDto;
import com.example.backend.model.dto.RoomUpdateDto;
import com.example.backend.model.entity.ChatMessageEntity;
import com.example.backend.model.entity.RoomEntity;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.RoomRepository;
import com.example.backend.model.websocket.ConnectionToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

@Service
@RequiredArgsConstructor
public class RoomWebSocketService {

  private final ConnectionService connectionService;
  private final RoomRepository roomRepository;
  private final ConnectionService sessionManager;
  private final ChatMessageRepository messageRepository;

  public void connectRoom(ConnectRoomDto data, ConnectionToken connectionToken, WebSocketSession session) {
    if (connectionToken == null || !data.getRoomId().equals(connectionToken.getRoomId())) {
      try {
        session.close();
      } catch (Exception ignored) {
      }
      return;
    }

    RoomEntity entity = roomRepository.findById(connectionToken.getRoomId()).orElse(null);

    if (entity == null) {
      try {
        session.close();
      } catch (Exception ignored) {
      }
      return;
    }

    connectionToken.setSession(session);
    connectionToken.setName(data.getName());
    connectionToken.setConnected(true);

    connectionService.queueBroadcast(connectionToken.getRoomId());
  }

  public void updateRoom(RoomUpdateDto data, ConnectionToken connectionToken, WebSocketSession session) {
    if (!connectionService.validateSession(connectionToken.getConnectionId(), session)) {
      return;
    }

    RoomEntity room = roomRepository.findById(connectionToken.getRoomId()).orElse(null);
    if (room == null) return;

    if (data.getVideoUrl() != null) room.setVideoUrl(data.getVideoUrl());
    if (data.getVideoTimestamp() != null) room.setVideoTimestamp(data.getVideoTimestamp());
    if (data.getPlaying() != null) room.setPlaying(data.getPlaying());

    roomRepository.save(room);

    connectionService.queueBroadcast(room.getRoomId());
  }

  public void sendChatMessage(ChatDto data, ConnectionToken connectionToken, WebSocketSession session) {
    if (!connectionService.validateSession(connectionToken.getConnectionId(), session)) {
      return;
    }

    ChatMessageEntity message = ChatMessageEntity.builder()
            .roomId(connectionToken.getRoomId())
            .senderConnectionId(connectionToken.getConnectionId())
            .senderName(connectionToken.getName())
            .text(data.getText())
            .ts(System.currentTimeMillis())
            .build();

    messageRepository.save(message);

    sessionManager.queueBroadcast(connectionToken.getRoomId());
  }
}
