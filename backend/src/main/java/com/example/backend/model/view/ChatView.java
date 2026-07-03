package com.example.backend.model.view;

public interface ChatView {
  String getSenderClientId();
  String getText();
  Long getTs();
}