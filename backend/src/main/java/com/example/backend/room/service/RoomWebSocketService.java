package com.example.backend.room.service;

import com.example.backend.room.model.dto.ChatDto;
import com.example.backend.room.model.dto.ConnectRoomDto;
import com.example.backend.room.model.dto.RoomUpdateDto;
import com.example.backend.room.model.entity.ChatMessageEntity;
import com.example.backend.room.model.entity.RoomEntity;
import com.example.backend.room.repository.ChatMessageRepository;
import com.example.backend.room.repository.RoomRepository;
import com.example.backend.auth.model.ConnectionToken;
import com.example.backend.auth.service.ConnectionService;
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

  public void connectRoom(ConnectRoomDto data, WebSocketSession session) {
    ConnectionToken token = connectionService.getTokenInfo(data.getConnectionToken());

    RoomEntity entity = roomRepository.findById(token.getRoomId()).orElse(null);

    if (entity == null) {
      return;
    }

    token.setSession(session);
    token.setName(data.getName());

    connectionService.broadcastState(token.getRoomId());
  }

  public void updateRoom(RoomUpdateDto data, WebSocketSession session) {
    if (!connectionService.validateSession(data.getConnectionId(), session)) {
      return;
    }

    ConnectionToken client = connectionService.getTokenInfo(data.getConnectionId());

    RoomEntity room = roomRepository.findById(client.getRoomId()).orElse(null);
    if (room == null) return;

    if (data.getVideoUrl() != null) room.setVideoUrl(data.getVideoUrl());
    if (data.getVideoTimestamp() != null) room.setVideoTimestamp(data.getVideoTimestamp());
    if (data.getPlaying() != null) room.setPlaying(data.getPlaying());

    roomRepository.save(room);

    connectionService.broadcastState(room.getRoomId());
  }

  public void sendChatMessage(ChatDto data, WebSocketSession session) {
    if (!connectionService.validateSession(data.getConnectionId(), session)) {
      return;
    }

    ConnectionToken client = connectionService.getTokenInfo(data.getConnectionId());

    ChatMessageEntity message = ChatMessageEntity.builder()
            .roomId(client.getRoomId())
            .senderName(client.getName())
            .text(data.getText())
            .ts(System.currentTimeMillis())
            .build();

    messageRepository.save(message);

    sessionManager.broadcastState(client.getRoomId());
  }

}
