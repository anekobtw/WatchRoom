package com.example.backend.service;

import com.example.backend.model.MessageDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class MessageService {

  private final RoomService roomService;
  private final ObjectMapper mapper;

  public void handle(String message, WebSocketSession session) {
    try {
      MessageDto data = mapper.readValue(message, MessageDto.class);
      if (data == null || data.getRoomId() == null || data.getType() == null) return;

      switch (data.getType()) {
        case "JOIN" -> roomService.joinRoom(data.getRoomId(), session);
        case "LEAVE" -> roomService.removeSession(session);

        case "SET_STATE" -> roomService.updateRoom(data);

        default -> {}
      }
    } catch (Exception e) {
      e.printStackTrace();
    }
  }
}
