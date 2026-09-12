package com.amritansh.urlcreationservice.controller;

import com.amritansh.urlcreationservice.dto.PasskeyCredentialRequest;
import com.amritansh.urlcreationservice.service.PasskeyService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/passkey")
public class PasskeyController {

    private final PasskeyService passkeyService;

    public PasskeyController(PasskeyService passkeyService) {
        this.passkeyService = passkeyService;
    }

    @PostMapping("/register/options")
    public Map<String, Object> registrationOptions(
            Authentication authentication
    ) {
        return passkeyService.createRegistrationOptions(
                authentication.getName()
        );
    }

    @PostMapping("/register")
    public Map<String, String> register(
            Authentication authentication,
            @RequestBody PasskeyCredentialRequest request
    ) {

        passkeyService.register(
                authentication.getName(),
                request.getChallengeId(),
                request.getCredential()
        );

        return Map.of(
                "message",
                "Passkey registered successfully"
        );
    }

    @PostMapping("/login/options")
    public Map<String, Object> authenticationOptions() {
        return passkeyService.createAuthenticationOptions();
    }

    @PostMapping("/login")
    public Map<String, String> login(
            @RequestBody PasskeyCredentialRequest request
    ) {

        String token =
                passkeyService.authenticate(
                        request.getChallengeId(),
                        request.getCredential()
                );

        return Map.of(
                "token",
                token
        );
    }
}