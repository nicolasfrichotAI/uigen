import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { getToolLabel, ToolInvocationMessage } from "../ToolInvocationMessage";

afterEach(() => {
  cleanup();
});

// --- getToolLabel: str_replace_editor ---

test("getToolLabel: str_replace_editor create with path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create", path: "/App.jsx" })).toBe("Creating /App.jsx");
});

test("getToolLabel: str_replace_editor str_replace with path", () => {
  expect(getToolLabel("str_replace_editor", { command: "str_replace", path: "/components/Button.tsx" })).toBe("Editing /components/Button.tsx");
});

test("getToolLabel: str_replace_editor insert with path", () => {
  expect(getToolLabel("str_replace_editor", { command: "insert", path: "/utils/helpers.ts" })).toBe("Editing /utils/helpers.ts");
});

test("getToolLabel: str_replace_editor view with path", () => {
  expect(getToolLabel("str_replace_editor", { command: "view", path: "/App.jsx" })).toBe("Reading /App.jsx");
});

test("getToolLabel: str_replace_editor undo_edit with path", () => {
  expect(getToolLabel("str_replace_editor", { command: "undo_edit", path: "/App.jsx" })).toBe("Undoing edit to /App.jsx");
});

// --- getToolLabel: file_manager ---

test("getToolLabel: file_manager rename with both paths", () => {
  expect(getToolLabel("file_manager", { command: "rename", path: "/old.tsx", new_path: "/new.tsx" })).toBe("Renaming /old.tsx to /new.tsx");
});

test("getToolLabel: file_manager delete with path", () => {
  expect(getToolLabel("file_manager", { command: "delete", path: "/App.jsx" })).toBe("Deleting /App.jsx");
});

// --- getToolLabel: fallbacks ---

test("getToolLabel: unknown tool name falls back to tool name", () => {
  expect(getToolLabel("some_custom_tool", { command: "do_thing" })).toBe("some_custom_tool");
});

test("getToolLabel: str_replace_editor with no command returns working fallback", () => {
  const label = getToolLabel("str_replace_editor", {});
  expect(label).toBe("Working\u2026");
});

test("getToolLabel: str_replace_editor create with no path returns file fallback", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" })).toBe("Creating file\u2026");
});

test("getToolLabel: file_manager rename with no paths returns file fallback", () => {
  expect(getToolLabel("file_manager", { command: "rename" })).toBe("Renaming file\u2026");
});

test("getToolLabel: file_manager with no command returns working fallback", () => {
  expect(getToolLabel("file_manager", {})).toBe("Working\u2026");
});

// --- ToolInvocationMessage render ---

test("ToolInvocationMessage shows spinner when state is call", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={{ toolCallId: "1", toolName: "str_replace_editor", state: "call", args: { command: "create", path: "/App.jsx" } }}
    />
  );
  const spinner = document.querySelector(".animate-spin");
  const greenDot = document.querySelector(".bg-emerald-500");
  expect(spinner).toBeTruthy();
  expect(greenDot).toBeNull();
});

test("ToolInvocationMessage shows spinner when state is partial-call", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={{ toolCallId: "1", toolName: "str_replace_editor", state: "partial-call", args: {} }}
    />
  );
  expect(document.querySelector(".animate-spin")).toBeTruthy();
  expect(document.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationMessage shows green dot when state is result with result", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={{ toolCallId: "1", toolName: "str_replace_editor", state: "result", args: { command: "create", path: "/App.jsx" }, result: "Success" }}
    />
  );
  expect(document.querySelector(".bg-emerald-500")).toBeTruthy();
  expect(document.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationMessage renders human-readable label", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={{ toolCallId: "1", toolName: "str_replace_editor", state: "result", args: { command: "create", path: "/App.jsx" }, result: "Success" }}
    />
  );
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("ToolInvocationMessage renders file_manager delete label", () => {
  render(
    <ToolInvocationMessage
      toolInvocation={{ toolCallId: "1", toolName: "file_manager", state: "call", args: { command: "delete", path: "/old.tsx" } }}
    />
  );
  expect(screen.getByText("Deleting /old.tsx")).toBeDefined();
});
