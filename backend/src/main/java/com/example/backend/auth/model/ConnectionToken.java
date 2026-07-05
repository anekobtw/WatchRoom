package com.example.backend.auth.model;

import java.time.Instant;

public record ConnectionToken(
        String roomId,
        String clientId,
        Instant expiresAt
) { }
