import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function readProjectFile(filePath) {
  const absolutePath = path.join(rootDir, filePath);

  if (!existsSync(absolutePath)) {
    return { filePath, contents: "", missing: true };
  }

  return { filePath, contents: readFileSync(absolutePath, "utf8"), missing: false };
}

const files = {
  app: readProjectFile("src/App.tsx"),
  styles: readProjectFile("src/styles.css"),
  scene: readProjectFile("src/components/MedicalScene.tsx"),
  readme: readProjectFile("README.md"),
  packageJson: readProjectFile("package.json")
};

function includesAll(file, needles) {
  if (file.missing) {
    return false;
  }

  return needles.every((needle) => {
    if (needle instanceof RegExp) {
      return needle.test(file.contents);
    }

    return file.contents.includes(needle);
  });
}

const requiredChecks = [
  {
    area: "State",
    label: "Unified demo state and local persistence are present",
    file: files.app,
    needles: ["type DemoState", "demoStorageKey", "usePersistentDemoState", "DemoStatusHub"]
  },
  {
    area: "Recovery",
    label: "Storage status and runtime error recovery are present",
    file: files.app,
    needles: ["type StorageStatus", "DemoErrorBoundary", "resetDemoState"]
  },
  {
    area: "Dashboard",
    label: "Case workbench and pilot command queue are wired",
    file: files.app,
    needles: ["PilotCommandCenter", "CaseWorkbench", "command-task-queue", "command-task-list"]
  },
  {
    area: "Imaging",
    label: "Imaging evidence workflow records case-level proof",
    file: files.app,
    needles: ["type ImagingEvidence", "recordImagingEvidence", "ProcessTimeline", "MedicalScene"]
  },
  {
    area: "Reports",
    label: "Report task sync panel links evidence, review, and export",
    file: files.app,
    needles: ["ReportTaskSyncPanel", "report-sync-grid", "reviewNotes", "exportHistory"]
  },
  {
    area: "Pilot",
    label: "Pilot acceptance gate and handoff briefing are present",
    file: files.app,
    needles: ["pilotAcceptanceItemsFor", "PilotHandoffBriefing", "pilot-handoff-briefing", "handoffHistory"]
  },
  {
    area: "3D",
    label: "MedicalScene uses React Three Fiber canvas and controls",
    file: files.scene,
    needles: ["Canvas", "OrbitControls", "useFrame", "THREE"]
  },
  {
    area: "Responsive",
    label: "Responsive styles cover command, report, and handoff surfaces",
    file: files.styles,
    needles: [/@media \(max-width: 1080px\)/, /@media \(max-width: 720px\)/, ".command-task-list", ".report-sync-grid", ".pilot-handoff-briefing"]
  },
  {
    area: "Docs",
    label: "README documents GitHub API sync and browser QA limits",
    file: files.readme,
    needles: ["GitHub API", "main...origin/main", "浏览器桌面 / 移动端 QA"]
  },
  {
    area: "Scripts",
    label: "Package exposes build and QA self-check commands",
    file: files.packageJson,
    needles: ['"build"', '"qa:self-check"']
  }
];

const advisoryChecks = [
  {
    area: "Browser QA",
    label: "Desktop and mobile browser QA still require an accessible local browser session"
  },
  {
    area: "Canvas QA",
    label: "3D canvas pixel verification still requires rendered browser evidence"
  }
];

const results = requiredChecks.map((check) => ({
  ...check,
  passed: includesAll(check.file, check.needles)
}));

const passedCount = results.filter((result) => result.passed).length;
const failed = results.filter((result) => !result.passed);

console.log("Ganshijie Demo QA self-check");
console.log(`Root: ${rootDir}`);
console.log("");

for (const result of results) {
  const status = result.passed ? "PASS" : "FAIL";
  const fileStatus = result.file.missing ? ` missing ${result.file.filePath}` : result.file.filePath;
  console.log(`${status} [${result.area}] ${result.label} (${fileStatus})`);
}

console.log("");

for (const advisory of advisoryChecks) {
  console.log(`WARN [${advisory.area}] ${advisory.label}`);
}

console.log("");
console.log(`Summary: ${passedCount}/${results.length} required checks passed, ${advisoryChecks.length} advisory warnings.`);

if (failed.length > 0) {
  console.log("");
  console.log("Failed checks:");

  for (const result of failed) {
    console.log(`- [${result.area}] ${result.label}`);
  }

  process.exitCode = 1;
}
