import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { insightsApi } from "../api/insights";
import { libraryApi } from "../api/library";
import { queryKeys } from "../api/queryKeys";
import type { UserBook } from "../api/types";
import { LibraryColumn } from "../components/LibraryColumn";
import { InsightsStrip } from "../components/InsightsStrip";
import { statusColumns } from "../domain/reading";

type HomePageProps = {
  onDiscover: () => void;
  onLogProgress: () => void;
  onOpenBook: (book: UserBook) => void;
};

export function HomePage({ onDiscover, onLogProgress, onOpenBook }: HomePageProps) {
  const libraryQuery = useQuery({
    queryKey: queryKeys.library,
    queryFn: libraryApi.list,
  });
  const insightsQuery = useQuery({
    queryKey: queryKeys.insights,
    queryFn: insightsApi.get,
  });

  const books = libraryQuery.data ?? [];
  const grouped = statusColumns.map((status) => ({
    status,
    books: books.filter((book) => book.status === status),
  }));
  const readingCount = books.filter((book) => book.status === "READING").length;

  return (
    <>
      <InsightsStrip insights={insightsQuery.data} isLoading={insightsQuery.isLoading} />

      <main className="page-shell">
        <div className="page-toolbar">
          <div>
            <h1>Your library</h1>
            <p>
              {libraryQuery.isLoading
                ? "Loading your shelves..."
                : `${books.length} books across your reading life`}
            </p>
          </div>
          <div className="toolbar-actions">
            <button className="secondary-button" type="button" onClick={onDiscover}>
              <Plus size={16} />
              Add book
            </button>
            <button
              className="primary-button compact"
              type="button"
              onClick={onLogProgress}
              disabled={readingCount === 0}
            >
              Log progress
            </button>
          </div>
        </div>

        {libraryQuery.isError && (
          <div className="inline-error">Could not load your library.</div>
        )}

        <div className="library-board">
          {grouped.map(({ status, books: columnBooks }) => (
            <LibraryColumn
              key={status}
              status={status}
              books={columnBooks}
              onAdd={onDiscover}
              onOpenBook={onOpenBook}
            />
          ))}
        </div>
      </main>

      <button className="floating-action" type="button" onClick={onDiscover} aria-label="Add book">
        <Plus size={24} />
      </button>
    </>
  );
}
