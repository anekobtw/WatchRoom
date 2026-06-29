package com.example.backend.model.view;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class UsersView {
  private List<UserView> users;
}
