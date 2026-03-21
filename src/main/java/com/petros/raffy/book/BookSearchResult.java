// DTO returned by the /discover endpoint.
// mirrors the fields we extract from the Google Books API response
// it is not persisted, only used as a search suggestion for the frontend
package com.petros.raffy.book;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BookSearchResult {
    private String googleBooksId;
    private String title;
    private String author;
    private String coverUrl;
    private Integer pageCount;
    private String genre;
}