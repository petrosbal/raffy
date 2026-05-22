import { apiRequest } from "./client";
import type { BookSearchResult } from "./types";

export const searchApi = {
  search(query: string) {
    return apiRequest<BookSearchResult[]>(
      `/discover?q=${encodeURIComponent(query)}`,
    );
  },
};
