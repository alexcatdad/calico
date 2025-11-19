import type { MarkdownOptions } from "../types";
import { detectCircularReference } from "../utils";

export function toMarkdown<T>(data: T, options: MarkdownOptions = {}): string {
  detectCircularReference(data);

  const parts: string[] = [];

  if (options.title) {
    parts.push(`# ${options.title}\n`);
  }

  if (options.includeTableOfContents) {
    // Simple TOC based on what we generate?
    // SPEC says "TOC for complex structures".
    // If we just dump data, TOC might not be very useful unless we generate sections.
    // Let's assume we generate sections for top-level keys if object, or just "Data" if array.
    // For now, let's just add a placeholder or simple TOC if we have sections.
    // If data is object, keys can be sections.
    if (typeof data === "object" && data !== null && !Array.isArray(data)) {
      parts.push("## Table of Contents");
      for (const key of Object.keys(data as object)) {
        parts.push(`- [${key}](#${key.toLowerCase()})`);
      }
      parts.push("");
    }
  }

  if (Array.isArray(data)) {
    // Array of objects -> Table
    if (data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      const allKeys = new Set<string>();
      for (const item of data) {
        if (typeof item === "object" && item !== null) {
          for (const k of Object.keys(item as object)) {
            allKeys.add(k);
          }
        }
      }
      const headers = Array.from(allKeys);

      // Header
      parts.push(`| ${headers.join(" | ")} |`);
      // Separator
      parts.push(`| ${headers.map(() => "---").join(" | ")} |`);
      // Rows
      for (const item of data) {
        const row = headers
          .map((h) => {
            const val = (item as Record<string, unknown>)[h];
            return val === undefined || val === null ? "" : String(val);
          })
          .join(" | ");
        parts.push(`| ${row} |`);
      }
    } else {
      // Simple array -> List
      for (const item of data) {
        parts.push(`- ${String(item)}`);
      }
    }
  } else if (typeof data === "object" && data !== null) {
    // Object -> Sections or List
    // SPEC: "Key-value pairs for plain objects"
    // Example:
    // ## Plain Object
    // - name: John
    // - age: 30

    // If we have a title, maybe we don't need a header here?
    // Let's just list keys.
    for (const [key, value] of Object.entries(data as object)) {
      // If value is object/array, maybe nested?
      // SPEC doesn't specify deep nesting format.
      // Let's keep it simple: key: value
      parts.push(`- **${key}**: ${JSON.stringify(value)}`);
    }
  } else {
    // Primitive
    parts.push(String(data));
  }

  return parts.join("\n");
}
