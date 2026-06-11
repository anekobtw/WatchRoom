package com.example.backend;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SocketSessionManager {

  private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

  public void add(WebSocketSession session) {
    sessions.add(session);
  }

  public void remove(WebSocketSession session) {
    sessions.remove(session);
  }
}