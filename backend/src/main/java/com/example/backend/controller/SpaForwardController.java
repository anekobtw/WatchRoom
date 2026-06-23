package com.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaForwardController {

  @RequestMapping({"/room/**", "/"})
  public String forward() {
    return "forward:/index.html";
  }
}