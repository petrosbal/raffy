// global book reference, shared across all users
// a book is created once when first added by any user, and reused by all others.
// (that's why UserBook Exists too)

package com.petros.raffy.book;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // unique to prevent duplicate entries for the same book,
    // but I still wanted UUID as a separate field, for clarity.
    @Column(nullable = false, unique = true)
    private String googleBooksId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    // some fields are nullable because BooksAPI doesn't always return them.
    private String coverUrl;

    private Integer pageCount;

    private String genre;

}