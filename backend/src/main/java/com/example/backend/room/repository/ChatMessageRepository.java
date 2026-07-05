package com.example.backend.room.repository;

import com.example.backend.room.model.entity.ChatMessageEntity;
import com.example.backend.room.model.projection.ChatMessageProjection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity, Long> {

  List<ChatMessageProjection> findTop100ByRoomIdOrderByTsDesc(String roomId);
}