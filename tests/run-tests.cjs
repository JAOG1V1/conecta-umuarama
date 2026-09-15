/* Execute da raiz: node tests/run-tests.cjs */
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const paths = ["js/core.js", "js/levels.js", "js/storage.js", "js/story.js", "js/comparison.js", "tests/checks.js"];
const source = paths.map(file => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const report = vm.runInNewContext(source + "\nrunChecks();", { console }, { timeout: 10000 });
for (const result of report.results) {
  console.log((result.passed ? "PASSOU" : "FALHOU") + " — " + result.name + (result.error ? ": " + result.error : ""));
}
console.log("\n" + report.passed + "/" + report.total + " testes passaram.");
process.exitCode = report.failed ? 1 : 0;
