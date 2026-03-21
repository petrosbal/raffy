// flattens session + book info into one object for the journal view.

package com.petros.raffy.session;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
public class ReadingSessionResponse {
    private UUID id;
    private UUID userBookId;
    // bookTitle and bookCoverUrl are included so the frontend doesn't need
    // a separate call to display the journal meaningfully
    private String bookTitle;
    private String bookCoverUrl;
    private Integer pagesRead;
    private LocalDate sessionDate;
    private String notes;
}