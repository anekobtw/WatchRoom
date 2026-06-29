package com.example.backend.model;

import lombok.Data;
import org.springframework.web.socket.WebSocketSession;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Data
public class RoomState {
  private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

  public void add(WebSocketSession session) {
    sessions.add(session);
  }

  public void remove(WebSocketSession session) {
    sessions.remove(session);
  }

  public boolean isEmpty() {
    return sessions.isEmpty();
  }
}
