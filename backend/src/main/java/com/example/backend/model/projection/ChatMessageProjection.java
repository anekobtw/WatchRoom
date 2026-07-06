package com.example.backend.model.projection;

public interface ChatMessageProjection {
  String getSenderName();
  String getText();
  Long getTs();
}
