package com.amritansh.urlcreationservice.controller;

import com.amritansh.urlcreationservice.dto.LoginRequest;
import com.amritansh.urlcreationservice.entity.User;
import com.amritansh.urlcreationservice.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public User signup(@RequestBody User user) {
        return userService.saveUser(user);
    }

    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {

        return userService.login(
                request.getEmail(),
                request.getPassword()
        );

    }

    @GetMapping("/profile")
    public String profile() {
        return "You are authenticated!";
    }
}
