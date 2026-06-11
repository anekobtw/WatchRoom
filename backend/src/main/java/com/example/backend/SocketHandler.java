package com.example.backend;

import com.example.backend.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {

  private final MessageService messageService;

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) {
    messageService.handle(message.getPayload(), session);
  }
}