// represents a user's personal copy of a book in their library.
// Book is global reference data
// UserBook is the user-specific layer on top.
// FetchType.LAZY on both relationships means related data is only loaded
// when explicitly accessed, preventing unnecessary queries.
// startedAt and finishedAt are set automatically in UserBookService
// when the status transitions to READING or FINISHED respectively.
// rating is nullable — only available once the book
package com.petros.raffy.userbook;

import com.petros.raffy.book.Book;
import com.petros.raffy.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
        name = "user_books",
        // prevents the same book from being added twice by the same user, enforced at db level
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "book_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBook {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // FetchType.LAZY means related data is only loaded
    // when explicitly accessed, preventing unnecessary queries
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Enumerated(EnumType.STRING) // I could store an int but this makes the db more readable
    @Column(nullable = false)
    private ReadingStatus status;

    // startedAt and finishedAt are set automatically in UserBookService
    // when the status transitions to READING or FINISHED respectively
    // that's better and cooler than any other options.
    private LocalDate startedAt;

    private LocalDate finishedAt;

    // rating is nullable — only available once the book is FINISHED.
    @Column(name = "rating")
    private Integer rating;

}