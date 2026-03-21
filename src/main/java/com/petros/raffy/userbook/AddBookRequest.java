// this is the shape of data coming in when a book is added.
// contains metadata from Google books

package com.petros.raffy.userbook;

import lombok.Data;

@Data
public class AddBookRequest {
    private String googleBooksId;
    private String title;
    private String author;
    private String coverUrl;
    private Integer pageCount;
    private String genre;
}