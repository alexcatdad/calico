import { fromCSV, toCSV } from "./formats/csv";
import { fromJSON, toJSON } from "./formats/json";
import { toMarkdown } from "./formats/md";
import { fromYAML, toYAML } from "./formats/yaml";

/**
 * Web Worker for async data serialization.
 * Handles CPU-intensive formatting in background thread.
 */
self.addEventListener("message", (event: MessageEvent) => {
  const { data, format, opts } = event.data;

  try {
    let result: string;

    switch (format) {
      case "json":
        result = toJSON(data, opts.pretty ?? true);
        break;
      case "csv":
        result = toCSV(data, opts.options ?? {});
        break;
      case "yaml":
        result = toYAML(data, opts.indent ?? 2);
        break;
      case "md":
        result = toMarkdown(data, opts.options ?? {});
        break;
      default:
        throw new Error(`Unknown format: ${format}`);
    }

    self.postMessage(result);
  } catch (error) {
    self.postMessage({
      error: error instanceof Error ? error.message : "Unknown error",
      type: "error",
    });
  }
});
