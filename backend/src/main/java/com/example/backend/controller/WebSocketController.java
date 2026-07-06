package com.example.backend.controller;

import com.example.backend.websocket.dispatcher.WebSocketMessageDispatcher;
import com.example.backend.service.ConnectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketController extends TextWebSocketHandler {

  private final WebSocketMessageDispatcher webSocketMessageDispatcher;
  private final ConnectionService connectionService;

  @Override
  protected void handleTextMessage(WebSocketSession session, TextMessage message) {
    log.info("RAW WS MESSAGE: {}", message);
    webSocketMessageDispatcher.handle(message.getPayload(), session);
  }

  @Override
  public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
    log.info("WS CLOSED. Session ID {} Status: {}", session.getId(), status);
    connectionService.closeConnection(session);
  }
}