package com.example.backend.room.controller;

import com.example.backend.room.model.dto.JoinRoomDto;
import com.example.backend.room.model.view.JoinRoomView;
import com.example.backend.room.service.RoomHTTPService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class RoomController {

  public final RoomHTTPService roomService;

  @PostMapping("/create")
  public ResponseEntity<JoinRoomView> createRoom() {
    return roomService.createRoom();
  }

  @PostMapping("/join")
  public ResponseEntity<?> joinRoom(@RequestBody JoinRoomDto data) {
    return roomService.joinRoom(data.getRoomId(), data.getRawPassword());
  }
}