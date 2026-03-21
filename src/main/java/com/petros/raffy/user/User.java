// user entity that also implements spring security's UserDetails directly.
// This avoids a separate adapter class because spring security can work with our entity natively.
package com.petros.raffy.user;

import jakarta.persistence.*;
import lombok.*;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String displayName;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // createdAt is set automatically on first persistence
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // --- UserDetails ---

    // getAuthorities() returns an empty list, Raffy has no roles.
    @Override
    public @NonNull Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

    // getUsername() returns email since that is our identifier.
    @Override
    public @NonNull String getUsername() {
        return email;
    }

}