import { DataExporter } from "../exporter";
import {
  type CSVOptions,
  type MarkdownOptions,
  type ValidationResult,
  type ValidationSchema,
} from "../types";
import { validate } from "./json-schema";

export { validate };
export type { ValidationSchema, ValidationResult };

/**
 * Creates a DataExporter with validation support.
 * Only use this if you need schema validation - it adds ~2.8KB to your bundle.
 * For smaller bundles, use DataExporter directly and validate separately.
 */
export class ValidatingExporter extends DataExporter {
  private schema?: ValidationSchema;
  private throwOnValidationError: boolean;

  constructor(schema?: ValidationSchema, throwOnValidationError = true) {
    super();
    this.schema = schema;
    this.throwOnValidationError = throwOnValidationError;
  }

  public validateData(data: unknown): ValidationResult {
    if (!this.schema) {
      return { valid: true };
    }
    return validate(data, this.schema);
  }

  public setSchema(schema: ValidationSchema): void {
    this.schema = schema;
  }

  public toJSON<T>(data: T, pretty = true): string {
    this.validateOrThrow(data);
    return super.toJSON(data, pretty);
  }

  public toCSV<T>(data: T[], options: CSVOptions = {}): string {
    this.validateOrThrow(data);
    return super.toCSV(data, options);
  }

  public toYAML<T>(data: T, indent = 2): string {
    this.validateOrThrow(data);
    return super.toYAML(data, indent);
  }

  public toMarkdown<T>(data: T, options: MarkdownOptions = {}): string {
    this.validateOrThrow(data);
    return super.toMarkdown(data, options);
  }

  private validateOrThrow(data: unknown): void {
    if (this.schema) {
      const result = this.validateData(data);
      if (!result.valid && this.throwOnValidationError) {
        const firstError = result.errors?.[0];
        const message = firstError
          ? `Field '${firstError.path}' is invalid: ${firstError.message}`
          : "Validation failed";
        throw new Error(message);
      }
    }
  }
}
