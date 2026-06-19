package com.example.backend.service;

import com.example.backend.model.JoinRoomDto;
import com.example.backend.model.StateUpdateDto;
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

      switch (type) {
        case "JOIN" -> {
          JoinRoomDto data = mapper.treeToValue(node, JoinRoomDto.class);
          roomService.joinRoom(data.getRoomId(), session);
        }

        case "LEAVE" -> {
          roomService.removeSession(session);
        }

        case "SET_STATE" -> {
          StateUpdateDto data = mapper.treeToValue(node, StateUpdateDto.class);
          roomService.updateRoom(data, session);
        }

        default -> {
        }
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
