package com.example.backend;

import com.example.backend.service.MessageService;
import com.example.backend.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {

  private final MessageService messageService;
  private final RoomService roomService;

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) {
    System.out.println("RAW WS MESSAGE: " + message);
    messageService.handle(message.getPayload(), session);
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
    System.out.println("WS CLOSED. Session ID " + session.getId() + " Status: " + status);
    roomService.removeSession(session);
  }
}