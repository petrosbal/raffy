package com.petros.raffy.book;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookRepository extends JpaRepository<Book, UUID> {

    // used in the find-or-create pattern when a user adds a book to their library
    Optional<Book> findByGoogleBooksId(String googleBooksId);

    boolean existsByGoogleBooksId(String googleBooksId);

}