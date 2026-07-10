import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import Topbar from "../Topbar";
import GlobalSearchModal from "../GlobalSearchModal";
import { ErrorBoundary } from "../ErrorBoundary";

export default function AppLayout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Sync mobile state
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleToggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
    } else {
      setSidebarCollapsed((prev) => !prev);
    }
  };

  const currentSidebarWidth = isMobile
    ? "280px"
    : (sidebarCollapsed ? "80px" : "280px");

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

      <div className="app-layout" style={{ "--sidebar-width": currentSidebarWidth }}>
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={!isMobile && sidebarCollapsed}
        />

        <main className="main-content">
          <Topbar
            onOpenSearch={() => setSearchOpen(true)}
            onToggleSidebar={handleToggleSidebar}
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
