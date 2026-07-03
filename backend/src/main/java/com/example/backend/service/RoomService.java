package com.example.backend.service;

import com.example.backend.model.ClientInfo;
import com.example.backend.model.dto.ChatDto;
import com.example.backend.model.dto.JoinRoomDto;
import com.example.backend.model.dto.RoomUpdateDto;
import com.example.backend.model.entity.MessageEntity;
import com.example.backend.model.entity.RoomEntity;
import com.example.backend.model.view.*;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RoomService {

  private final RoomRepository roomRepository;
  private final MessageRepository messageRepository;
  private final SessionManager sessionManager;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(14);

  public void joinRoom(JoinRoomDto data, WebSocketSession session) {
    RoomEntity entity = roomRepository.findById(data.getRoomId()).orElse(null);

    if (entity == null) {
      roomRepository.save(RoomEntity.builder()
              .roomId(data.getRoomId())
              .adminId(data.getClientId())
              .hashedPassword(passwordEncoder.encode(data.getRawPassword()))
              .videoUrl(null)
              .videoTimestamp(0L)
              .playing(false)
              .build());
    } else {
      if (entity.getHashedPassword() != null && !passwordEncoder.matches(data.getRawPassword(), entity.getHashedPassword())) {
        return;
      }
    }

    sessionManager.joinRoom(session, data.getRoomId(), data.getClientId(), data.getName());

    sessionManager.broadcastState(data.getRoomId());
  }

  public void updateRoom(RoomUpdateDto data, WebSocketSession session) {
    if (sessionManager.validateAdmin(session)) {
      return;
    }

    ClientInfo client = sessionManager.getClientInfo(session);
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

    MessageEntity message = MessageEntity.builder()
            .room(roomRepository.findById(client.getRoomId()).orElse(null))
            .text(data.getText())
            .ts(System.currentTimeMillis())
            .senderClientId(client.getClientId())
            .build();

    messageRepository.save(message);

    sessionManager.broadcastState(client.getRoomId());
  }
}