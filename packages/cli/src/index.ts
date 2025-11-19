#!/usr/bin/env bun
import { DataExporter } from '@alexcatdad/calico';
import { readFileSync, writeFileSync } from 'fs';
import { parseArgs } from 'util';

// CLI implementation
async function main() {
    const { values, positionals } = parseArgs({
        args: Bun.argv,
        options: {
            input: { type: 'string', short: 'i' },
            output: { type: 'string', short: 'o' },
            format: { type: 'string', short: 'f' },
            pretty: { type: 'boolean', short: 'p' },
        },
        strict: true,
        allowPositionals: true,
    });

    const inputFile = values.input || positionals[2];
    const outputFile = values.output;
    const format = values.format;

    if (!inputFile) {
        console.error('Usage: calico -i <input-file> -o <output-file> -f <format>');
        process.exit(1);
    }

    try {
        const inputContent = readFileSync(inputFile, 'utf-8');
        const exporter = new DataExporter();

        // Detect input format based on extension or content?
        // For now assume JSON input for conversion, or try to parse
        let data: any;
        if (inputFile.endsWith('.json')) {
            data = JSON.parse(inputContent);
        } else if (inputFile.endsWith('.csv')) {
            data = exporter.fromCSV(inputContent);
        } else if (inputFile.endsWith('.yaml') || inputFile.endsWith('.yml')) {
            data = exporter.fromYAML(inputContent);
        } else {
            // Try JSON
            try {
                data = JSON.parse(inputContent);
            } catch {
                console.error('Could not auto-detect input format. Please ensure input is valid JSON, CSV, or YAML.');
                process.exit(1);
            }
        }

        let outputContent = '';
        const targetFormat = format || (outputFile ? outputFile.split('.').pop() : 'json');

        switch (targetFormat?.toLowerCase()) {
            case 'json':
                outputContent = exporter.toJSON(data, values.pretty);
                break;
            case 'csv':
                if (!Array.isArray(data)) {
                    console.error('Error: CSV export requires array data');
                    process.exit(1);
                }
                outputContent = exporter.toCSV(data);
                break;
            case 'yaml':
            case 'yml':
                outputContent = exporter.toYAML(data);
                break;
            case 'md':
            case 'markdown':
                outputContent = exporter.toMarkdown(data);
                break;
            default:
                console.error(`Unsupported output format: ${targetFormat}`);
                process.exit(1);
    }

    if (outputFile) {
      writeFileSync(outputFile, outputContent);
      console.log(`Successfully exported to ${outputFile}`);
    } else {
      console.log(outputContent);
    }

  } catch (error) {
    if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
    } else {
        console.error('An unknown error occurred');
    }
    process.exit(1);
  }
}

main();
