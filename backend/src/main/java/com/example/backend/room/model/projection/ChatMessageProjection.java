package com.example.backend.room.model.projection;

public interface ChatMessageProjection {
  String getSenderName();
  String getText();
  Long getTs();
}
