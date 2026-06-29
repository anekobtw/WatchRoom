package com.example.backend.model.view;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserView {
  private String clientId;
  private String name;
  private boolean admin;
}
