package com.example.backend.service;

import com.example.backend.model.entity.RoomEntity;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class RoomHTTPService {

  private final RoomRepository roomRepository;

  private final SecureRandom random = new SecureRandom();

  private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  public String generateRandomId() {
    StringBuilder sb = new StringBuilder(6);
    for (int i = 0; i < 6; i++) {
      sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
    }
    return sb.toString();
  }

  public ResponseEntity<String> createRoom(String adminId) {
    String roomId;
    do {
      roomId = generateRandomId();
    } while (roomRepository.existsById(roomId));

    roomRepository.save(RoomEntity.builder()
            .roomId(roomId)
            .adminId(adminId)
            .videoTimestamp(0L)
            .videoUrl(null)
            .playing(false)
            .build()
    );

    return ResponseEntity.ok(roomId);
  }
}
