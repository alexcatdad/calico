import { fromCSV, toCSV } from "./formats/csv";
import { fromJSON, toJSON } from "./formats/json";
import { toMarkdown } from "./formats/md";
import { fromYAML, toYAML } from "./formats/yaml";
import { type CSVOptions, type MarkdownOptions } from "./types";

export class DataExporter {
  public toJSON<T>(data: T, pretty = true): string {
    return toJSON(data, pretty);
  }

  public toCSV<T>(data: T[], options: CSVOptions = {}): string {
    return toCSV(data, options);
  }

  public toYAML<T>(data: T, indent = 2): string {
    return toYAML(data, indent);
  }

  public toMarkdown<T>(data: T, options: MarkdownOptions = {}): string {
    return toMarkdown(data, options);
  }

  public fromJSON<T>(input: string): T {
    return fromJSON<T>(input);
  }

  public fromCSV<T>(input: string, options: CSVOptions = {}): T[] {
    return fromCSV<T>(input, options);
  }

  public fromYAML<T>(input: string): T {
    return fromYAML<T>(input);
  }
}
