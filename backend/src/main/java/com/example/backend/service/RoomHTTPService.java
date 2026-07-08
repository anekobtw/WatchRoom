package com.example.backend.service;

import com.example.backend.model.entity.RoomEntity;
import com.example.backend.model.view.JoinRoomView;
import com.example.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;

@Service
@RequiredArgsConstructor
public class RoomHTTPService {

  private final RoomRepository roomRepository;
  private final ConnectionService connectionService;

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

  public ResponseEntity<?> joinRoom(String roomId) {
    if (!roomId.matches("^[A-Z0-9]{6}$")) {
      return ResponseEntity.badRequest().body("Room ID must be exactly 6 characters long and contain only uppercase English letters and digits.");
    }

    RoomEntity entity = roomRepository.findById(roomId).orElse(null);

    if (entity == null) {
      return ResponseEntity.notFound().build();
    }

    return ResponseEntity.ok(JoinRoomView.builder()
            .roomId(roomId)
            .connectionId(connectionService.issueConnectionId(null, null, roomId))
            .build());
  }
}
