package com.example.backend.controller;

import com.example.backend.model.dto.JoinRoomDto;
import com.example.backend.model.view.JoinRoomView;
import com.example.backend.service.RoomHTTPService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class RoomController {

  public final RoomHTTPService roomHTTPService;

  @PostMapping("/create")
  public ResponseEntity<JoinRoomView> createRoom() {
    return roomHTTPService.createRoom();
  }

  @PostMapping("/join")
  public ResponseEntity<?> joinRoom(@RequestBody JoinRoomDto data) {
    return roomHTTPService.joinRoom(data.getRoomId(), data.getRawPassword());
  }
}