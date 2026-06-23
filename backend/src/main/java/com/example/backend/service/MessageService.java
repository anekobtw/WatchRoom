package com.example.backend.service;

import com.example.backend.model.dto.ChatDto;
import com.example.backend.model.dto.JoinRoomDto;
import com.example.backend.model.dto.RoomUpdateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class MessageService {

  private final RoomService roomService;
  private final ObjectMapper mapper;

  public void handle(String message, WebSocketSession session) {
    try {
      JsonNode node = mapper.readTree(message);

      String type = node.has("type") ? node.get("type").asText() : null;
      JsonNode data = node.get("data");

      if (type == null) return;

      switch (type) {
        case "JOIN" -> {
          if (data == null) return;
          JoinRoomDto dto = mapper.treeToValue(data, JoinRoomDto.class);
          if (dto.getClientId() == null || dto.getRoomId() == null) return;
          roomService.joinRoom(dto, session);
        }

        case "UPDATE" -> {
          if (data == null) return;
          roomService.updateRoom(mapper.treeToValue(data, RoomUpdateDto.class), session);
        }

        case "CHAT" -> {
          if (data == null) return;
          roomService.sendChatMessage(mapper.treeToValue(data, ChatDto.class), session);
        }

        case "LEAVE" -> roomService.removeSession(session);
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}