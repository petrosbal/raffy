export const queryKeys = {
  library: ["library"] as const,
  journal: ["journal"] as const,
  insights: ["insights"] as const,
  search: (query: string) => ["search", query] as const,
};
