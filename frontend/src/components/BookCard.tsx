import type { UserBook } from "../api/types";
import { progressPercent, ratingLabel } from "../domain/reading";
import { BookCover } from "./BookCover";

type BookCardProps = {
  book: UserBook;
  onOpen: (book: UserBook) => void;
};

export function BookCard({ book, onOpen }: BookCardProps) {
  const pct = progressPercent(book);

  return (
    <button className="book-card" type="button" onClick={() => onOpen(book)}>
      <BookCover title={book.title} coverUrl={book.coverUrl} />
      <span className="book-card-body">
        <span className="book-title">{book.title}</span>
        <span className="book-author">{book.author || "Unknown author"}</span>

        {book.status === "READING" && (
          <span className="progress-block">
            <span className="progress-meta">
              <span>
                {book.pagesRead} / {book.pageCount || "?"} pages
              </span>
              <strong>{pct}%</strong>
            </span>
            <span className="progress-track">
              <span className="progress-fill" style={{ width: `${pct}%` }} />
            </span>
            <span className="book-submeta">
              <span>{book.bookPace ? `${book.bookPace} p/day` : "Pace pending"}</span>
              <span>{book.predictedFinishDate || "No estimate yet"}</span>
            </span>
          </span>
        )}

        {book.status === "FINISHED" && (
          <span className="finished-meta">
            <strong>{ratingLabel(book.rating)}</strong>
            <span>Finished {book.finishedAt || "recently"}</span>
          </span>
        )}

        {book.status === "WANT_TO_READ" && (
          <span className="not-started">Not started</span>
        )}
      </span>
    </button>
  );
}
