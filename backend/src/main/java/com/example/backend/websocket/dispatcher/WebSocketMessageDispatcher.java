package com.example.backend.websocket.dispatcher;

import com.example.backend.model.dto.ChatDto;
import com.example.backend.model.dto.ConnectRoomDto;
import com.example.backend.model.dto.RoomUpdateDto;
import com.example.backend.model.websocket.ConnectionToken;
import com.example.backend.service.ConnectionService;
import com.example.backend.service.RoomWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketMessageDispatcher {

  private final RoomWebSocketService roomService;
  private final ConnectionService connectionService;
  private final ObjectMapper mapper;

  public void handle(String message, WebSocketSession session) {
    try {
      JsonNode node = mapper.readTree(message);

      String type = node.get("type").asString();
      String connectionId = node.get("connectionId").asString();
      ConnectionToken connectionToken = connectionService.getTokenInfo(connectionId);
      JsonNode data = node.get("data");

      if (type == null || data == null || connectionId == null) {
        log.warn("Invalid WS message: {}", message);
        return;
      }

      switch (type) {
        case "CONNECT" -> {
          roomService.connectRoom(mapper.treeToValue(data, ConnectRoomDto.class), connectionToken, session);
        }

        case "UPDATE" -> {
          roomService.updateRoom(mapper.treeToValue(data, RoomUpdateDto.class), connectionToken, session);
        }

        case "CHAT" -> {
          roomService.sendChatMessage(mapper.treeToValue(data, ChatDto.class), connectionToken, session);
        }
      }

    } catch (Exception e) {
      log.error("Failed to process WS message: {}", message, e);
    }
  }
}