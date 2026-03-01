#!/usr/bin/env node
/*
 Simple API benchmark runner (no external deps).
 - Measures latency distribution (p50/p95/p99), avg, min, max
 - Reports per-endpoint status-code distribution
 - Supports auth header and JSON body
*/

const http = require("http");
const https = require("https");
const { URL } = require("url");

function parseArgs(argv) {
  const out = {
    baseUrl: process.env.BENCH_BASE_URL || "http://localhost:5000",
    iterations: Number(process.env.BENCH_ITERATIONS || 30),
    concurrency: Number(process.env.BENCH_CONCURRENCY || 5),
    timeoutMs: Number(process.env.BENCH_TIMEOUT_MS || 10000),
    token: process.env.BENCH_BEARER_TOKEN || "",
    group: process.env.BENCH_GROUP || "public",
    output: process.env.BENCH_OUTPUT || "",
    includeAuth: process.env.BENCH_INCLUDE_AUTH === "1",
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--base-url") out.baseUrl = argv[++i];
    else if (arg === "--iterations") out.iterations = Number(argv[++i]);
    else if (arg === "--concurrency") out.concurrency = Number(argv[++i]);
    else if (arg === "--timeout-ms") out.timeoutMs = Number(argv[++i]);
    else if (arg === "--token") out.token = argv[++i];
    else if (arg === "--group") out.group = argv[++i];
    else if (arg === "--output") out.output = argv[++i];
    else if (arg === "--include-auth") out.includeAuth = true;
  }

  if (!Number.isFinite(out.iterations) || out.iterations < 1) out.iterations = 30;
  if (!Number.isFinite(out.concurrency) || out.concurrency < 1) out.concurrency = 5;
  if (!Number.isFinite(out.timeoutMs) || out.timeoutMs < 100) out.timeoutMs = 10000;

  return out;
}

