package com.example.backend.model.websocket;

import com.example.backend.model.view.ChatMessageView;
import com.example.backend.model.view.UserView;
import lombok.Builder;

import java.util.List;
import java.util.Set;

@Builder
public record RoomState(
        String roomId,
        Integer version,
        String updatedBy,
        String videoUrl,
        Long videoTimestamp,
        boolean playing,
        Set<UserView> users,
        List<ChatMessageView> messages
) { }
