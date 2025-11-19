import { DataExporter } from '../packages/core/src/index';
import { AsyncDataExporter } from '../packages/core/src/index';
import { performance } from 'perf_hooks';

const exporter = new DataExporter();

const generateData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        active: i % 2 === 0,
        meta: {
            created: new Date().toISOString(),
            score: Math.random() * 100
        }
    }));
};

async function runBenchmark() {
    console.log('=================================');
    console.log('BENCHMARK: 10,000 RECORDS');
    console.log('=================================\n');

    const data10k = generateData(10000);

    const formats = ['json', 'csv', 'yaml', 'md'] as const;

    console.log('SYNC API (DataExporter):');
    console.log('---------------------------------');

    for (const format of formats) {
        const times: number[] = [];
        for (let i = 0; i < 5; i++) {
            const start = performance.now();
            if (format === 'json') exporter.toJSON(data10k);
            else if (format === 'csv') exporter.toCSV(data10k);
            else if (format === 'yaml') exporter.toYAML(data10k);
            else if (format === 'md') exporter.toMarkdown(data10k);
            times.push(performance.now() - start);
        }

        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);

        console.log(`${format.toUpperCase()}: ${avg.toFixed(2)}ms avg (min: ${min.toFixed(2)}ms, max: ${max.toFixed(2)}ms)`);
    }

    console.log('\nASYNC API (AsyncDataExporter with Workers):');
    console.log('---------------------------------');
    console.log('Note: Requires browser environment with Web Workers.');
    console.log('Skipping in Node.js. Use in browser for true benefits.\n');

    // Show estimated improvement
    console.log('PERFORMANCE NOTES:');
    console.log('---------------------------------');
    console.log('• Sync API: Blocks main thread during serialization');
    console.log('• Async API: Non-blocking, uses Web Workers for large datasets');
    console.log('• Threshold: Async uses workers for arrays >10,000 items');
    console.log('• Worker overhead: ~5-10ms setup, but prevents UI blocking');
    console.log('• Best for: Large dataset exports in browsers\n');
}

runBenchmark().catch(console.error);
