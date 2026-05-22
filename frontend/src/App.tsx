import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import type { UserBook } from "./api/types";
import { AuthProvider } from "./auth/AuthProvider";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { TopBar } from "./components/TopBar";
import { DiscoverOverlay } from "./components/DiscoverOverlay";
import { LogProgressModal } from "./components/LogProgressModal";
import { BookDetailOverlay } from "./components/BookDetailOverlay";
import { Toast } from "./components/Toast";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { JournalPage } from "./pages/JournalPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 20_000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppShell page="home" />} />
              <Route path="/journal" element={<AppShell page="journal" />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

type AppShellProps = {
  page: "home" | "journal";
};

function AppShell({ page }: AppShellProps) {
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [logOpen, setLogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<UserBook | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2600);
  }

  return (
    <div className="app-shell">
      <TopBar onSearch={() => setDiscoverOpen(true)} />

      {page === "home" ? (
        <HomePage
          onDiscover={() => setDiscoverOpen(true)}
          onLogProgress={() => setLogOpen(true)}
          onOpenBook={setSelectedBook}
        />
      ) : (
        <JournalPage onOpenBook={setSelectedBook} />
      )}

      {discoverOpen && (
        <DiscoverOverlay
          onClose={() => setDiscoverOpen(false)}
          onToast={showToast}
        />
      )}

      {logOpen && (
        <LogProgressModal
          onClose={() => setLogOpen(false)}
          onToast={showToast}
        />
      )}

      {selectedBook && (
        <BookDetailOverlay
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onToast={showToast}
        />
      )}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
