/*
 jwtutil generates and validates the tokens.
 token's subject is the user email (unique identifier in this case)
*/

package com.petros.raffy.auth;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMs;

    // the secret key from application.properties
    // is converted to a SecretKey object here
    public JwtUtil(
            @Value("${raffy.jwt.secret}") String secret,
            @Value("${raffy.jwt.expiration-ms}") long expirationMs
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }


    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    // try/catch, cause JJWT's api notifies about invalidity via exceptions, not return vals
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
        // it swallows all exceptions without specific cases,
        // because that would be unnecessary for Raffy's purposes.
        // exception => invalid token => unauthenticated request. simple as that.
    }

    // tiny helper to avoid code duplication in the two methods above;
    // this comment won't work anymore if anyone changes the order...
    // so don't.
    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

}