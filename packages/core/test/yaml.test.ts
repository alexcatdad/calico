import { describe, expect, it } from 'bun:test';
import { DataExporter } from '../src/exporter';

describe('YAML Format', () => {
    const exporter = new DataExporter();

    describe('toYAML', () => {
        it('should export object to YAML string', () => {
            const data = { name: 'John', age: 30 };
            const result = exporter.toYAML(data);
            expect(result).toContain('name: John');
            expect(result).toContain('age: 30');
        });

        it('should export array to YAML string', () => {
            const data = ['a', 'b'];
            const result = exporter.toYAML(data);
            expect(result).toContain('- a');
            expect(result).toContain('- b');
        });

        it('should handle indentation', () => {
            const data = { nested: { key: 'value' } };
            const result = exporter.toYAML(data, 4);
            // Check for 4 spaces indentation
            // nested:
            //     key: value
            expect(result).toContain('    key: value');
        });

        it('should throw on circular reference', () => {
            const obj: any = {};
            obj.self = obj;
            expect(() => exporter.toYAML(obj)).toThrow('Circular reference detected');
        });
    });

    describe('fromYAML', () => {
        it('should parse YAML string to object', () => {
            const yaml = 'name: "John"\nage: 30';
            const result = exporter.fromYAML(yaml);
            expect(result).toEqual({ name: 'John', age: 30 });
        });

        it('should throw TypeError if input is not string', () => {
            // @ts-ignore
            expect(() => exporter.fromYAML(123)).toThrow('fromYAML input must be string');
        });

        it('should throw SyntaxError on invalid YAML', () => {
            expect(() => exporter.fromYAML('invalid line')).toThrow('Invalid YAML');
        });
    });
});
