// represents a single reading instance logged by the user.
package com.petros.raffy.session;

import com.petros.raffy.userbook.UserBook;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "reading_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // obviously belongs to a UserBook and not a Book, for implicit user context
    // which means no storing user_id here, I get it via userBook.getUser(). neat
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_book_id", nullable = false)
    private UserBook userBook;

    @Column(nullable = false)
    private Integer pagesRead;

    // sessionDate uses LocalDate not LocalDateTime
    // I think the time of day is irrelevant in Raffy's context
    @Column(nullable = false)
    private LocalDate sessionDate;

    // notes is nullable, because logging a reading session should be low friction
    // who am I to always require session notes from the reader?
    private String notes;

}