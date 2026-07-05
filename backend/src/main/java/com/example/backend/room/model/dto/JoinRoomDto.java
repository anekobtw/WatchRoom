package com.example.backend.room.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JoinRoomDto {
  private String roomId;
  private String clientId;
  private String rawPassword;
}
