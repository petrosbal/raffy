// this is the shape of data coming in when a book is added.
// contains metadata from Google books

package com.petros.raffy.userbook;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class AddBookRequest {
    private String googleBooksId;
    private String title;
    private String author;
    private String coverUrl;
    private Integer pageCount;
    private String genre;

    // optional — sent by the frontend when adding a previously-read book from Discover.
    // if status is null, we default to WANT_TO_READ.
    private ReadingStatus status;
    private LocalDate finishedAt;
    private Integer rating;
    @JsonProperty("isBackfilled")
    private boolean isBackfilled = false;
}