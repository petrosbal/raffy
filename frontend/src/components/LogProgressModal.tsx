import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { libraryApi } from "../api/library";
import { queryKeys } from "../api/queryKeys";
import { sessionsApi } from "../api/sessions";
import type { UserBook } from "../api/types";
import { computePagesThisSession, todayIsoDate } from "../domain/reading";

type LogProgressModalProps = {
  onClose: () => void;
  onToast: (message: string) => void;
  initialBookId?: string;
};

export function LogProgressModal({ onClose, onToast, initialBookId }: LogProgressModalProps) {
  const queryClient = useQueryClient();
  const libraryQuery = useQuery({
    queryKey: queryKeys.library,
    queryFn: libraryApi.list,
  });
  const readingBooks = useMemo(
    () => (libraryQuery.data ?? []).filter((book) => book.status === "READING"),
    [libraryQuery.data],
  );
  const [bookId, setBookId] = useState(initialBookId ?? "");
  const selectedBook = readingBooks.find((book) => book.id === bookId) ?? readingBooks[0];
  const [stoppedAtPage, setStoppedAtPage] = useState("");
  const [sessionDate, setSessionDate] = useState(todayIsoDate());
  const [notes, setNotes] = useState("");
  const [markFinished, setMarkFinished] = useState(false);
  const [rating, setRating] = useState(8);
  const [error, setError] = useState<string | null>(null);

  const logMutation = useMutation({
    mutationFn: async (book: UserBook) => {
      const stoppedAt = Number(stoppedAtPage);
      const pagesRead = computePagesThisSession(stoppedAt, book.pagesRead);

      if (pagesRead <= 0) {
        throw new Error("Stopped page must be greater than current pages read.");
      }
      if (book.pageCount && stoppedAt > book.pageCount) {
        throw new Error("Stopped page cannot be greater than total pages.");
      }

      await sessionsApi.log(book.id, {
        pagesRead,
        sessionDate,
        notes: notes.trim() || null,
      });

      if (markFinished) {
        await libraryApi.update(book.id, {
          status: "FINISHED",
          rating,
        });
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.library }),
        queryClient.invalidateQueries({ queryKey: queryKeys.journal }),
        queryClient.invalidateQueries({ queryKey: queryKeys.insights }),
      ]);
      onToast("Reading session saved.");
      onClose();
    },
    onError: (err) => {
      setError(err instanceof Error ? err.message : "Could not save session.");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!selectedBook) {
      setError("No active reading books yet.");
      return;
    }

    logMutation.mutate(selectedBook);
  }

  return (
    <div className="overlay-backdrop" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="modal-panel" aria-label="Log reading progress">
        <div className="overlay-header">
          <div>
            <h2>Log progress</h2>
            <p>Enter the page you stopped at.</p>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form className="stacked-form" onSubmit={handleSubmit}>
          <label>
            <span>Book</span>
            <select value={selectedBook?.id ?? ""} onChange={(event) => setBookId(event.target.value)}>
              {readingBooks.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>

          {selectedBook && (
            <div className="progress-reminder">
              Current progress: <strong>{selectedBook.pagesRead}</strong>
              {selectedBook.pageCount ? ` / ${selectedBook.pageCount}` : ""} pages
            </div>
          )}

          <div className="form-grid">
            <label>
              <span>Stopped at page</span>
              <input
                type="number"
                min={1}
                value={stoppedAtPage}
                onChange={(event) => setStoppedAtPage(event.target.value)}
                placeholder="312"
              />
            </label>
            <label>
              <span>Date</span>
              <input
                type="date"
                value={sessionDate}
                onChange={(event) => setSessionDate(event.target.value)}
              />
            </label>
          </div>

          <label>
            <span>Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional reflection"
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={markFinished}
              onChange={(event) => setMarkFinished(event.target.checked)}
            />
            <span>Mark as finished after this session</span>
          </label>

          {markFinished && (
            <label>
              <span>Rating</span>
              <input
                type="number"
                min={1}
                max={10}
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
              />
            </label>
          )}

          {error && <div className="form-error">{error}</div>}

          <button className="primary-button" type="submit" disabled={logMutation.isPending}>
            {logMutation.isPending ? "Saving..." : "Save session"}
          </button>
        </form>
      </section>
    </div>
  );
}
