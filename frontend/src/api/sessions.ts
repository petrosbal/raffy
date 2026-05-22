import { apiRequest } from "./client";
import type { LogSessionRequest, ReadingSession } from "./types";

export const sessionsApi = {
  listJournal() {
    return apiRequest<ReadingSession[]>("/journal");
  },

  log(userBookId: string, request: LogSessionRequest) {
    return apiRequest<ReadingSession>(`/library/${userBookId}/sessions`, {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  remove(sessionId: string) {
    return apiRequest<void>(`/journal/${sessionId}`, {
      method: "DELETE",
    });
  },
};
