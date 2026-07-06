package com.example.backend.model.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WsMessage {
  private String type;
  private String connectionId;
  private Object data;
}