function endpointGroups(includeAuth) {
  const publicEndpoints = [
    { name: "Public Categories", method: "GET", path: "/api/categories" },
    { name: "Public Sub-Categories", method: "GET", path: "/api/sub-categories" },
  ];

  const authEndpoints = [
    { name: "Admin Dashboard", method: "GET", path: "/api/admin/dashboard", requiresAuth: true },
    { name: "Admin Insights Providers", method: "GET", path: "/api/admin/insights/providers", requiresAuth: true },
    { name: "Admin Approvals Providers", method: "GET", path: "/api/admin/approvals/providers", requiresAuth: true },
    { name: "Provider Me", method: "GET", path: "/api/provider/me", requiresAuth: true },
    { name: "Provider Booking Stats", method: "GET", path: "/api/provider/bookings/stats", requiresAuth: true },
    { name: "Customer Bookings", method: "GET", path: "/api/customer/bookings", requiresAuth: true },
  ];

  return {
    public: publicEndpoints,
    auth: authEndpoints,
    all: includeAuth ? [...publicEndpoints, ...authEndpoints] : [...publicEndpoints],
  };
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function summarize(samples) {
  const latencies = samples.map((s) => s.ms).sort((a, b) => a - b);
  const total = latencies.reduce((acc, n) => acc + n, 0);
  const status = {};
  for (const s of samples) {
    const key = String(s.status);
    status[key] = (status[key] || 0) + 1;
  }

  return {
    requests: samples.length,
    minMs: latencies[0] || 0,
    maxMs: latencies[latencies.length - 1] || 0,
    avgMs: latencies.length ? total / latencies.length : 0,
    p50Ms: percentile(latencies, 50),
    p95Ms: percentile(latencies, 95),
    p99Ms: percentile(latencies, 99),
    status,
  };
}

function roundSummary(s) {
  return {
    ...s,
    minMs: Number(s.minMs.toFixed(2)),
    maxMs: Number(s.maxMs.toFixed(2)),
    avgMs: Number(s.avgMs.toFixed(2)),
    p50Ms: Number(s.p50Ms.toFixed(2)),
    p95Ms: Number(s.p95Ms.toFixed(2)),
    p99Ms: Number(s.p99Ms.toFixed(2)),
  };
}

function requestOnce(baseUrl, endpoint, token, timeoutMs) {
  return new Promise((resolve) => {
    const started = process.hrtime.bigint();
    const full = new URL(endpoint.path, baseUrl);
    const isHttps = full.protocol === "https:";
    const client = isHttps ? https : http;

    const headers = { Accept: "application/json" };
    let body = null;

    if (token && endpoint.requiresAuth) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (endpoint.body) {
      body = JSON.stringify(endpoint.body);
      headers["Content-Type"] = "application/json";
      headers["Content-Length"] = Buffer.byteLength(body);
    }

    const req = client.request(
      {
        protocol: full.protocol,
        hostname: full.hostname,
        port: full.port,
        path: `${full.pathname}${full.search}`,
        method: endpoint.method,
        headers,
      },
      (res) => {
        res.on("data", () => {});
        res.on("end", () => {
          const ms = Number(process.hrtime.bigint() - started) / 1e6;
          resolve({ status: res.statusCode || 0, ms });
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("timeout"));
    });

    req.on("error", () => {
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      resolve({ status: "ERR", ms });
    });

    if (body) req.write(body);
    req.end();
  });
}

async function runEndpoint(baseUrl, endpoint, opts) {
  const total = opts.iterations;
  const concurrency = Math.min(opts.concurrency, total);
  let index = 0;
  const samples = [];

  async function worker() {
    while (index < total) {
      const i = index;
      index += 1;
      if (i >= total) break;
      const sample = await requestOnce(baseUrl, endpoint, opts.token, opts.timeoutMs);
      samples.push(sample);
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  return roundSummary(summarize(samples));
}

function printTable(rows) {
  const headers = ["Endpoint", "Req", "Avg", "P50", "P95", "P99", "Min", "Max", "Status"];
  const lines = [headers.join(" | "), headers.map(() => "---").join(" | ")];

  for (const r of rows) {
    const status = Object.entries(r.summary.status)
      .map(([k, v]) => `${k}:${v}`)
      .join(",");

    lines.push([
      r.endpoint,
      String(r.summary.requests),
      `${r.summary.avgMs}ms`,
      `${r.summary.p50Ms}ms`,
      `${r.summary.p95Ms}ms`,
      `${r.summary.p99Ms}ms`,
      `${r.summary.minMs}ms`,
      `${r.summary.maxMs}ms`,
      status,
    ].join(" | "));
  }

  console.log(lines.join("\n"));
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const groups = endpointGroups(opts.includeAuth);
  const selected = groups[opts.group] || groups.public;

  if (!selected.length) {
    console.error("No endpoints selected.");
    process.exit(1);
  }

  console.log(`Base URL: ${opts.baseUrl}`);
  console.log(`Group: ${opts.group}`);
  console.log(`Iterations per endpoint: ${opts.iterations}`);
  console.log(`Concurrency: ${opts.concurrency}`);
  console.log(`Timeout: ${opts.timeoutMs}ms`);
  console.log("");

  const results = [];
  for (const ep of selected) {
    if (ep.requiresAuth && !opts.token) {
      results.push({
        endpoint: `${ep.method} ${ep.path}`,
        skipped: true,
        reason: "Missing --token / BENCH_BEARER_TOKEN",
      });
      continue;
    }

    const summary = await runEndpoint(opts.baseUrl, ep, opts);
    results.push({ endpoint: `${ep.method} ${ep.path}`, summary });
  }

  const printable = results.filter((r) => !r.skipped);
  if (printable.length) {
    printTable(printable);
  }

  const skipped = results.filter((r) => r.skipped);
  if (skipped.length) {
    console.log("\nSkipped:");
    for (const s of skipped) {
      console.log(`- ${s.endpoint}: ${s.reason}`);
    }
  }

  if (opts.output) {
    const fs = require("fs");
    const payload = {
      ranAt: new Date().toISOString(),
      options: {
        baseUrl: opts.baseUrl,
        group: opts.group,
        iterations: opts.iterations,
        concurrency: opts.concurrency,
        timeoutMs: opts.timeoutMs,
      },
      results,
    };
    fs.writeFileSync(opts.output, JSON.stringify(payload, null, 2), "utf8");
    console.log(`\nSaved report: ${opts.output}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
