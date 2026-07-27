package com.example.backend.websocket.dispatcher;

import com.example.backend.model.dto.RoomChatDto;
import com.example.backend.model.dto.RoomConnectDto;
import com.example.backend.model.dto.RoomUpdateDto;
import com.example.backend.model.websocket.WsMessage;
import com.example.backend.service.RoomWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketMessageDispatcher {

  private final RoomWebSocketService roomService;
  private final ObjectMapper mapper;

  public void handle(String message, WebSocketSession session) {
    try {
      WsMessage<JsonNode> msg = mapper.readValue(message, new TypeReference<>() {});

      switch (msg.getType()) {
        case CONNECT -> {
          roomService.connectRoom(mapper.treeToValue(msg.getData(), RoomConnectDto.class), session);
        }

        case UPDATE -> {
          roomService.updateRoom(mapper.treeToValue(msg.getData(), RoomUpdateDto.class), session);
        }

        case CHAT -> {
          roomService.sendChatMessage(mapper.treeToValue(msg.getData(), RoomChatDto.class), session);
        }

        case LEAVE -> {
          roomService.leaveRoom(session);
        }
      }

    } catch (Exception e) {
      log.error("Failed to process WS message: {}", message, e);
    }
  }
}