import { ArrowDown, ArrowUp, Flame } from "lucide-react";
import type { InsightsResponse } from "../api/types";
import { BookCover } from "./BookCover";

type InsightsStripProps = {
  insights?: InsightsResponse;
  isLoading?: boolean;
};

export function InsightsStrip({ insights, isLoading }: InsightsStripProps) {
  const totalMomentum = insights?.totalMomentum ?? 0;
  const monthlyMomentum = insights?.monthlyMomentum ?? 0;
  const delta = monthlyMomentum - totalMomentum;
  const multiplier = totalMomentum > 0 ? monthlyMomentum / totalMomentum : 0;
  const genreEntries = Object.entries(insights?.genreFingerprint ?? {});
  const genreTotal = genreEntries.reduce((sum, [, count]) => sum + count, 0);
  const genres = genreEntries.map(([label, count], index) => ({
    label,
    pct: genreTotal ? Math.round((count / genreTotal) * 100) : 0,
    color: `var(--genre-color-${index % 5})`,
  }));

  return (
    <section className="insights-strip" aria-label="Reading insights">
      <div className="metric-card streak-card">
        <div className="metric-number">{isLoading ? "--" : insights?.readingStreak ?? 0}</div>
        <div className="metric-label">day streak</div>
        <Flame size={20} aria-hidden="true" />
      </div>

      <div className="metric-card">
        <div className="metric-kicker">Total Momentum</div>
        <div className="metric-value">{totalMomentum.toFixed(1)}</div>
        <div className="metric-label">pages / day</div>
      </div>

      <div className="metric-card">
        <div className="metric-kicker">Monthly Momentum</div>
        <div className="metric-value accent-value">{monthlyMomentum.toFixed(1)}</div>
        <div className="metric-label">pages / day</div>
        <div className={`momentum-line${delta < 0 ? " momentum-negative" : ""}`}>
          <div className="momentum-delta">
            {delta >= 0 ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />}
            <strong>{delta >= 0 ? "+" : ""}{delta.toFixed(1)} p/day</strong>
          </div>
          <span>{multiplier ? `${multiplier.toFixed(2)} ×` : "new"}  vs all-time</span>
        </div>
      </div>

      <div className="metric-card genre-card">
        <GenreDonut genres={genres} />
        <div className="genre-list">
          <div className="metric-kicker">Genres</div>
          {genres.length === 0 && <span className="metric-label">Finish books to build this.</span>}
          {genres.slice(0, 3).map((genre) => (
            <div className="genre-row" key={genre.label}>
              <span style={{ background: genre.color }} />
              <strong>{genre.label}</strong>
              <em>{genre.pct}%</em>
            </div>
          ))}
        </div>
      </div>

      <div className="metric-card leaderboard-card">
        <div className="leaderboard-header">
          <div className="metric-kicker">Top rated</div>
          <button type="button">See all</button>
        </div>
        <div className="leaderboard-list">
          {(insights?.bookLeaderboard ?? []).slice(0, 4).map((book, index) => (
            <div className="leaderboard-item" key={`${book.title}-${index}`}>
              <BookCover title={book.title} coverUrl={book.coverUrl} size="sm" />
              <span>{book.rating}/10</span>
            </div>
          ))}
          {(insights?.bookLeaderboard ?? []).length === 0 && (
            <span className="metric-label">Ratings appear after finished books.</span>
          )}
        </div>
      </div>
    </section>
  );
}

type GenreDonutProps = {
  genres: Array<{ label: string; pct: number; color: string }>;
};

function GenreDonut({ genres }: GenreDonutProps) {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  if (genres.length === 0) {
    return (
      <svg className="genre-donut" width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(85,73,74,0.12)" strokeWidth="7" />
      </svg>
    );
  }

  return (
    <svg className="genre-donut" width="56" height="56" viewBox="0 0 56 56">
      {genres.map((genre) => {
        const dash = (genre.pct / 100) * circumference;
        const arc = (
          <circle
            key={genre.label}
            cx="28"
            cy="28"
            r={radius}
            fill="none"
            strokeWidth="7"
            strokeDasharray={`${dash} ${circumference - dash}`}
            strokeDashoffset={-offset}
            style={{ stroke: genre.color, transform: "rotate(-90deg)", transformOrigin: "28px 28px" }}
          />
        );
        offset += dash;
        return arc;
      })}
    </svg>
  );
}
