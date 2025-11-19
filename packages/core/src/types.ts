export type ExportFormat = "json" | "csv" | "yaml" | "md";
export type ImportFormat = "json" | "csv" | "yaml";

export interface ValidationSchema {
  type?: string;
  properties?: Record<string, ValidationSchema>;
  required?: string[];
  items?: ValidationSchema;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
}

export interface CSVOptions {
  headers?: boolean;
  delimiter?: string;
  quoteStrings?: boolean;
}

export interface MarkdownOptions {
  title?: string;
  includeTableOfContents?: boolean;
}

export interface ExportResult {
  data: string;
  format: ExportFormat;
  size: number;
  timestamp: Date;
}

export interface ValidationResult {
  valid: boolean;
  errors?: Array<{ path: string; message: string; value: unknown }>;
}
