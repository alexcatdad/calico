import { type ValidationSchema, type ValidationResult } from '../types';
import { validate } from './json-schema';
import { DataExporter } from '../exporter';

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

    constructor(schema?: ValidationSchema, throwOnValidationError: boolean = true) {
        super();
        this.schema = schema;
        this.throwOnValidationError = throwOnValidationError;
    }

    public validateData(data: any): ValidationResult {
        if (!this.schema) {
            return { valid: true };
        }
        return validate(data, this.schema);
    }

    public setSchema(schema: ValidationSchema): void {
        this.schema = schema;
    }

    public toJSON<T>(data: T, pretty: boolean = true): string {
        this.validateOrThrow(data);
        return super.toJSON(data, pretty);
    }

    public toCSV<T>(data: T[], options: any = {}): string {
        this.validateOrThrow(data);
        return super.toCSV(data, options);
    }

    public toYAML<T>(data: T, indent: number = 2): string {
        this.validateOrThrow(data);
        return super.toYAML(data, indent);
    }

    public toMarkdown<T>(data: T, options: any = {}): string {
        this.validateOrThrow(data);
        return super.toMarkdown(data, options);
    }

    private validateOrThrow(data: any): void {
        if (this.schema) {
            const result = this.validateData(data);
            if (!result.valid && this.throwOnValidationError) {
                const firstError = result.errors?.[0];
                const message = firstError
                    ? `Field '${firstError.path}' is invalid: ${firstError.message}`
                    : 'Validation failed';
                throw new Error(message);
            }
        }
    }
}
