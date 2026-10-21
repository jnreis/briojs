#!/usr/bin/env node
// Krausest-style benchmark for Brio, optionally compared with Vue, petite-vue, Alpine, React, Preact and Svelte.
// Usage: node bench/run.mjs [--compare] [--frameworks=brio,vue] [--runs=10] [--save] [--check] [--json]
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { buildBench, compiledFrameworks } from './build.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const baselinePath = fileURLToPath(new URL('./baseline.json', import.meta.url));
const args = new Map(process.argv.slice(2).map(arg => {
    const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
    return [key, value];
}));
const competitors = ['vue', 'petite-vue', 'alpine', 'react', 'preact', 'svelte'];
const frameworks = args.has('frameworks')
    ? args.get('frameworks').split(',')
    : args.has('compare') ? ['brio', ...competitors] : ['brio'];
const runs = Number(args.get('runs') ?? 10);
const warmups = Number(args.get('warmups') ?? 3);
// A regression must exceed both limits, so sub-millisecond noise cannot fail the check.
const tolerance = Number(args.get('tolerance') ?? 0.15);
const floorMs = Number(args.get('floor') ?? 1);

const operations = [
    { name: 'create 1k rows', setup: [], action: ['run', 1000] },
    { name: 'replace 1k rows', setup: [['run', 1000]], action: ['run', 1000] },
    { name: 'update every 10th row', setup: [['run', 1000]], action: ['update'] },
    { name: 'select row', setup: [['run', 1000]], action: ['select', 5] },
    { name: 'swap rows', setup: [['run', 1000]], action: ['swap'] },
    { name: 'remove row', setup: [['run', 1000]], action: ['remove', 500] },
    { name: 'create 10k rows', setup: [], action: ['run', 10000], runs: Math.max(3, Math.ceil(runs / 2)) },
    { name: 'append 1k rows', setup: [['run', 1000]], action: ['add', 1000] },
    { name: 'clear 1k rows', setup: [['run', 1000]], action: ['clear'] },
];

const types = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json' };
const server = createServer(async (request, response) => {
    const path = normalize(join(root, decodeURIComponent(new URL(request.url, 'http://x').pathname)));
    if (!path.startsWith(root)) return response.writeHead(403).end();
    try {
        const body = await readFile(path);
        response.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }).end(body);
    } catch {
        response.writeHead(404).end();
    }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const median = values => {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = sorted.length >> 1;
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const round = value => Math.round(value * 100) / 100;

async function measureFramework(browser, framework) {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error));
    page.on('console', message => { if (message.type() === 'error') errors.push(new Error(message.text())); });
    await page.goto(`${origin}/bench/apps/${framework}.html`);
    await page.waitForFunction(() => window.benchReady === true);
    const cdp = await page.context().newCDPSession(page);
    const heap = async () => {
        await page.evaluate(() => window.gc());
        await page.evaluate(() => window.gc());
        return (await cdp.send('Runtime.getHeapUsage')).usedSize;
    };

    const results = {};
    for (const operation of operations) {
        const times = await page.evaluate(async ({ operation, total, warmups }) => {
            const { bench } = window;
            const idle = () => new Promise(resolve => setTimeout(resolve, 0));
            const times = [];
            for (let iteration = 0; iteration < total; iteration++) {
                bench.clear();
                await bench.settle();
                for (const [method, ...input] of operation.setup) {
                    bench[method](...input);
                    await bench.settle();
                }
                await idle();
                const [method, ...input] = operation.action;
                const start = performance.now();
                bench[method](...input);
                await bench.settle();
                void document.body.offsetHeight;
                const elapsed = performance.now() - start;
                if (iteration >= warmups) times.push(elapsed);
            }
            return times;
        }, { operation, total: (operation.runs ?? runs) + warmups, warmups });
        results[operation.name] = round(median(times));
    }

    await page.evaluate(async () => { window.bench.clear(); await window.bench.settle(); });
    const emptyHeap = await heap();
    await page.evaluate(async () => { window.bench.run(10000); await window.bench.settle(); });
    const fullHeap = await heap();
    const domNodes = await page.evaluate(() => document.getElementById('tbody').childNodes.length);
    results['heap per row (KB)'] = round((fullHeap - emptyHeap) / 10000 / 1024);
    results['tbody nodes per row'] = round(domNodes / 10000);

    await page.close();
    if (errors.length) throw new Error(`${framework} page errors:\n${errors.map(error => error.message).join('\n')}`);
    return results;
}

const needsBuild = frameworks.filter(framework => compiledFrameworks.includes(framework));
if (needsBuild.length) await buildBench(needsBuild);
const browser = await chromium.launch({ args: ['--js-flags=--expose-gc'] });
const report = {};
try {
    for (const framework of frameworks) {
        process.stderr.write(`Measuring ${framework}...\n`);
        report[framework] = await measureFramework(browser, framework);
    }
} finally {
    await browser.close();
    server.close();
}

if (args.has('json')) {
    console.log(JSON.stringify(report, null, 2));
} else {
    const rows = Object.keys(report[frameworks[0]]).map(metric => ({
        metric,
        ...Object.fromEntries(frameworks.map(framework => [framework, report[framework][metric]])),
    }));
    console.log('Median ms (lower is better); script + style/layout until settled.');
    console.table(Object.fromEntries(rows.map(({ metric, ...values }) => [metric, values])));
}

if (args.has('save')) {
    if (!report.brio) throw new Error('--save requires brio in --frameworks.');
    await writeFile(baselinePath, `${JSON.stringify(report.brio, null, 2)}\n`);
    console.log(`Saved Brio baseline to ${baselinePath}`);
}

if (args.has('check')) {
    if (!report.brio) throw new Error('--check requires brio in --frameworks.');
    const baseline = JSON.parse(await readFile(baselinePath, 'utf8'));
    const regressions = Object.entries(baseline).filter(([metric, before]) => {
        const after = report.brio[metric];
        const isTiming = !metric.includes('per row');
        return after !== undefined && after > before * (1 + tolerance) && (!isTiming || after - before > floorMs);
    });
    for (const [metric, before] of regressions)
        console.error(`Regression: ${metric} ${before} -> ${report.brio[metric]}`);
    if (regressions.length) process.exitCode = 1;
    else console.log('No benchmark regressions beyond tolerance.');
}
