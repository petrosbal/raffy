// exposes the /library endpoints for managing a user's personal book collection.

package com.petros.raffy.userbook;

import com.petros.raffy.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/library")
@RequiredArgsConstructor
// all endpoints are authenticated, and the logged-in user is injected via @AuthenticationPrincipal.
@SecurityRequirement(name = "bearerAuth")
public class UserBookController {

    private final UserBookService userBookService;

    @PostMapping
    public ResponseEntity<UserBookResponse> addBook(
            @AuthenticationPrincipal User user,
            @RequestBody AddBookRequest request
    ) {
        return ResponseEntity.ok(userBookService.addBook(user, request));
    }

    @GetMapping
    public ResponseEntity<List<UserBookResponse>> getLibrary(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(userBookService.getLibrary(user));
    }

    // PATCH is used for updates instead of PUT because I modify specific fields, not the whole resource
    @PatchMapping("/{id}")
    public ResponseEntity<UserBookResponse> updateBook(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody UpdateBookRequest request
    ) {
        return ResponseEntity.ok(userBookService.updateBook(user, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeBook(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        userBookService.removeBook(user, id);
        return ResponseEntity.noContent().build();
    }

}