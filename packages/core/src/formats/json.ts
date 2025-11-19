import { detectCircularReference } from '../utils';

export function toJSON<T>(data: T, pretty: boolean = true): string {
    detectCircularReference(data);

    try {
        return JSON.stringify(data, null, pretty ? 2 : 0);
    } catch (error) {
        if (error instanceof Error) {
            throw new TypeError(`Input data for toJSON must be serializable: ${error.message}`);
        }
        throw error;
    }
}

export function fromJSON<T>(input: string): T {
    if (typeof input !== 'string') {
        throw new TypeError(`fromJSON input must be string, received ${typeof input}`);
    }

    try {
        return JSON.parse(input);
    } catch (error) {
        if (error instanceof SyntaxError) {
            // Enhance error message with context if possible, though standard JSON.parse error is often good enough
            // We can try to parse the line/column from the error message if needed, but standard V8 errors are decent.
            // SPEC says: SyntaxError: "Invalid JSON at line [line], column [col]: [context]. Expected [expected]"
            // We might need a custom parser or a wrapper to get this level of detail if JSON.parse doesn't provide it.
            // For now, let's rethrow with as much info as we can get.
            throw new SyntaxError(`Invalid JSON: ${error.message}`);
        }
        throw error;
    }
}
