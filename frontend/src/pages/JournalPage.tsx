import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { queryKeys } from "../api/queryKeys";
import { sessionsApi } from "../api/sessions";
import type { ReadingSession, UserBook } from "../api/types";
import { BookCover } from "../components/BookCover";

type JournalPageProps = {
  onOpenBook: (book: UserBook) => void;
};

export function JournalPage({ onOpenBook: _onOpenBook }: JournalPageProps) {
  const queryClient = useQueryClient();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    if (!confirmingId) return;
    function handleClickOutside() { setConfirmingId(null); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [confirmingId]);

  const journalQuery = useQuery({
    queryKey: queryKeys.journal,
    queryFn: sessionsApi.listJournal,
  });

  const deleteMutation = useMutation({
    mutationFn: sessionsApi.remove,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.journal }),
        queryClient.invalidateQueries({ queryKey: queryKeys.library }),
        queryClient.invalidateQueries({ queryKey: queryKeys.insights }),
      ]);
    },
  });

  const sessions = journalQuery.data ?? [];
  const groups = groupSessionsByMonth(sessions);

  return (
    <main className="page-shell journal-shell">
      <div className="page-toolbar">
        <div>
          <h1>Journal</h1>
          <p>{sessions.length} logged reading sessions</p>
        </div>
      </div>

      {journalQuery.isLoading && <div className="inline-note">Loading journal...</div>}
      {journalQuery.isError && <div className="inline-error">Could not load journal.</div>}

      {groups.length === 0 && !journalQuery.isLoading && (
        <div className="journal-empty">No sessions yet. Log progress from an active book.</div>
      )}

      <div className="journal-groups">
        {groups.map((group) => (
          <section className="journal-group" key={group.month}>
            <h2>{group.month}</h2>
            <div className="journal-list">
              {group.sessions.map((session) => (
                <article className="session-card" key={session.id}>
                  <BookCover
                    title={session.bookTitle}
                    coverUrl={session.bookCoverUrl}
                    size="sm"
                  />
                  <div className="session-body">
                    <strong>{session.bookTitle}</strong>
                    <div className="session-pages">{session.pagesRead} pages</div>
                    {session.notes && <p>{session.notes}</p>}
                  </div>
                  <div className="session-actions">
                    {confirmingId === session.id ? (
                      <div className="session-confirm" onMouseDown={(e) => e.stopPropagation()}>
                        <button
                          className="secondary-button tiny"
                          type="button"
                          onClick={() => setConfirmingId(null)}
                          disabled={deleteMutation.isPending}
                        >
                          Cancel
                        </button>
                        <button
                          className="danger-button tiny"
                          type="button"
                          onClick={() => deleteMutation.mutate(session.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        className="icon-button session-delete"
                        type="button"
                        aria-label="Delete session"
                        onClick={() => setConfirmingId(session.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                    <span className="session-date">{formatDate(session.sessionDate, "day")}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

function groupSessionsByMonth(sessions: ReadingSession[]) {
  const grouped = new Map<string, ReadingSession[]>();

  for (const session of sessions) {
    const key = formatDate(session.sessionDate, "month");
    grouped.set(key, [...(grouped.get(key) ?? []), session]);
  }

  return Array.from(grouped.entries()).map(([month, monthSessions]) => ({
    month,
    sessions: monthSessions,
  }));
}

function formatDate(value: string, style: "day" | "month") {
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat("en", {
    month: style === "day" ? "short" : "long",
    day: style === "day" ? "numeric" : undefined,
    year: "numeric",
  }).format(date);
}
