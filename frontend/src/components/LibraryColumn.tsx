import { Plus } from "lucide-react";
import type { ReadingStatus, UserBook } from "../api/types";
import { statusLabels } from "../domain/reading";
import { BookCard } from "./BookCard";

type LibraryColumnProps = {
  status: ReadingStatus;
  books: UserBook[];
  onAdd: () => void;
  onOpenBook: (book: UserBook) => void;
};

const emptyCopy: Record<ReadingStatus, string> = {
  READING: "Start a book and your active reads will gather here.",
  WANT_TO_READ: "Search Google Books to build your future shelf.",
  FINISHED: "Finished books and ratings will settle here.",
};

export function LibraryColumn({
  status,
  books,
  onAdd,
  onOpenBook,
}: LibraryColumnProps) {
  return (
    <section className="library-column">
      <div className="column-header">
        <div>
          <h2>{statusLabels[status]}</h2>
          <span>{books.length} books</span>
        </div>
        <button className="icon-button" type="button" onClick={onAdd} aria-label="Add book">
          <Plus size={16} />
        </button>
      </div>

      <div className="book-list">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onOpen={onOpenBook} />
        ))}
        {books.length === 0 && (
          <button className="empty-column" type="button" onClick={onAdd}>
            <Plus size={22} aria-hidden="true" />
            <span>{emptyCopy[status]}</span>
          </button>
        )}
      </div>
    </section>
  );
}
