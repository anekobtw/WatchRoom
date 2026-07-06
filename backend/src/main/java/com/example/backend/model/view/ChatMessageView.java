package com.example.backend.model.view;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessageView {
  private String senderName;
  private String text;
  private Long ts;

  @JsonProperty("isMine")
  private boolean mine;
}
