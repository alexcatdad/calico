import { describe, expect, it } from 'bun:test';
import { DataExporter } from '../src/exporter';

describe('Markdown Format', () => {
    const exporter = new DataExporter();

    describe('toMarkdown', () => {
        it('should export array of objects to Markdown table', () => {
            const data = [
                { name: 'John', age: 30 },
                { name: 'Jane', age: 28 }
            ];
            const result = exporter.toMarkdown(data);
            expect(result).toContain('| name | age |');
            expect(result).toContain('| --- | --- |');
            expect(result).toContain('| John | 30 |');
        });

        it('should export plain object to list', () => {
            const data = { name: 'John', age: 30 };
            const result = exporter.toMarkdown(data);
            expect(result).toContain('- **name**: "John"');
            expect(result).toContain('- **age**: 30');
        });

        it('should handle title option', () => {
            const data = { name: 'John' };
            const result = exporter.toMarkdown(data, { title: 'My Data' });
            expect(result).toContain('# My Data');
        });

        it('should handle TOC option', () => {
            const data = { Section1: 'Content', Section2: 'Content' };
            const result = exporter.toMarkdown(data, { includeTableOfContents: true });
            expect(result).toContain('## Table of Contents');
            expect(result).toContain('- [Section1](#section1)');
        });
    });
});
