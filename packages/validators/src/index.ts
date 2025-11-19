// Types defined in core package
export interface ValidationSchema {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
    [key: string]: any;
}

export interface ValidationResult {
    valid: boolean;
    errors?: Array<{ path: string; message: string; value: any }>;
}

// Simple JSON Schema validator implementation
// Supports basic types, required fields, and some common keywords
export function validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: Array<{ path: string; message: string; value: any }> = [];

    function validateNode(value: any, nodeSchema: ValidationSchema, path: string) {
        if (!nodeSchema) return;

        // Type validation
        if (nodeSchema.type) {
            const type = nodeSchema.type;
            if (type === 'string' && typeof value !== 'string') {
                errors.push({ path, message: `Expected string, got ${typeof value}`, value });
      } else if (type === 'number' && typeof value !== 'number') {
        errors.push({ path, message: `Expected number, got ${typeof value}`, value });
      } else if (type === 'boolean' && typeof value !== 'boolean') {
        errors.push({ path, message: `Expected boolean, got ${typeof value}`, value });
      } else if (type === 'array' && !Array.isArray(value)) {
        errors.push({ path, message: `Expected array, got ${typeof value}`, value });
      } else if (type === 'object' && (typeof value !== 'object' || value === null || Array.isArray(value))) {
        errors.push({ path, message: `Expected object, got ${typeof value}`, value });
      }
    }

    // Required fields
    if (nodeSchema.required && typeof value === 'object' && value !== null) {
      for (const field of nodeSchema.required) {
        if (!(field in value)) {
          errors.push({ path: `${path}.${field}`, message: 'Field is required', value: undefined });
        }
      }
    }

    // Properties validation (recursive)
    if (nodeSchema.properties && typeof value === 'object' && value !== null) {
      for (const key in nodeSchema.properties) {
        if (key in value) {
          validateNode(value[key], nodeSchema.properties[key], `${path}.${key}`);
        }
      }
    }

    // Array items validation
    if (nodeSchema.items && Array.isArray(value)) {
      value.forEach((item, index) => {
        validateNode(item, nodeSchema.items, `${path}[${index}]`);
      });
    }

    // Number constraints
    if (typeof value === 'number') {
      if (nodeSchema.minimum !== undefined && value < nodeSchema.minimum) {
        errors.push({ path, message: `Value must be >= ${nodeSchema.minimum}`, value });
      }
      if (nodeSchema.maximum !== undefined && value > nodeSchema.maximum) {
        errors.push({ path, message: `Value must be <= ${nodeSchema.maximum}`, value });
      }
    }

    // String constraints
    if (typeof value === 'string') {
      if (nodeSchema.minLength !== undefined && value.length < nodeSchema.minLength) {
        errors.push({ path, message: `String length must be >= ${nodeSchema.minLength}`, value });
      }
      if (nodeSchema.maxLength !== undefined && value.length > nodeSchema.maxLength) {
        errors.push({ path, message: `String length must be <= ${nodeSchema.maxLength}`, value });
      }
      if (nodeSchema.pattern) {
        const regex = new RegExp(nodeSchema.pattern);
        if (!regex.test(value)) {
          errors.push({ path, message: `String does not match pattern ${nodeSchema.pattern}`, value });
        }
      }
      if (nodeSchema.format === 'email') {
        // Simple email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
           errors.push({ path, message: 'Invalid email format', value });
        }
      }
    }
  }

  validateNode(data, schema, 'root');

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}
