package com.example.backend.room.service;

import com.example.backend.auth.service.ConnectionTokenService;
import com.example.backend.room.model.entity.RoomEntity;
import com.example.backend.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RoomHTTPService {

  private final RoomRepository roomRepository;
  private final PasswordEncoder passwordEncoder;
  private final ConnectionTokenService joinTokenService;

  public ResponseEntity<String> createRoom(String roomId, String clientId) {
    if (!roomId.matches("^[A-Z0-9]{6}$")) {
      return ResponseEntity.badRequest().body("Room ID must be exactly 6 characters long and contain only uppercase English letters and digits.");
    }

    if (roomRepository.existsById(roomId)) {
      return ResponseEntity.status(HttpStatus.CONFLICT).body("A room with this Room ID already exists");
    }

    roomRepository.save(RoomEntity.builder()
            .roomId(roomId)
            .adminId(clientId)
            .hashedPassword(null)
            .videoTimestamp(0L)
            .videoUrl(null)
            .playing(false)
            .build()
    );

    return ResponseEntity.ok(joinTokenService.issue(roomId, clientId));
  }

  public ResponseEntity<String> joinRoom(String roomId, String clientId, String rawPassword) {
    if (!roomId.matches("^[A-Z0-9]{6}$")) {
      return ResponseEntity.badRequest().body("Room ID must be exactly 6 characters long and contain only uppercase English letters and digits.");
    }

    RoomEntity entity = roomRepository.findById(roomId).orElse(null);

    if (entity == null) {
      return ResponseEntity.notFound().build();
    }

    if (entity.getHashedPassword() == null) {
      return ResponseEntity.ok(joinTokenService.issue(roomId, clientId));
    }

    if (rawPassword == null) {
      return ResponseEntity.badRequest().body("No password was provided, but the room is password protected.");
    }

    if (passwordEncoder.matches(rawPassword, entity.getHashedPassword())) {
      return ResponseEntity.ok(joinTokenService.issue(roomId, clientId));
    } else {
      return ResponseEntity.badRequest().body("The password is incorrect.");
    }
  }
}