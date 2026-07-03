package com.example.backend;

import com.example.backend.service.MessageService;
import com.example.backend.service.SessionManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j
@Component
@RequiredArgsConstructor
public class SocketHandler extends TextWebSocketHandler {

  private final MessageService messageService;
  private final SessionManager sessionManager;

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) {
    log.info("RAW WS MESSAGE: {}", message);
    messageService.handle(message.getPayload(), session);
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
    log.info("WS CLOSED. Session ID {} Status: {}", session.getId(), status);
    sessionManager.removeSession(session);
  }
}