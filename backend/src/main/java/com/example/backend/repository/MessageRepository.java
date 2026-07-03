package com.example.backend.repository;

import com.example.backend.model.entity.MessageEntity;
import com.example.backend.model.entity.RoomEntity;
import com.example.backend.model.view.ChatView;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {

  List<ChatView> findTop100ByRoomOrderByTsDesc(RoomEntity room);
}