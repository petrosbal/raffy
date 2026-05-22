import type { ReadingStatus, UserBook } from "../api/types";

export const statusLabels: Record<ReadingStatus, string> = {
  WANT_TO_READ: "Want to read",
  READING: "Reading",
  FINISHED: "Finished",
};

export const statusColumns: ReadingStatus[] = [
  "WANT_TO_READ",
  "READING",
  "FINISHED",
];

export function computePagesThisSession(
  stoppedAtPage: number,
  currentPagesRead: number,
) {
  return stoppedAtPage - currentPagesRead;
}

export function ratingLabel(rating: number | null | undefined) {
  return rating ? `${rating}/10` : "Unrated";
}

export function progressPercent(book: UserBook) {
  if (!book.pageCount || book.pageCount <= 0) return 0;
  return Math.min(100, Math.round((book.pagesRead / book.pageCount) * 100));
}

export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}
