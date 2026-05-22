type BookCoverProps = {
  title: string;
  coverUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const palettes = [
  ["#c4a882", "#a07a4a"],
  ["#6b4e4e", "#3d2b2b"],
  ["#7a6b5a", "#4a3e33"],
  ["#8a9e7c", "#5a7050"],
  ["#9e8a7c", "#6b5a4e"],
  ["#b5a898", "#8a7060"],
];

function hashTitle(title: string) {
  return title.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function BookCover({ title, coverUrl, size = "md" }: BookCoverProps) {
  const [from, to] = palettes[hashTitle(title) % palettes.length];

  if (coverUrl) {
    return (
      <img
        className={`book-cover book-cover-${size}`}
        src={coverUrl}
        alt={`${title} cover`}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`book-cover book-cover-${size} book-cover-fallback`}
      style={{ background: `linear-gradient(145deg, ${from}, ${to})` }}
      aria-label={`${title} cover placeholder`}
    >
      {title.slice(0, 1).toUpperCase()}
    </div>
  );
}
