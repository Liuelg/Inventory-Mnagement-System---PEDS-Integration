/**
 * Quick connectivity test from backend to a PEDS POS instance.
 * Usage: node test-peds-connectivity.js <URL>
 * Example: node test-peds-connectivity.js http://localhost:2010
 */

const url = process.argv[2];

if (!url) {
  console.error("Usage: node test-peds-connectivity.js <URL>");
  console.error("Example: node test-peds-connectivity.js http://localhost:2010");
  process.exit(1);
}

console.log(`Testing connectivity to: ${url}`);
console.log("-".repeat(50));

const start = Date.now();

fetch(url, { method: "GET", signal: AbortSignal.timeout(10000) })
  .then((res) => {
    const duration = Date.now() - start;
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`Time: ${duration}ms`);
    console.log(`Headers: ${JSON.stringify(Object.fromEntries(res.headers))}`);
    console.log("\nResult: REACHABLE (PEDS responded)");
    process.exit(0);
  })
  .catch((err) => {
    const duration = Date.now() - start;
    console.error(`Error after ${duration}ms:`);
    console.error(err.message);

    if (err.message.includes("ECONNREFUSED")) {
      console.error("\nDiagnosis: Connection refused — PEDS is not running or the port is wrong.");
    } else if (err.message.includes("ETIMEDOUT") || err.message.includes("timed out")) {
      console.error("\nDiagnosis: Connection timed out — network path blocked, PEDS is down, or a firewall is dropping packets.");
    } else if (err.message.includes("ENOTFOUND") || err.message.includes("getaddrinfo")) {
      console.error("\nDiagnosis: DNS lookup failed — the hostname does not resolve.");
    } else if (err.message.includes("EHOSTUNREACH")) {
      console.error("\nDiagnosis: Host unreachable — no route to the target network.");
    } else {
      console.error("\nDiagnosis: Unknown network error.");
    }

    process.exit(1);
  });
