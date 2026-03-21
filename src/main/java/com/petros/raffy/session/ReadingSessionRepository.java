package com.petros.raffy.session;

import com.petros.raffy.userbook.UserBook;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReadingSessionRepository extends JpaRepository<ReadingSession, UUID> {

    List<ReadingSession> findByUserBook(UserBook userBook);

    // available for book-specific history views. I will need it
    List<ReadingSession> findByUserBookOrderBySessionDateDesc(UserBook userBook);

    // fetches all sessions for a user across all books in one query
    List<ReadingSession> findByUserBook_User_Id(UUID userId);

    // ^this traversal (ReadingSession -> UserBook -> User -> id) is used by both
    // the journal endpoint and the insights engine. seems comfortable

}