package com.example.backend.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClientInfo {
  private String clientId;
  private String name;
  private String roomId;
}
