import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2, X } from "lucide-react";
import { useState } from "react";
import { libraryApi } from "../api/library";
import { queryKeys } from "../api/queryKeys";
import { sessionsApi } from "../api/sessions";
import type { ReadingStatus, UserBook } from "../api/types";
import { progressPercent, ratingLabel } from "../domain/reading";
import { BookCover } from "./BookCover";

type BookDetailOverlayProps = {
  book: UserBook;
  onClose: () => void;
  onToast: (message: string) => void;
  onLogProgress: () => void;
};

export function BookDetailOverlay({ book, onClose, onToast, onLogProgress }: BookDetailOverlayProps) {
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const journalQuery = useQuery({
    queryKey: queryKeys.journal,
    queryFn: sessionsApi.listJournal,
  });
  const sessions = (journalQuery.data ?? []).filter(
    (session) => session.userBookId === book.id,
  );
  const pct = progressPercent(book);

  const ratingMutation = useMutation({
    mutationFn: (rating: number) => libraryApi.update(book.id, { rating }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.library }),
        queryClient.invalidateQueries({ queryKey: queryKeys.insights }),
      ]);
      onToast("Rating updated.");
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: ReadingStatus) => libraryApi.update(book.id, { status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.library }),
        queryClient.invalidateQueries({ queryKey: queryKeys.insights }),
      ]);
    },
  });

  const removeMutation = useMutation({
    mutationFn: () => libraryApi.remove(book.id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.library }),
        queryClient.invalidateQueries({ queryKey: queryKeys.insights }),
        queryClient.invalidateQueries({ queryKey: queryKeys.journal }),
      ]);
      onToast(`${book.title} removed from your library.`);
      onClose();
    },
  });

  return (
    <div className="overlay-backdrop" onMouseDown={(event) => {
      if (event.currentTarget === event.target) onClose();
    }}>
      <section className="detail-panel" aria-label={`${book.title} details`}>
        <div className="detail-hero">
          <BookCover title={book.title} coverUrl={book.coverUrl} size="lg" />
          <div className="detail-heading">
            <h2>{book.title}</h2>
            <p>{book.author || "Unknown author"}</p>
            {book.status === "FINISHED" && <strong>{ratingLabel(book.rating)}</strong>}
          </div>
          <button className="detail-close" type="button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="detail-body">
          {book.status === "READING" && (
            <section className="detail-card">
              <div className="progress-meta">
                <span>Progress</span>
                <strong>{pct}%</strong>
              </div>
              <div className="progress-track tall">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="detail-stats">
                <div>
                  <span>Pages read</span>
                  <strong>{book.pagesRead} / {book.pageCount || "?"}</strong>
                </div>
                <div>
                  <span>Book pace</span>
                  <strong>{book.bookPace ? `${book.bookPace} p/day` : "Pending"}</strong>
                </div>
                <div>
                  <span>Est. finish</span>
                  <strong>{book.predictedFinishDate || "Pending"}</strong>
                </div>
              </div>
            </section>
          )}

          {book.status === "WANT_TO_READ" && (
            <section className="detail-card status-line">
              <span />
              <p>On your reading list, not started yet.</p>
              <button
                className="primary-button"
                type="button"
                onClick={() => statusMutation.mutate("READING")}
                disabled={statusMutation.isPending}
              >
                Start reading
              </button>
            </section>
          )}

          {book.status === "FINISHED" && (
            <section className="detail-card">
              <div className="finished-row">
                <div>
                  <span>Finished</span>
                  <strong>{book.finishedAt || "Recently"}</strong>
                </div>
                <div>
                  <span>Backfilled</span>
                  <strong>{book.isBackfilled ? "Yes" : "No"}</strong>
                </div>
              </div>
              <div className="rating-row" aria-label="Rate this book">
                {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
                  <button
                    type="button"
                    key={value}
                    className={book.rating === value ? "active" : ""}
                    onClick={() => ratingMutation.mutate(value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="section-title">
              <span>Reading sessions</span>
              <strong>{sessions.length}</strong>
              {book.status === "READING" && (
                <button className="primary-button" type="button" onClick={onLogProgress}>
                  Log progress
                </button>
              )}
            </div>

            {sessions.length === 0 && (
              <div className="inline-note">No sessions logged for this book yet.</div>
            )}

            <div className="detail-sessions">
              {sessions.map((session) => (
                <article key={session.id}>
                  <div>
                    <strong>{session.pagesRead} pages</strong>
                    <span>{session.sessionDate}</span>
                  </div>
                  {session.notes && <p>{session.notes}</p>}
                </article>
              ))}
            </div>
          </section>

          <div className="detail-remove-row">
            {confirming ? (
              <>
                <span className="remove-warning">This will also delete all reading sessions for this book.</span>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => setConfirming(false)}
                  disabled={removeMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  className="danger-button"
                  type="button"
                  onClick={() => removeMutation.mutate()}
                  disabled={removeMutation.isPending}
                >
                  <Trash2 size={14} />
                  Confirm remove
                </button>
              </>
            ) : (
              <button
                className="danger-button-outline"
                type="button"
                onClick={() => setConfirming(true)}
              >
                <Trash2 size={14} />
                Remove from library
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
