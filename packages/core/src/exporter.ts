import { type CSVOptions, type MarkdownOptions } from './types';
import { toJSON, fromJSON } from './formats/json';
import { toCSV, fromCSV } from './formats/csv';
import { toYAML, fromYAML } from './formats/yaml';
import { toMarkdown } from './formats/md';

export class DataExporter {
    public toJSON<T>(data: T, pretty: boolean = true): string {
        return toJSON(data, pretty);
    }

    public toCSV<T>(data: T[], options: CSVOptions = {}): string {
        return toCSV(data, options);
    }

    public toYAML<T>(data: T, indent: number = 2): string {
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
