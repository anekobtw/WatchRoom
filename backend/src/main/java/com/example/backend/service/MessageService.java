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
      String type = node.get("type").asString();
      JsonNode data = node.get("data");

      switch (type) {
        case "JOIN" -> {
          roomService.joinRoom(mapper.treeToValue(data, JoinRoomDto.class), session);
        }

        case "UPDATE" -> {
          roomService.updateRoom(mapper.treeToValue(data, RoomUpdateDto.class), session);
        }

        case "CHAT" -> {;
          roomService.sendChatMessage(mapper.treeToValue(data, ChatDto.class), session);
        }

        case "LEAVE" -> {
          roomService.removeSession(session);
        }

        default -> {
        }
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
