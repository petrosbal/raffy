export type ReadingStatus = "WANT_TO_READ" | "READING" | "FINISHED";

export type AuthResponse = {
  token: string;
  email: string;
  displayName: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = LoginRequest & {
  displayName: string;
};

export type UserBook = {
  id: string;
  googleBooksId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  genre: string | null;
  status: ReadingStatus;
  startedAt: string | null;
  finishedAt: string | null;
  rating: number | null;
  isBackfilled: boolean;
  pagesRead: number;
  bookPace: number | null;
  predictedFinishDate: string | null;
};

export type AddBookRequest = {
  googleBooksId: string;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  pageCount?: number | null;
  genre?: string | null;
  status?: ReadingStatus;
  finishedAt?: string | null;
  rating?: number | null;
  isBackfilled?: boolean;
};

export type UpdateBookRequest = {
  status?: ReadingStatus;
  rating?: number | null;
};

export type ReadingSession = {
  id: string;
  userBookId: string;
  bookTitle: string;
  bookCoverUrl: string | null;
  pagesRead: number;
  sessionDate: string;
  notes: string | null;
};

export type LogSessionRequest = {
  pagesRead: number;
  sessionDate?: string;
  notes?: string | null;
};

export type BookSearchResult = {
  googleBooksId: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
  pageCount: number | null;
  genre: string | null;
};

export type InsightsResponse = {
  totalMomentum: number | null;
  monthlyMomentum: number | null;
  readingStreak: number;
  genreFingerprint: Record<string, number>;
  bookLeaderboard: Array<{
    title: string;
    author: string | null;
    coverUrl: string | null;
    rating: number;
  }>;
};
