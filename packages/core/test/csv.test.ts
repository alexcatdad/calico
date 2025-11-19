import { describe, expect, it } from 'bun:test';
import { DataExporter } from '../src/exporter';

describe('CSV Format', () => {
    const exporter = new DataExporter();

    describe('toCSV', () => {
        it('should export array of objects to CSV string', () => {
            const data = [
                { name: 'John', age: 30 },
                { name: 'Jane', age: 28 }
            ];
            const result = exporter.toCSV(data);
            expect(result).toContain('"name","age"');
            expect(result).toContain('"John","30"');
            expect(result).toContain('"Jane","28"');
        });

        it('should handle custom delimiter', () => {
            const data = [{ name: 'John', age: 30 }];
            const result = exporter.toCSV(data, { delimiter: ';' });
            expect(result).toContain('"name";"age"');
            expect(result).toContain('"John";"30"');
        });

        it('should handle quoted strings', () => {
            const data = [{ name: 'John, Doe' }];
            const result = exporter.toCSV(data);
            expect(result).toContain('"John, Doe"');
        });

        it('should throw if input is not array', () => {
            // @ts-ignore
            expect(() => exporter.toCSV({})).toThrow('toCSV requires an array');
        });
    });

    describe('fromCSV', () => {
        it('should parse CSV string to array of objects', () => {
            const input = 'name,age\nJohn,30\nJane,28';
            const result = exporter.fromCSV<{ name: string; age: string }>(input);
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({ name: 'John', age: '30' });
            expect(result[1]).toEqual({ name: 'Jane', age: '28' });
        });

        it('should handle custom delimiter', () => {
            const input = 'name;age\nJohn;30';
            const result = exporter.fromCSV<{ name: string; age: string }>(input, { delimiter: ';' });
            expect(result[0]).toEqual({ name: 'John', age: '30' });
        });

        it('should handle quoted strings', () => {
            const input = 'name\n"John, Doe"';
            const result = exporter.fromCSV<{ name: string }>(input);
            expect(result[0].name).toBe('John, Doe');
        });
    });
});
