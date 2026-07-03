package com.example.backend.service;

import com.example.backend.model.dto.ChatDto;
import com.example.backend.model.dto.JoinRoomDto;
import com.example.backend.model.dto.RoomUpdateDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {

  private final RoomService roomService;
  private final ObjectMapper mapper;

  public void handle(String message, WebSocketSession session) {
    try {
      JsonNode node = mapper.readTree(message);

      String type = node.has("type") ? node.get("type").asString() : null;
      JsonNode data = node.get("data");

      if (type == null || data == null) {
        log.warn("Invalid WS message: {}", message);
        return;
      }

      switch (type) {
        case "JOIN" -> {
          roomService.joinRoom(mapper.treeToValue(data, JoinRoomDto.class), session);
        }

        case "UPDATE" -> {
          roomService.updateRoom(mapper.treeToValue(data, RoomUpdateDto.class), session);
        }

        case "CHAT" -> {
          roomService.sendChatMessage(mapper.treeToValue(data, ChatDto.class), session);
        }
      }

    } catch (Exception e) {
      log.error("Failed to process WS message: {}", message, e);
    }
  }
}