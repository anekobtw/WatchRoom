package com.example.backend.websocket.model;

import com.example.backend.room.model.projection.ChatMessageProjection;
import com.example.backend.room.model.view.UserView;
import lombok.Builder;

import java.util.List;
import java.util.Set;

@Builder
public record RoomState(
        String roomId,
        String videoUrl,
        Long videoTimestamp,
        boolean playing,
        Set<UserView> users,
        List<ChatMessageProjection> messages
) { }
