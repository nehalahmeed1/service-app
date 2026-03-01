# API Benchmark Script

Run from `backend/`:

- `npm run benchmark:api`
- `npm run benchmark:api -- --group public --iterations 50 --concurrency 10`
- `npm run benchmark:api -- --group auth --token <firebase-id-token>`
- `npm run benchmark:api -- --group all --include-auth --token <firebase-id-token> --output benchmark-report.json`

Options:
- `--base-url` (default: `http://localhost:5000`)
- `--group` one of `public`, `auth`, `all` (default: `public`)
- `--iterations` requests per endpoint (default: `30`)
- `--concurrency` parallel workers per endpoint (default: `5`)
- `--timeout-ms` per-request timeout (default: `10000`)
- `--token` bearer token for auth endpoints
- `--output` path to JSON report file
- `--include-auth` include auth endpoints when `--group all`
