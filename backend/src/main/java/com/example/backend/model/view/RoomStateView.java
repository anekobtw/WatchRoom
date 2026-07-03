package com.example.backend.model.view;

import com.example.backend.model.ClientInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
public class RoomStateView {
  private final String roomId;
  private final String videoUrl;
  private final Long videoTimestamp;
  private final boolean playing;

  private final Set<ClientInfo> users;
  private final List<ChatView> messages;
}
