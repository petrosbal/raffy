import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { libraryApi } from "../api/library";
import { queryKeys } from "../api/queryKeys";
import { searchApi } from "../api/search";
import type { BookSearchResult, ReadingStatus } from "../api/types";
import { todayIsoDate } from "../domain/reading";
import { BookCover } from "./BookCover";

type DiscoverOverlayProps = {
  onClose: () => void;
  onToast: (message: string) => void;
};

export function DiscoverOverlay({ onClose, onToast }: DiscoverOverlayProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);
  const [backfillId, setBackfillId] = useState<string | null>(null);
  const [finishedAt, setFinishedAt] = useState(todayIsoDate());
  const [rating, setRating] = useState(8);

  const searchQuery = useQuery({
    queryKey: queryKeys.search(debouncedQuery),
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
  });

  const addMutation = useMutation({
    mutationFn: ({
      book,
      status,
    }: {
      book: BookSearchResult;
      status: ReadingStatus;
    }) =>
      libraryApi.add({
        ...book,
        status,
        finishedAt: status === "FINISHED" ? finishedAt : null,
        rating: status === "FINISHED" ? rating : null,
        isBackfilled: status === "FINISHED",
      }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.library }),
        queryClient.invalidateQueries({ queryKey: queryKeys.insights }),
      ]);
      onToast(`${variables.book.title} added to your library.`);
      onClose();
    },
  });

  return (
    <div className="overlay-backdrop" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="overlay-panel discover-panel" aria-label="Discover books">
        <div className="overlay-header">
          <div>
            <h2>Discover</h2>
            <p>Search Google Books and add titles to Raffy.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <label className="discover-search">
          <Search size={17} aria-hidden="true" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, author, or ISBN"
          />
        </label>

        <div className="discover-results">
          {searchQuery.isFetching && <div className="inline-note">Searching...</div>}
          {searchQuery.isError && <div className="inline-error">Search failed.</div>}
          {debouncedQuery.length < 2 && (
            <div className="inline-note">Type at least two characters to search.</div>
          )}
          {(searchQuery.data ?? []).map((book) => (
            <article className="discover-result" key={book.googleBooksId}>
              <BookCover title={book.title} coverUrl={book.coverUrl} />
              <div className="discover-body">
                <strong>{book.title}</strong>
                <span>{book.author || "Unknown author"}</span>
                <em>
                  {book.pageCount ? `${book.pageCount} pages` : "Unknown length"}
                  {book.genre ? ` · ${book.genre}` : ""}
                </em>

                {backfillId === book.googleBooksId && (
                  <div className="inline-backfill">
                    <label>
                      Finished
                      <input
                        type="date"
                        value={finishedAt}
                        onChange={(event) => setFinishedAt(event.target.value)}
                      />
                    </label>
                    <label>
                      Rating
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={rating}
                        onChange={(event) => setRating(Number(event.target.value))}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="discover-actions">
                <button
                  className="secondary-button tiny"
                  type="button"
                  onClick={() => addMutation.mutate({ book, status: "WANT_TO_READ" })}
                  disabled={addMutation.isPending}
                >
                  Want
                </button>
                <button
                  className="secondary-button tiny"
                  type="button"
                  onClick={() => addMutation.mutate({ book, status: "READING" })}
                  disabled={addMutation.isPending}
                >
                  Reading
                </button>
                {backfillId === book.googleBooksId ? (
                  <button
                    className="primary-button tiny"
                    type="button"
                    onClick={() => addMutation.mutate({ book, status: "FINISHED" })}
                    disabled={addMutation.isPending}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="secondary-button tiny"
                    type="button"
                    onClick={() => setBackfillId(book.googleBooksId)}
                  >
                    Read
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {addMutation.isError && (
          <div className="form-error">
            {addMutation.error instanceof Error ? addMutation.error.message : "Could not add this book."}
          </div>
        )}
      </section>
    </div>
  );
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timeout);
  }, [delayMs, value]);

  return debounced;
}
