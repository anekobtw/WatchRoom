package com.example.backend.model.websocket;

import com.example.backend.model.entity.ChatMessage;
import lombok.Builder;

import java.util.List;
import java.util.Set;

@Builder
public record RoomState(
        Integer version,
        String updatedBy,
        String videoUrl,
        Long videoTimestamp,
        boolean playing,
        Set<String> users,
        List<ChatMessage> messages
) { }
