package com.example.backend.repository;

import com.example.backend.model.entity.ChatMessageEntity;
import com.example.backend.model.projection.ChatMessageProjection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

  List<ChatMessageProjection> findTop100ByRoomIdOrderByTsDesc(String roomId);
}