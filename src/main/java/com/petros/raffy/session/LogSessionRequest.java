package com.petros.raffy.session;

import lombok.Data;

import java.time.LocalDate;

@Data
public class LogSessionRequest {
    private Integer pagesRead;
    // sessionDate is optional, defaults to today if not provided.
    // this allows retroactive logging for sessions the user forgot to record
    // which, given my personal experience, is necessary.
    private LocalDate sessionDate;
    private String notes;
}