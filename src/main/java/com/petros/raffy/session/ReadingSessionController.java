package com.petros.raffy.session;

import com.petros.raffy.user.User;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ReadingSessionController {

    private final ReadingSessionService readingSessionService;

    // Log session lives under /library/{id}/sessions
    // semantically it belongs to a book
    @PostMapping("/library/{userBookId}/sessions")
    public ResponseEntity<ReadingSessionResponse> logSession(
            @AuthenticationPrincipal User user,
            @PathVariable UUID userBookId,
            @RequestBody LogSessionRequest request
    ) {
        return ResponseEntity.ok(readingSessionService.logSession(user, userBookId, request));
    }

    @GetMapping("/journal")
    public ResponseEntity<List<ReadingSessionResponse>> getJournal(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(readingSessionService.getJournal(user));
    }

    // Delete session lives under /journal/{id}
    // semantically you're removing a journal entry.
    @DeleteMapping("/journal/{sessionId}")
    public ResponseEntity<Void> deleteSession(
            @AuthenticationPrincipal User user,
            @PathVariable UUID sessionId
    ) {
        readingSessionService.deleteSession(user, sessionId);
        return ResponseEntity.noContent().build();
    }

}