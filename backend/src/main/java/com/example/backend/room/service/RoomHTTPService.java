package com.example.backend.room.service;

import com.example.backend.auth.service.ConnectionService;
import com.example.backend.room.model.entity.RoomEntity;
import com.example.backend.room.model.view.JoinRoomView;
import com.example.backend.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class RoomHTTPService {

  private final RoomRepository roomRepository;
  private final ConnectionService connectionService;

  private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
  private final SecureRandom random = new SecureRandom();

  private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  public String generateRandomId() {
    StringBuilder sb = new StringBuilder(6);
    for (int i = 0; i < 6; i++) {
      sb.append(CHARS.charAt(random.nextInt(CHARS.length())));
    }
    return sb.toString();
  }

  public ResponseEntity<JoinRoomView> createRoom() {
    String roomId;
    do {
      roomId = generateRandomId();
    } while (roomRepository.existsById(roomId));

    String connectionId = connectionService.issueConnectionId(null, null, roomId);

    roomRepository.save(RoomEntity.builder()
            .roomId(roomId)
            .adminConnectionId(connectionId)
            .hashedPassword(null)
            .videoTimestamp(0L)
            .videoUrl(null)
            .playing(false)
            .build()
    );

    return ResponseEntity.ok(JoinRoomView.builder()
            .connectionId(connectionId)
            .roomId(roomId)
            .build()
    );
  }

  public ResponseEntity<?> joinRoom(String roomId, String rawPassword) {
    if (!roomId.matches("^[A-Z0-9]{6}$")) {
      return ResponseEntity.badRequest().body("Room ID must be exactly 6 characters long and contain only uppercase English letters and digits.");
    }

    RoomEntity entity = roomRepository.findById(roomId).orElse(null);

    if (entity == null) {
      return ResponseEntity.notFound().build();
    }

    if (entity.getHashedPassword() == null) {
      return ResponseEntity.ok(JoinRoomView.builder()
              .roomId(roomId)
              .connectionId(connectionService.issueConnectionId(null, null, roomId))
              .build());
    }

    if (rawPassword == null) {
      return ResponseEntity.badRequest().body("No password was provided, but the room is password protected.");
    }

    if (passwordEncoder.matches(rawPassword, entity.getHashedPassword())) {
      return ResponseEntity.ok(JoinRoomView.builder()
              .roomId(roomId)
              .connectionId(connectionService.issueConnectionId(null, null, roomId))
              .build());
    } else {
      return ResponseEntity.badRequest().body("The password is incorrect.");
    }
  }
}