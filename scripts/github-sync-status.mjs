import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = process.env.GANSHIJIE_GITHUB_REPO || "Vanilla99/ganshijie-demo";
const branch = process.env.GANSHIJIE_GITHUB_BRANCH || "main";

const keyFiles = [
  "package.json",
  "README.md",
  "docs/visual-qa-playbook.md",
  "scripts/qa-self-check.mjs",
  "scripts/github-sync-status.mjs",
  "scripts/goal-completion-audit.mjs",
  "src/App.tsx",
  "src/styles.css"
];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: rootDir,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options
  }).trim();
}

function ghApi(pathname, jq) {
  const args = ["api", pathname];
  if (jq) {
    args.push("--jq", jq);
  }

  return run("gh", args);
}

function remoteFileContents(filePath) {
  const content = ghApi(`repos/${repo}/contents/${filePath}?ref=${branch}`, ".content");
  return Buffer.from(content.replace(/\s/g, ""), "base64");
}

function localFileContents(filePath) {
  const absolutePath = path.join(rootDir, filePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing local file: ${filePath}`);
  }

  return readFileSync(absolutePath);
}

function sameBytes(left, right) {
  return left.length === right.length && left.equals(right);
}

const localHead = run("git", ["rev-parse", "HEAD"]);
const localTree = run("git", ["rev-parse", "HEAD^{tree}"]);
const gitStatus = run("git", ["status", "-sb"]);
const remoteHead = ghApi(`repos/${repo}/commits/${branch}`, ".sha");
const remoteTree = ghApi(`repos/${repo}/git/commits/${remoteHead}`, ".tree.sha");

const fileResults = keyFiles.map((filePath) => {
  const local = localFileContents(filePath);
  const remote = remoteFileContents(filePath);
  return {
    filePath,
    matches: sameBytes(local, remote),
    localBytes: local.length,
    remoteBytes: remote.length
  };
});

const failedFiles = fileResults.filter((item) => !item.matches);
const treeMatches = localTree === remoteTree;
const hasTrackingWarning = /\[(?:ahead|behind)/.test(gitStatus);

console.log("Ganshijie GitHub sync status");
console.log(`Repository: ${repo}`);
console.log(`Branch: ${branch}`);
console.log(`Local HEAD: ${localHead}`);
console.log(`Remote HEAD: ${remoteHead}`);
console.log(`Local tree: ${localTree}`);
console.log(`Remote tree: ${remoteTree}`);
console.log(`Tree match: ${treeMatches ? "yes" : "no"}`);
console.log("");
console.log(gitStatus);

if (hasTrackingWarning) {
  console.log("");
  console.log("Note: git status may show ahead/behind because this environment syncs through GitHub API and the local origin/main tracking ref can lag the remote API state.");
}

console.log("");
for (const item of fileResults) {
  const status = item.matches ? "PASS" : "FAIL";
  console.log(`${status} ${item.filePath} (${item.localBytes}/${item.remoteBytes} bytes)`);
}

if (!treeMatches || failedFiles.length > 0) {
  console.log("");
  if (!treeMatches) {
    console.log("Remote tree does not match local HEAD tree.");
  }
  if (failedFiles.length > 0) {
    console.log(`Mismatched files: ${failedFiles.map((item) => item.filePath).join(", ")}`);
  }
  process.exitCode = 1;
}
