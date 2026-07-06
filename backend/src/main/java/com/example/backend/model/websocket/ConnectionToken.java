package com.example.backend.model.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.socket.WebSocketSession;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConnectionToken {
  private String connectionId;
  private WebSocketSession session;
  private String name;
  private String roomId;
  private Instant expiresAt;
  private boolean connected;
}
