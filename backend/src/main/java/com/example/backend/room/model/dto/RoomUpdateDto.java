package com.example.backend.room.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomUpdateDto {
  private String videoUrl;
  private Long videoTimestamp;
  private Boolean playing;
}
