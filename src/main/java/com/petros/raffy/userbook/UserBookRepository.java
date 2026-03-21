// Spring Data JPA generates all queries from method names!

package com.petros.raffy.userbook;

import com.petros.raffy.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserBookRepository extends JpaRepository<UserBook, UUID> {

    List<UserBook> findByUser(User user);

    // available but currently unused, kept for future filtering
    List<UserBook> findByUserAndStatus(User user, ReadingStatus status);

    // findByUserBook_User_Id traverses UserBook -> User -> id in a single join query.
    Optional<UserBook> findByUserAndBookId(User user, UUID bookId);

    // used in the find-or-create flow to prevent duplicates
    boolean existsByUserAndBookId(User user, UUID bookId);

}