import { describe, expect, it } from 'bun:test';
import { DataExporter } from '../src/exporter';

describe('JSON Format', () => {
    const exporter = new DataExporter();

    describe('toJSON', () => {
        it('should export object to JSON string', () => {
            const data = { name: 'John', age: 30 };
            const result = exporter.toJSON(data);
            expect(result).toBe('{\n  "name": "John",\n  "age": 30\n}');
        });

        it('should export array to JSON string', () => {
            const data = [{ name: 'John' }, { name: 'Jane' }];
            const result = exporter.toJSON(data);
            expect(result).toContain('"name": "John"');
            expect(result).toContain('"name": "Jane"');
        });

        it('should handle pretty print option', () => {
            const data = { name: 'John' };
            const result = exporter.toJSON(data, false);
            expect(result).toBe('{"name":"John"}');
        });

        it('should throw on circular reference', () => {
            const obj: any = { name: 'John' };
            obj.self = obj;
            expect(() => exporter.toJSON(obj)).toThrow('Circular reference detected');
        });
    });

    describe('fromJSON', () => {
        it('should parse JSON string to object', () => {
            const input = '{"name": "John", "age": 30}';
            const result = exporter.fromJSON<{ name: string; age: number }>(input);
            expect(result).toEqual({ name: 'John', age: 30 });
        });

        it('should throw TypeError if input is not string', () => {
            // @ts-ignore
            expect(() => exporter.fromJSON(123)).toThrow('fromJSON input must be string');
        });

        it('should throw SyntaxError on invalid JSON', () => {
            expect(() => exporter.fromJSON('{ invalid }')).toThrow('Invalid JSON');
        });
    });
});
