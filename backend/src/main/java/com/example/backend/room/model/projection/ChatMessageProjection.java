package com.example.backend.room.model.projection;

public interface ChatMessageProjection {
  String getSenderClientId();
  String getText();
  Long getTs();
}
