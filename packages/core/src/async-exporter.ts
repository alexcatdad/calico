import { fromCSV, toCSV } from "./formats/csv";
import { fromJSON, toJSON } from "./formats/json";
import { toMarkdown } from "./formats/md";
import { fromYAML, toYAML } from "./formats/yaml";
import { type CSVOptions, type MarkdownOptions } from "./types";

/**
 * Async version of DataExporter using Web Workers for large datasets.
 * Automatically decides whether to use workers based on data size.
 *
 * Browser-only. For typical datasets (<1000 records), use DataExporter instead.
 * Workers prevent UI blocking for large exports (10K+ records).
 */
export class AsyncDataExporter {
  private worker: Worker;
  private threshold: number;

  constructor(workerThreshold = 10000) {
    this.threshold = workerThreshold;
    this.worker = new Worker(new URL("./worker.ts", import.meta.url), {
      type: "module",
    });
  }

  private shouldUseWorker(data: any): boolean {
    if (Array.isArray(data)) {
      return data.length > this.threshold;
    }
    return Object.keys(data).length > this.threshold;
  }

  async toJSON<T>(data: T, pretty = true): Promise<string> {
    if (this.shouldUseWorker(data)) {
      return this.workerExport(data, "json", { pretty });
    }
    return toJSON(data, pretty);
  }

  async toCSV<T>(data: T[], options: CSVOptions = {}): Promise<string> {
    if (this.shouldUseWorker(data)) {
      return this.workerExport(data, "csv", { options });
    }
    return toCSV(data, options);
  }

  async toYAML<T>(data: T, indent = 2): Promise<string> {
    if (this.shouldUseWorker(data)) {
      return this.workerExport(data, "yaml", { indent });
    }
    return toYAML(data, indent);
  }

  async toMarkdown<T>(data: T, options: MarkdownOptions = {}): Promise<string> {
    if (this.shouldUseWorker(data)) {
      return this.workerExport(data, "md", { options });
    }
    return toMarkdown(data, options);
  }

  fromJSON<T>(input: string): Promise<T> {
    return Promise.resolve(fromJSON<T>(input));
  }

  fromCSV<T>(input: string, options: CSVOptions = {}): Promise<T[]> {
    return Promise.resolve(fromCSV<T>(input, options));
  }

  fromYAML<T>(input: string): Promise<T> {
    return Promise.resolve(fromYAML<T>(input));
  }

  private workerExport(data: any, format: string, opts: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const handler = (event: MessageEvent) => {
        this.worker.removeEventListener("message", handler);
        this.worker.removeEventListener("error", errorHandler);
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      const errorHandler = (error: ErrorEvent) => {
        this.worker.removeEventListener("message", handler);
        this.worker.removeEventListener("error", errorHandler);
        reject(new Error(`Worker error: ${error.message}`));
      };

      this.worker.addEventListener("message", handler, { once: true });
      this.worker.addEventListener("error", errorHandler, { once: true });
      this.worker.postMessage({ data, format, opts });
    });
  }

  destroy(): void {
    this.worker.terminate();
  }
}
