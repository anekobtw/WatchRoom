package com.example.backend.room.service;

import com.example.backend.auth.model.ConnectionToken;
import com.example.backend.auth.service.ConnectionTokenService;
import com.example.backend.room.model.dto.ChatDto;
import com.example.backend.room.model.dto.ConnectRoomDto;
import com.example.backend.room.model.dto.RoomUpdateDto;
import com.example.backend.room.model.entity.ChatMessageEntity;
import com.example.backend.room.model.entity.RoomEntity;
import com.example.backend.room.repository.ChatMessageRepository;
import com.example.backend.room.repository.RoomRepository;
import com.example.backend.websocket.session.ClientInfo;
import com.example.backend.websocket.session.SessionManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

@Service
@RequiredArgsConstructor
public class RoomWebSocketService {

  private final ConnectionTokenService joinTokenService;
  private final RoomRepository roomRepository;
  private final SessionManager sessionManager;
  private final ChatMessageRepository messageRepository;

  public void connectRoom(ConnectRoomDto data, WebSocketSession session) {
    ConnectionToken token = joinTokenService.consume(data.getJoinToken());

    RoomEntity entity = roomRepository.findById(token.roomId()).orElse(null);

    if (entity == null) {
      return;
    }

    sessionManager.addSession(
            session,
            token.roomId(),
            token.clientId(),
            data.getName()
    );

    sessionManager.broadcastState(token.roomId());
  }

  public void updateRoom(RoomUpdateDto data, WebSocketSession session) {
    if (!sessionManager.validateAdmin(session)) {
      return;
    }

    ClientInfo client = sessionManager.getClientInfo(session);
    if (client == null) return;
    RoomEntity room = roomRepository.findById(client.getRoomId()).orElse(null);
    if (room == null) return;

    if (data.getVideoUrl() != null) room.setVideoUrl(data.getVideoUrl());
    if (data.getVideoTimestamp() != null) room.setVideoTimestamp(data.getVideoTimestamp());
    if (data.getPlaying() != null) room.setPlaying(data.getPlaying());

    roomRepository.save(room);

    sessionManager.broadcastState(room.getRoomId());
  }

  public void sendChatMessage(ChatDto data, WebSocketSession session) {
    ClientInfo client = sessionManager.getClientInfo(session);
    if (client == null) return;

    ChatMessageEntity message = ChatMessageEntity.builder()
            .roomId(client.getRoomId())
            .text(data.getText())
            .ts(System.currentTimeMillis())
            .senderClientId(client.getClientId())
            .build();

    messageRepository.save(message);

    sessionManager.broadcastState(client.getRoomId());
  }

}
