package com.example.backend.controller;

import com.example.backend.service.RoomHTTPService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

  public final RoomHTTPService roomHTTPService;

  @PostMapping("/create")
  public ResponseEntity<String> createRoom(@RequestBody String userId) {
    return roomHTTPService.createRoom(userId);
  }
}
