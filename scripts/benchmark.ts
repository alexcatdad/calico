import { DataExporter } from '../packages/core/src/index';
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

const data = generateData(1000);

console.log('Running benchmarks with 1000 records (10 runs per format)...\n');

const formats = ['json', 'csv', 'yaml', 'md'] as const;

for (const format of formats) {
  const times: number[] = [];
  for (let i = 0; i < 10; i++) {
    const start = performance.now();
    if (format === 'json') exporter.toJSON(data);
    else if (format === 'csv') exporter.toCSV(data);
    else if (format === 'yaml') exporter.toYAML(data);
    else if (format === 'md') exporter.toMarkdown(data);
    times.push(performance.now() - start);
  }

  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  console.log(`${format.toUpperCase()}: ${avg.toFixed(2)}ms avg (min: ${min.toFixed(2)}ms, max: ${max.toFixed(2)}ms)`);

  if (max > 3) {
    console.warn(`  ⚠ Peak exceeded 3ms target (${max.toFixed(2)}ms)`);
  }
}
