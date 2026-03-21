// Spring Data JPA generates all queries from method names at startup (isn't that cool!!??)

package com.petros.raffy.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // findByEmail is used by UserDetailsServiceImpl to load users for authentication
    Optional<User> findByEmail(String email);

    // existsByEmail is used during registration to prevent duplicate accounts
    boolean existsByEmail(String email);

}