import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readProjectFile(filePath) {
  const absolutePath = path.join(rootDir, filePath);

  if (!existsSync(absolutePath)) {
    return "";
  }

  return readFileSync(absolutePath, "utf8");
}

function includesAll(contents, needles) {
  return needles.every((needle) => contents.includes(needle));
}

const files = {
  app: readProjectFile("src/App.tsx"),
  styles: readProjectFile("src/styles.css"),
  packageJson: readProjectFile("package.json"),
  readme: readProjectFile("README.md"),
  visualQa: readProjectFile("docs/visual-qa-playbook.md"),
  selfCheck: readProjectFile("scripts/qa-self-check.mjs"),
  syncStatus: readProjectFile("scripts/github-sync-status.mjs")
};

const audits = [
  {
    area: "Unified state",
    evidence: "DemoState, localStorage persistence, status hub, recovery boundary",
    status: includesAll(files.app, ["type DemoState", "usePersistentDemoState", "DemoStatusHub", "DemoErrorBoundary"]) ? "pass" : "fail"
  },
  {
    area: "Case workflow",
    evidence: "Case workbench, command center, imaging evidence, report sync",
    status: includesAll(files.app, ["CaseWorkbench", "PilotCommandCenter", "type ImagingEvidence", "ReportTaskSyncPanel"]) ? "pass" : "fail"
  },
  {
    area: "Pilot delivery sandbox",
    evidence: "Interactive pilot config, acceptance gate, handoff briefing",
    status: includesAll(files.app, ["PilotPage", "pilotAcceptanceItemsFor", "PilotHandoffBriefing", "pilotSubmissionTrail"]) ? "pass" : "fail"
  },
  {
    area: "Visual QA gate",
    evidence: "In-app sign-off, evidence labels, notes, timestamps, archive trail",
    status: includesAll(files.app, ["PilotVisualQaBoard", "visualQaEvidence", "visualQaHistory", "archiveVisualQaSummary"]) ? "pass" : "fail"
  },
  {
    area: "Responsive styling",
    evidence: "Desktop/tablet/mobile CSS breakpoints and QA board styles",
    status: includesAll(files.styles, ["@media (max-width: 1080px)", "@media (max-width: 720px)", ".pilot-visual-qa-board", ".visual-qa-history"]) ? "pass" : "fail"
  },
  {
    area: "Local verification",
    evidence: "Build, self-check, repo sync, completion audit commands",
    status: includesAll(files.packageJson, ['"build"', '"qa:self-check"', '"repo:sync-status"', '"goal:completion-audit"']) ? "pass" : "fail"
  },
  {
    area: "GitHub API sync status",
    evidence: "Executable remote tree and key-file comparison",
    status: includesAll(files.syncStatus, ["remoteTree", "keyFiles", "Tree match"]) ? "pass" : "fail"
  },
  {
    area: "Visual QA instructions",
    evidence: "Desktop/mobile/canvas acceptance playbook and archive requirement",
    status: includesAll(files.visualQa, ["桌面：`1440 x 960`", "移动：`390 x 844`", "3D 画布验收", "归档证据"]) ? "pass" : "fail"
  },
  {
    area: "Browser desktop/mobile QA",
    evidence: "Requires real browser screenshots and Visual QA Gate sign-off",
    status: "pending"
  },
  {
    area: "Three.js canvas visual QA",
    evidence: "Requires rendered canvas screenshot/pixel evidence and Visual QA Gate archive",
    status: "pending"
  }
];

const counts = audits.reduce(
  (summary, item) => {
    summary[item.status] += 1;
    return summary;
  },
  { pass: 0, fail: 0, pending: 0 }
);

console.log("Ganshijie goal completion audit");
console.log(`Root: ${rootDir}`);
console.log("");

for (const item of audits) {
  const status = item.status.toUpperCase();
  console.log(`${status} [${item.area}] ${item.evidence}`);
}

console.log("");
console.log(`Summary: ${counts.pass} pass, ${counts.fail} fail, ${counts.pending} pending.`);

if (counts.pending > 0) {
  console.log("Completion remains unproven until browser desktop/mobile QA and Three.js canvas visual QA are captured and archived through /pilot Visual QA Gate.");
}

if (counts.fail > 0 || counts.pending > 0) {
  process.exitCode = 1;
}
