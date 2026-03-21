// Handles reading session logging and journal retrieval.


// getUserBookOrThrow() returns "not found" for both missing and unauthorized access
// for the same security reason as in UserBookService.
package com.petros.raffy.session;

import com.petros.raffy.user.User;
import com.petros.raffy.userbook.ReadingStatus;
import com.petros.raffy.userbook.UserBook;
import com.petros.raffy.userbook.UserBookRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
@RequiredArgsConstructor
public class ReadingSessionService {

    private final ReadingSessionRepository readingSessionRepository;
    private final UserBookRepository userBookRepository;

    public ReadingSessionResponse logSession(User user, UUID userBookId, LogSessionRequest request) {
        UserBook userBook = getUserBookOrThrow(user, userBookId);

        // Sessions can only be logged for books with READING status, enforced here
        if (userBook.getStatus() != ReadingStatus.READING) {
            throw new IllegalArgumentException("You can only log sessions for books you are currently reading");
        }

        if (request.getPagesRead() == null || request.getPagesRead() <= 0) {
            throw new IllegalArgumentException("Pages read must be greater than 0");
        }

        LocalDate sessionDate = request.getSessionDate() != null
                ? request.getSessionDate()
                : LocalDate.now();

        ReadingSession session = ReadingSession.builder()
                .userBook(userBook)
                .pagesRead(request.getPagesRead())
                .sessionDate(sessionDate)
                .notes(request.getNotes())
                .build();

        return toResponse(readingSessionRepository.save(session));
    }

    // journal is sorted newest first in memory since I already have all sessions loaded
    public List<ReadingSessionResponse> getJournal(User user) {
        return readingSessionRepository.findByUserBook_User_Id(user.getId())
                .stream()
                .sorted((a, b) -> b.getSessionDate().compareTo(a.getSessionDate()))
                .map(this::toResponse)
                .toList();
    }

    public void deleteSession(User user, UUID sessionId) {
        ReadingSession session = readingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (!session.getUserBook().getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Session not found");
        }

        readingSessionRepository.delete(session);
    }

    // returns "not found" for both missing and unauthorized access
    // for the same security reason as in UserBookService.
    private UserBook getUserBookOrThrow(User user, UUID userBookId) {
        UserBook userBook = userBookRepository.findById(userBookId)
                .orElseThrow(() -> new IllegalArgumentException("Book not found in library"));
        if (!userBook.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Book not found in library");
        }
        return userBook;
    }

    private ReadingSessionResponse toResponse(ReadingSession session) {
        return ReadingSessionResponse.builder()
                .id(session.getId())
                .userBookId(session.getUserBook().getId())
                .bookTitle(session.getUserBook().getBook().getTitle())
                .bookCoverUrl(session.getUserBook().getBook().getCoverUrl())
                .pagesRead(session.getPagesRead())
                .sessionDate(session.getSessionDate())
                .notes(session.getNotes())
                .build();
    }

}