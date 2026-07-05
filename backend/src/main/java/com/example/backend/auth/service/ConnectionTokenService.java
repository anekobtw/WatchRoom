package com.example.backend.auth.service;

import com.example.backend.auth.model.ConnectionToken;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConnectionTokenService {

  private final Map<String, ConnectionToken> tokens = new ConcurrentHashMap<>();

  public String issue(String roomId, String clientId) {
    String token = UUID.randomUUID().toString();

    tokens.put(token, new ConnectionToken(
            roomId,
            clientId,
            Instant.now().plusSeconds(60)
    ));

    return token;
  }

  public ConnectionToken consume(String token) {
    ConnectionToken value = tokens.get(token);

    if (value == null) {
      return null;
    }

    if (value.expiresAt().isBefore(Instant.now())) {
      tokens.remove(token);
      return null;
    }

    tokens.remove(token);

    return value;
  }
}