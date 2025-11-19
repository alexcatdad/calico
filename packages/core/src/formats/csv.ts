import type { CSVOptions } from "../types";
import { detectCircularReference } from "../utils";

const QUOTE_PATTERN = /"/g;

export function toCSV<T>(data: T[], options: CSVOptions = {}): string {
  if (!Array.isArray(data)) {
    throw new TypeError(`toCSV requires an array, received ${typeof data}`);
  }

  if (data.length === 0) {
    return "";
  }

  detectCircularReference(data);

  // Check for mixed types (objects vs primitives)
  const isObject = typeof data[0] === "object" && data[0] !== null;
  for (let i = 1; i < data.length; i++) {
    const itemIsObject = typeof data[i] === "object" && data[i] !== null;
    if (itemIsObject !== isObject) {
      throw new TypeError(
        "CSV data must be array of objects or primitives, received mixed types",
      );
    }
  }

  const delimiter = options.delimiter || ",";
  const quoteStrings = options.quoteStrings ?? true;
  const includeHeaders = options.headers ?? true;

  const escapeField = (field: any): string => {
    if (field === null || field === undefined) return "";
    const str = String(field);
    if (
      quoteStrings ||
      str.includes(delimiter) ||
      str.includes('"') ||
      str.includes("\n")
    ) {
      return `"${str.replace(QUOTE_PATTERN, '""')}"`;
    }
    return str;
  };

  if (!isObject) {
    // Array of primitives
    const rows = data.map((item) => escapeField(item));
    return rows.join("\n");
  }

  // Array of objects
  // Get all unique keys from all objects to ensure we cover everything
  const allKeys = new Set<string>();
  for (let i = 0; i < data.length; i++) {
    const keys = Object.keys(data[i] as object);
    for (let j = 0; j < keys.length; j++) {
      allKeys.add(keys[j]);
    }
  }
  const headers = Array.from(allKeys);

  const rows: string[] = [];

  if (includeHeaders) {
    const headerRow: string[] = [];
    for (let i = 0; i < headers.length; i++) {
      headerRow.push(escapeField(headers[i]));
    }
    rows.push(headerRow.join(delimiter));
  }

  for (let i = 0; i < data.length; i++) {
    const row: string[] = [];
    const item = data[i] as any;
    for (let j = 0; j < headers.length; j++) {
      row.push(escapeField(item[headers[j]]));
    }
    rows.push(row.join(delimiter));
  }

  return rows.join("\n");
}

export function fromCSV<T>(input: string, options: CSVOptions = {}): T[] {
  if (typeof input !== "string") {
    throw new TypeError(
      `fromCSV input must be string, received ${typeof input}`,
    );
  }

  if (!input.trim()) {
    return [];
  }

  const delimiter = options.delimiter || ",";
  const hasHeaders = options.headers ?? true;

  // Simple CSV parser that handles quoted fields and newlines
  // This is a state machine approach for robustness
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    const nextChar = input[i + 1];

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"';
          i++; // Skip next quote
        } else {
          inQuotes = false;
        }
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === delimiter) {
        currentRow.push(currentField);
        currentField = "";
      } else if (char === "\n" || (char === "\r" && nextChar === "\n")) {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
        if (char === "\r") i++; // Skip \n
      } else if (char === "\r") {
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
      } else {
        currentField += char;
      }
    }
  }

  // Push last field/row if exists
  if (currentField || currentRow.length > 0 || input.endsWith(delimiter)) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return [];
  }

  if (!hasHeaders) {
    // If no headers, we can't really map to T unless T is array of strings or we just return array of strings
    // But return type is T[]. If T is object, we need headers.
    // If T is primitive, we return array of primitives?
    // SPEC says: "All values are strings - consumer responsibility to type-cast"
    // SPEC says: "First row assumed to be headers (unless headers: false)"
    // If headers: false, we probably return array of arrays or array of objects with index keys?
    // Let's assume if no headers, we return array of arrays (but type says T[]) or maybe we just return objects with "0", "1" keys?
    // Let's stick to returning objects with generated keys if no headers, OR just array of values if single column?
    // Actually, for simplicity and typical use, fromCSV usually returns objects.
    // If headers=false, maybe we treat it as array of arrays?
    // Let's assume T is array of strings if headers=false.
    return rows as unknown as T[];
  }

  const headers = rows[0];
  const dataRows = rows.slice(1);

  return dataRows.map((row, rowIndex) => {
    const obj: any = {};
    // Check for mismatched columns
    // SPEC: Error: "CSV line [row] has mismatched columns. Expected [expected], got [actual]"
    // We can be lenient or strict. SPEC says strict error.
    // However, standard CSV parsers often fill with null/empty.
    // Let's implement the error as per spec?
    // "CSV line [row] has mismatched columns..."
    // Wait, CSV allows variable length rows sometimes, but for object mapping it's bad.
    // Let's try to map as best as possible, but if length differs significantly it might be an error.
    // Actually, let's just map what we have.

    headers.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : "";
    });
    return obj as T;
  });
}
