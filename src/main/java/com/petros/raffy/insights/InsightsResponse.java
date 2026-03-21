// all user-level reading insights in one object

// bookPace and predictedFinishDate are intentionally absent here
// they belong to a specific book and live in UserBookResponse instead.

// any field can be null if insufficient data exists to compute it meaningfully.
// genreFingerprint and bookLeaderboard return empty collections rather than null.
package com.petros.raffy.insights;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class InsightsResponse {

    private Double totalMomentum;
    private Double monthlyMomentum;
    private Integer readingStreak;
    // genreFingerprint is a map of genre -> count of finished books in that genre
    private Map<String, Integer> genreFingerprint;
    // bookLeaderboard is sorted by rating descending, only includes rated finished books
    private List<BookLeaderboardEntry> bookLeaderboard;

    @Data
    @Builder
    public static class BookLeaderboardEntry {
        private String title;
        private String author;
        private String coverUrl;
        private Integer rating;
    }

}