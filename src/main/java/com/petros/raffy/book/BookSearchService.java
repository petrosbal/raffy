// booksearchservice proxies search requests to the Books API

package com.petros.raffy.book;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookSearchService {

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // the API key is kept server-side, no frontend exposition
    @Value("${raffy.google-books.api-key}")
    private String apiKey;

    public List<BookSearchResult> search(String query) {
        String response = restClient.get()
                .uri("https://www.googleapis.com/books/v1/volumes?q={query}&maxResults=10&key={key}",
                        query, apiKey)
                .retrieve()
                .body(String.class);

        return parseResults(response);
    }

    private List<BookSearchResult> parseResults(String json) {
        List<BookSearchResult> results = new ArrayList<>();

        try {
            JsonNode root = objectMapper.readTree(json);
            JsonNode items = root.path("items");

            if (items.isMissingNode()) return results;

            for (JsonNode item : items) {
                JsonNode volumeInfo = item.path("volumeInfo");

                String googleBooksId = item.path("id").asText(null);
                String title = volumeInfo.path("title").asText(null);

                // only the first author is taken when multiple are listed, for simplicity
                String author = volumeInfo.path("authors").isArray() && !volumeInfo.path("authors").isEmpty()
                        ? volumeInfo.path("authors").get(0).asText(null)
                        : null;

                String coverUrl = volumeInfo.path("imageLinks").path("thumbnail").asText(null);

                Integer pageCount = volumeInfo.path("pageCount").isInt()
                        ? volumeInfo.path("pageCount").asInt()
                        : null;

                String genre = volumeInfo.path("categories").isArray() && !volumeInfo.path("categories").isEmpty()
                        ? volumeInfo.path("categories").get(0).asText(null)
                        : null;

                // books without an id or title are silently skipped
                // incomplete entries are useless.
                if (googleBooksId != null && title != null) {
                    results.add(BookSearchResult.builder()
                            .googleBooksId(googleBooksId)
                            .title(title)
                            .author(author)
                            .coverUrl(coverUrl)
                            .pageCount(pageCount)
                            .genre(genre)
                            .build());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Google Books response", e);
        }

        return results;
    }

}