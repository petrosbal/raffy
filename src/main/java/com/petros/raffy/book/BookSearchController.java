// Exposes GET /discover?q= as a proxy to Google Books API

package com.petros.raffy.book;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/discover")
@RequiredArgsConstructor
// still requires authentication, so anonymous users can't consume the API quota
@SecurityRequirement(name = "bearerAuth")
public class BookSearchController {

    private final BookSearchService bookSearchService;

    @GetMapping
    public ResponseEntity<List<BookSearchResult>> search(@RequestParam String q) {
        return ResponseEntity.ok(bookSearchService.search(q));
    }

}