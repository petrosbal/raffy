// core library business logic

// to avoid an N+1 problem — one query per book would be unacceptable at scale.
// computeBookPace() and computePredictedFinishDate() are kept as separate private
// methods rather than inlined in toResponse() to respect single responsibility.
// getUserBookOrThrow() returns "not found" for both missing and unauthorized access —
// this prevents users from confirming whether a given UUID belongs to another user.
package com.petros.raffy.userbook;

import com.petros.raffy.book.Book;
import com.petros.raffy.book.BookRepository;
import com.petros.raffy.session.ReadingSession;
import com.petros.raffy.session.ReadingSessionRepository;
import com.petros.raffy.user.User;
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
public class UserBookService {

    private final UserBookRepository userBookRepository;
    private final BookRepository bookRepository;
    private final ReadingSessionRepository readingSessionRepository;

    public UserBookResponse addBook(User user, AddBookRequest request) {
        Book book = getOrCreateBook(request);

        if (userBookRepository.existsByUserAndBookId(user, book.getId())) {
            throw new IllegalArgumentException("Book already in your library");
        }

        UserBook userBook = UserBook.builder()
                .user(user)
                .book(book)
                .status(ReadingStatus.WANT_TO_READ)
                .build();

        return toResponse(userBookRepository.save(userBook), 0, List.of());
    }


    public List<UserBookResponse> getLibrary(User user) {
        List<UserBook> userBooks = userBookRepository.findByUser(user);

        // I chose to fetch all sessions in a single query and group them in memory
        // to avoid an N+1 problem. one query per book is unacceptable at scale
        List<ReadingSession> allSessions = readingSessionRepository.findByUserBook_User_Id(user.getId());

        Map<UUID, List<ReadingSession>> sessionsByUserBook = allSessions.stream()
                .collect(Collectors.groupingBy(s -> s.getUserBook().getId()));

        return userBooks.stream()
                .map(ub -> {
                    List<ReadingSession> bookSessions = sessionsByUserBook.getOrDefault(ub.getId(), List.of());
                    int pagesRead = bookSessions.stream().mapToInt(ReadingSession::getPagesRead).sum();
                    return toResponse(ub, pagesRead, bookSessions);
                })
                .toList();
    }

    public UserBookResponse updateBook(User user, UUID userBookId, UpdateBookRequest request) {
        UserBook userBook = getUserBookOrThrow(user, userBookId);

        if (request.getStatus() != null) {
            ReadingStatus oldStatus = userBook.getStatus();
            ReadingStatus newStatus = request.getStatus();
            userBook.setStatus(newStatus);

            if (newStatus == ReadingStatus.READING && oldStatus != ReadingStatus.READING) {
                userBook.setStartedAt(LocalDate.now());
            }
            if (newStatus == ReadingStatus.FINISHED && oldStatus != ReadingStatus.FINISHED) {
                userBook.setFinishedAt(LocalDate.now());
            }
        }

        if (request.getRating() != null) {
            if (userBook.getStatus() != ReadingStatus.FINISHED) {
                throw new IllegalArgumentException("You can only rate finished books");
            }
            if (request.getRating() < 1 || request.getRating() > 10) {
                throw new IllegalArgumentException("Rating must be between 1 and 10");
            }
            userBook.setRating(request.getRating());
        }

        List<ReadingSession> bookSessions = readingSessionRepository.findByUserBook(userBook);
        int pagesRead = bookSessions.stream().mapToInt(ReadingSession::getPagesRead).sum();

        return toResponse(userBookRepository.save(userBook), pagesRead, bookSessions);
    }

    public void removeBook(User user, UUID userBookId) {
        UserBook userBook = getUserBookOrThrow(user, userBookId);
        userBookRepository.delete(userBook);
    }

    // computeBookPace() and computePredictedFinishDate() are kept as separate private
    // methods rather than inlined in toResponse() to respect single responsibility

    private Double computeBookPace(List<ReadingSession> sessions, int pagesRead) {
        if (sessions.isEmpty()) return null;

        LocalDate startDate = sessions.stream()
                .map(ReadingSession::getSessionDate)
                .min(Comparator.naturalOrder())
                .orElse(LocalDate.now());

        // +1 makes the range inclusive
        // reading on days 1 and 2 spans 2 days, not 1
        long days = ChronoUnit.DAYS.between(startDate, LocalDate.now()) + 1;

        return BigDecimal.valueOf((double) pagesRead / days).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private LocalDate computePredictedFinishDate(Integer pageCount, int pagesRead, Double pace) {
        if (pageCount == null || pace == null || pace == 0) return null;

        int remaining = pageCount - pagesRead;
        if (remaining <= 0) return LocalDate.now();

        long daysToFinish = Math.round(remaining / pace);
        return LocalDate.now().plusDays(daysToFinish);
    }

    private UserBookResponse toResponse(UserBook userBook, int pagesRead, List<ReadingSession> bookSessions) {
        Double bookPace = null;
        LocalDate predictedFinishDate = null;

        if (userBook.getStatus() == ReadingStatus.READING) {
            bookPace = computeBookPace(bookSessions, pagesRead);
            predictedFinishDate = computePredictedFinishDate(
                    userBook.getBook().getPageCount(), pagesRead, bookPace);
        }

        return UserBookResponse.builder()
                .id(userBook.getId())
                .googleBooksId(userBook.getBook().getGoogleBooksId())
                .title(userBook.getBook().getTitle())
                .author(userBook.getBook().getAuthor())
                .coverUrl(userBook.getBook().getCoverUrl())
                .pageCount(userBook.getBook().getPageCount())
                .genre(userBook.getBook().getGenre())
                .status(userBook.getStatus())
                .startedAt(userBook.getStartedAt())
                .finishedAt(userBook.getFinishedAt())
                .rating(userBook.getRating())
                .pagesRead(pagesRead)
                .bookPace(bookPace)
                .predictedFinishDate(predictedFinishDate)
                .build();
    }

    private Book getOrCreateBook(AddBookRequest request) {
        return bookRepository.findByGoogleBooksId(request.getGoogleBooksId())
                .orElseGet(() -> bookRepository.save(Book.builder()
                        .googleBooksId(request.getGoogleBooksId())
                        .title(request.getTitle())
                        .author(request.getAuthor())
                        .coverUrl(request.getCoverUrl())
                        .pageCount(request.getPageCount())
                        .genre(request.getGenre())
                        .build()));
    }

    // returns "not found" for both missing and unauthorized access —
    // this prevents users from confirming whether a given UUID belongs to another user.
    private UserBook getUserBookOrThrow(User user, UUID userBookId) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found in library"));
        if (!userBook.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Book not found in library");
        }
        return userBook;
    }

}