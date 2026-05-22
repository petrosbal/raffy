import { apiRequest } from "./client";
import type { InsightsResponse } from "./types";

export const insightsApi = {
  get() {
    return apiRequest<InsightsResponse>("/insights");
  },
};
