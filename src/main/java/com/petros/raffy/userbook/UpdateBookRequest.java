// this is a separate shape for updating status/rating.
// I couldn't reuse AddBookRequest because
// the fields are completely different.

package com.petros.raffy.userbook;

import lombok.Data;

@Data
public class UpdateBookRequest {
    private ReadingStatus status;
    private Integer rating;
}