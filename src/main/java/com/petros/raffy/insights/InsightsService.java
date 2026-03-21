// Computes all user-level reading insights from two database queries
// and all computation happens here in java, no derived data is stored in the database.

package com.petros.raffy.insights;

import com.petros.raffy.session.ReadingSession;
import com.petros.raffy.session.ReadingSessionRepository;
import com.petros.raffy.user.User;
import com.petros.raffy.userbook.ReadingStatus;
import com.petros.raffy.userbook.UserBook;
import com.petros.raffy.userbook.UserBookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class InsightsService {

    private final ReadingSessionRepository readingSessionRepository;
    private final UserBookRepository userBookRepository;

    // Single endpoint by design — all insights share 2 DB queries (sessions + user books).
    // Splitting into 5 endpoints would multiply that to 10 queries for no benefit,
    // since all insights are displayed together on one page.
    public InsightsResponse getInsights(User user) {
        List<ReadingSession> allSessions = readingSessionRepository.findByUserBook_User_Id(user.getId());
        List<UserBook> allUserBooks = userBookRepository.findByUser(user);

        LocalDate firstSessionDate = allSessions.stream()
                .map(ReadingSession::getSessionDate)
                .min(Comparator.naturalOrder())
                .orElse(LocalDate.now());

        return InsightsResponse.builder()
                .totalMomentum(computeMomentum(allSessions, firstSessionDate))
                .monthlyMomentum(computeMomentum(allSessions, LocalDate.now().minusDays(30)))
                .readingStreak(computeReadingStreak(allSessions))
                .genreFingerprint(computeGenreFingerprint(allUserBooks))
                .bookLeaderboard(computeBookLeaderboard(allUserBooks))
                .build();
    }

    // computeMomentum() is parameterized by a start date, making it reusable
    // for both total momentum (since first session) and monthly momentum (last 30 days)
    // and extensible for any future time window without adding new methods
    private Double computeMomentum(List<ReadingSession> sessions, LocalDate from) {
        if (sessions.isEmpty()) return null;

        // +1 makes the range inclusive, same reasoning as in UserBookService.computeBookPace().
        long days = ChronoUnit.DAYS.between(from, LocalDate.now()) + 1;

        int totalPages = sessions.stream()
                .filter(s -> !s.getSessionDate().isBefore(from))
                .mapToInt(ReadingSession::getPagesRead)
                .sum();

        return BigDecimal.valueOf((double) totalPages / days).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    // Walks backwards from today through a set of session dates
    // Set lookup is O(1) so this is efficient regardless of history length
    // at least to my knowledge
    private Integer computeReadingStreak(List<ReadingSession> sessions) {
        if (sessions.isEmpty()) return 0;

        Set<LocalDate> sessionDates = sessions.stream()
                .map(ReadingSession::getSessionDate)
                .collect(Collectors.toSet());

        int streak = 0;
        LocalDate current = LocalDate.now();

        while (sessionDates.contains(current)) {
            streak++;
            current = current.minusDays(1);
        }

        return streak;
    }

    private Map<String, Integer> computeGenreFingerprint(List<UserBook> userBooks) {
        return userBooks.stream()
                .filter(ub -> ub.getStatus() == ReadingStatus.FINISHED)
                .filter(ub -> ub.getBook().getGenre() != null)
                .collect(Collectors.groupingBy(
                        ub -> ub.getBook().getGenre(),
                        Collectors.collectingAndThen(Collectors.counting(), Long::intValue)
                ));
    }

    private List<InsightsResponse.BookLeaderboardEntry> computeBookLeaderboard(List<UserBook> userBooks) {
        return userBooks.stream()
                .filter(ub -> ub.getStatus() == ReadingStatus.FINISHED)
                .filter(ub -> ub.getRating() != null)
                .sorted(Comparator.comparingInt(UserBook::getRating).reversed())
                .map(ub -> InsightsResponse.BookLeaderboardEntry.builder()
                        .title(ub.getBook().getTitle())
                        .author(ub.getBook().getAuthor())
                        .coverUrl(ub.getBook().getCoverUrl())
                        .rating(ub.getRating())
                        .build())
                .toList();
    }

}