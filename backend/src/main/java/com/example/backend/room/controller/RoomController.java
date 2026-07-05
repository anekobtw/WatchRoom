package com.example.backend.room.controller;

import com.example.backend.room.model.dto.CreateRoomDto;
import com.example.backend.room.model.dto.JoinRoomDto;
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
  public ResponseEntity<String> createRoom(@RequestBody CreateRoomDto data) {
    return roomService.createRoom(data.getClientId());
  }

  @PostMapping("/join")
  public ResponseEntity<String> joinRoom(@RequestBody JoinRoomDto data) {
    return roomService.joinRoom(data.getRoomId(), data.getClientId(), data.getRawPassword());
  }
}