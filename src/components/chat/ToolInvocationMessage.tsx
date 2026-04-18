"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

export function getToolLabel(toolName: string, args: Record<string, unknown>): string {
  const command = typeof args.command === "string" ? args.command : undefined;
  const path    = typeof args.path    === "string" ? args.path    : undefined;
  const newPath = typeof args.new_path === "string" ? args.new_path : undefined;

  if (toolName === "str_replace_editor") {
    if (command === "create")                             return path ? `Creating ${path}`        : "Creating file\u2026";
    if (command === "str_replace" || command === "insert") return path ? `Editing ${path}`        : "Editing file\u2026";
    if (command === "view")                               return path ? `Reading ${path}`         : "Reading file\u2026";
    if (command === "undo_edit")                          return path ? `Undoing edit to ${path}` : "Undoing edit\u2026";
    return path ? `Working on ${path}` : "Working\u2026";
  }

  if (toolName === "file_manager") {
    if (command === "rename") {
      if (path && newPath) return `Renaming ${path} to ${newPath}`;
      return path ? `Renaming ${path}\u2026` : "Renaming file\u2026";
    }
    if (command === "delete") return path ? `Deleting ${path}` : "Deleting file\u2026";
    return "Working\u2026";
  }

  return toolName;
}

export function ToolInvocationMessage({ toolInvocation }: { toolInvocation: ToolInvocation }) {
  const label = getToolLabel(
    toolInvocation.toolName,
    (toolInvocation.args ?? {}) as Record<string, unknown>
  );
  const isDone =
    toolInvocation.state === "result" &&
    (toolInvocation as Extract<ToolInvocation, { state: "result" }>).result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
