package com.example.backend.repository;

import com.example.backend.model.entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

  List<ChatMessageEntity> findTop100ByRoomIdOrderByTsDesc(String roomId);
}