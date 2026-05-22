import { apiRequest } from "./client";
import type { AddBookRequest, UpdateBookRequest, UserBook } from "./types";

export const libraryApi = {
  list() {
    return apiRequest<UserBook[]>("/library");
  },

  add(request: AddBookRequest) {
    return apiRequest<UserBook>("/library", {
      method: "POST",
      body: JSON.stringify(request),
    });
  },

  update(id: string, request: UpdateBookRequest) {
    return apiRequest<UserBook>(`/library/${id}`, {
      method: "PATCH",
      body: JSON.stringify(request),
    });
  },

  remove(id: string) {
    return apiRequest<void>(`/library/${id}`, {
      method: "DELETE",
    });
  },
};
