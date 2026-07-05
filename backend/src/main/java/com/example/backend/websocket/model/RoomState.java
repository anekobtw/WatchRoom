package com.example.backend.websocket.model;

import com.example.backend.websocket.session.ClientInfo;
import com.example.backend.room.model.projection.ChatMessageProjection;
import lombok.Builder;

import java.util.List;
import java.util.Set;

@Builder
public record RoomState(
        String roomId,
        String videoUrl,
        Long videoTimestamp,
        boolean playing,
        Set<ClientInfo> users,
        List<ChatMessageProjection> messages
) { }
