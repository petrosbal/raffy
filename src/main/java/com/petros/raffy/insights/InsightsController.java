package com.petros.raffy.insights;

import com.petros.raffy.user.User;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// single endpoint by design, not by mistake!
// all insights share 2 DB queries (sessions + user books)
// splitting into 5 endpoints would mean 10 queries for no benefit,
// since all insights are displayed together on one page.
@RestController
@RequestMapping("/insights")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class InsightsController {

    private final InsightsService insightsService;

    @GetMapping
    public ResponseEntity<InsightsResponse> getInsights(
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(insightsService.getInsights(user));
    }

}