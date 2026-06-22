import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import GlobalSearchModal from "../GlobalSearchModal";
import { ErrorBoundary } from "../ErrorBoundary";

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* Fixed gradient background mesh */}
      <div className="gradient-mesh" aria-hidden="true" />

      {/* Sidebar mobile overlay background */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="app-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="main-content">
          <Topbar
            onOpenSearch={() => setSearchOpen(true)}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />

          <div className="page-container animate-fade-in">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
