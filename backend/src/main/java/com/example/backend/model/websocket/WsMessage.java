package com.example.backend.model.websocket;

import com.example.backend.model.enums.WsType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WsMessage<T> {
  private WsType type;
  private String connectionId;
  private T data;
}
