package com.example.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "rooms")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RoomEntity {

  @Id
  @Column(name = "room_id")
  private String roomId;

  private String videoUrl;
  private long videoTimestamp;
  private boolean playing;
}