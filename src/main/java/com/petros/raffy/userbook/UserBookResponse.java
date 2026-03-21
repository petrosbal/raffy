// The shape sent back to the frontend
// flattens userBook + book + pagesRead + insights into one object
// instead of sending four separate ones (obviously bad)

package com.petros.raffy.userbook;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class UserBookResponse {
    private UUID id;
    private String googleBooksId;
    private String title;
    private String author;
    private String coverUrl;
    private Integer pageCount;
    private String genre;
    private ReadingStatus status;
    private LocalDate startedAt;
    private LocalDate finishedAt;
    private Integer rating;
    private Integer pagesRead;

    // only populated for READING books.
    // they are null for WANT_TO_READ and FINISHED books.
    private Double bookPace;
    private LocalDate predictedFinishDate;
}