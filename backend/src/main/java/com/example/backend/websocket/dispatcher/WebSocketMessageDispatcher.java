package com.example.backend.websocket.dispatcher;

import com.example.backend.model.dto.ChatDto;
import com.example.backend.model.dto.ConnectRoomDto;
import com.example.backend.model.dto.RoomUpdateDto;
import com.example.backend.model.websocket.ConnectionToken;
import com.example.backend.model.websocket.WsMessage;
import com.example.backend.service.ConnectionService;
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
  private final ConnectionService connectionService;
  private final ObjectMapper mapper;

  public void handle(String message, WebSocketSession session) {
    try {
      WsMessage<JsonNode> msg = mapper.readValue(message, new TypeReference<>() {});
      ConnectionToken connectionToken = connectionService.getTokenInfo(msg.getConnectionId());

      switch (msg.getType()) {
        case CONNECT -> {
          roomService.connectRoom(mapper.treeToValue(msg.getData(), ConnectRoomDto.class), connectionToken, session);
        }

        case UPDATE -> {
          roomService.updateRoom(mapper.treeToValue(msg.getData(), RoomUpdateDto.class), connectionToken, session);
        }

        case CHAT -> {
          roomService.sendChatMessage(mapper.treeToValue(msg.getData(), ChatDto.class), connectionToken, session);
        }

        case LEAVE -> {
          connectionService.removeConnectionId(connectionService.getTokenInfo(session).getConnectionId());
          connectionService.queueBroadcast(connectionToken.getRoomId());
        }
      }

    } catch (Exception e) {
      log.error("Failed to process WS message: {}", message, e);
    }
  }
}