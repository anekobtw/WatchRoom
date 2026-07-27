package com.example.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserController {
  @PostMapping("/create")
  public ResponseEntity<String> createUser() {
    return ResponseEntity.ok(UUID.randomUUID().toString());
  }
}
