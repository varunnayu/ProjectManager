/**
 * constants.js — Application-wide constants.
 * Import from here instead of hard-coding values across the codebase.
 */

// ─── App Info ────────────────────────────────────────────────────────────────
export const APP_NAME = "ProjectVault AI";
export const APP_VERSION = "1.0.0";

// ─── Routes ──────────────────────────────────────────────────────────────────
export const ROUTES = {
  HOME: "/",
  PROJECTS: "/projects",
  TASKS: "/tasks",
  NOTES: "/notes",
  RESOURCES: "/resources",
  SETTINGS: "/settings",
  LOGIN: "/login",
  REGISTER: "/register",
};

// ─── Project Status ───────────────────────────────────────────────────────────
export const PROJECT_STATUS = {
  PLANNING: "planning",
  ACTIVE: "active",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  ARCHIVED: "archived",
};

// ─── Task Priority ────────────────────────────────────────────────────────────
export const TASK_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
};

// ─── Collections (Firestore) ──────────────────────────────────────────────────
export const COLLECTIONS = {
  USERS: "users",
  PROJECTS: "projects",
  TASKS: "tasks",
  NOTES: "notes",
  RESOURCES: "resources",
};

// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;

// ─── Local Storage Keys ───────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  THEME: "pv_theme",
  SIDEBAR_COLLAPSED: "pv_sidebar_collapsed",
  RECENT_PROJECTS: "pv_recent_projects",
};
