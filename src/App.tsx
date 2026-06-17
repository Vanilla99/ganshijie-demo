import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Database,
  Download,
  Eye,
  FileDown,
  FileText,
  Handshake,
  Hospital,
  Layers3,
  Menu,
  Microscope,
  PanelTop,
  Plus,
  RefreshCw,
  Rotate3D,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UploadCloud,
  X
} from "lucide-react";
import { Component, type CSSProperties, type ErrorInfo, FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import CtSliceViewer from "./components/CtSliceViewer";
import MedicalScene from "./components/MedicalScene";
import ProcessTimeline from "./components/ProcessTimeline";
import {
  cases,
  collaborationPhotos,
  cooperationModes,
  expertProfiles,
  featuredCase,
  followupData,
  hospitals,
  lesionTypeData,
  metrics,
  monthlyCases,
  navItems,
  pilotTargets,
  productShots,
  proofImages,
  reportList,
  riskData
} from "./data";
import type { ClinicalCase } from "./data";

const chartColors = ["#0ea5e9", "#14b8a6", "#6366f1", "#f59e0b", "#94a3b8"];

const pilotHighlights = [
  { label: "首例闭环", value: featuredCase.processingTime, detail: "DICOM 解析到报告草稿" },
  { label: "分割置信度", value: metricValue(featuredCase, "分割置信度"), detail: "肝脏 / 肿瘤 / 血管结构" },
  { label: "试点周期", value: "7 天", detail: "沙盒部署与首批病例验证" }
];

const pilotJourney = [
  { step: "01", icon: UploadCloud, title: "安全接入首批影像", text: "以脱敏 DICOM 或演示样例启动，完成院内场景、科室角色和报告模板确认。" },
  { step: "02", icon: BrainCircuit, title: "AI 分割与三维重建", text: "自动生成肝脏、肿瘤、血管结构，保留医生可复核的切片、指标和模型视角。" },
  { step: "03", icon: FileText, title: "报告草稿与临床复核", text: "沉淀体积、最大径、血管邻近距离和风险提示，形成可讨论的辅助报告。" },
  { step: "04", icon: ShieldCheck, title: "试点评估与扩展", text: "按病例量、处理耗时、复核反馈和科室协作记录，评估正式接入路径。" }
];

const pilotAssurances = [
  "演示环境不接触真实院内系统",
  "支持脱敏数据与模拟病例并行验证",
  "可按医院角色配置影像、报告与会诊视图"
];

const experienceFlow = [
  { path: "/", title: "产品入口", detail: "理解平台价值" },
  { path: "/dashboard", title: "病例总览", detail: "选择重点病例" },
  { path: "/imaging", title: "AI 影像分析", detail: "分割与三维重建" },
  { path: "/reports", title: "辅助报告", detail: "结构化复核" },
  { path: "/partners", title: "合作背书", detail: "临床与教学场景" },
  { path: "/pilot", title: "试点申请", detail: "落地沟通路径" }
];

const partnerSignals = [
  { label: "合作医院", value: `${hospitals.length} 家`, detail: "真实临床场景素材" },
  { label: "专家顾问", value: `${expertProfiles.length} 位`, detail: "医学与科研支持" },
  { label: "证明材料", value: `${proofImages.length} 份`, detail: "可打开查看原图" }
];

const modelPresets = [
  { key: "surgery", label: "术前规划", view: "all", opacity: 52, detail: "同时观察肝脏、肿瘤与血管邻近关系" },
  { key: "vascular", label: "血管优先", view: "vessel", opacity: 34, detail: "突出门静脉与肝静脉分支走行" },
  { key: "lesion", label: "病灶定位", view: "tumor", opacity: 42, detail: "聚焦肿瘤数量、最大径与空间分布" }
] as const;

const reportReviewStages = ["AI 初稿", "医生复核", "MDT 讨论", "导出归档"];

const demoStorageKey = "gansight-demo-state-v1";

const riskFilters = ["全部风险", "高风险", "需复核", "中风险", "低风险"];
const statusFilters = ["全部状态", "已生成报告", "待医生复核", "分析完成", "模型重建中"];
const deploymentOptions = [
  { label: "院内沙盒", detail: "离线脱敏病例包，适合首轮医院内演示" },
  { label: "云端演示", detail: "轻量账号与样例数据，适合跨院沟通" },
  { label: "混合部署", detail: "本地影像数据 + 云端报告协作" }
];
const casePackageOptions = [
  { label: "高风险优先包", detail: "优先验证 P1 / MDT 场景" },
  { label: "首批 20 例", detail: "覆盖 CT / MRI / 复核队列" },
  { label: "科研教学包", detail: "沉淀三维模型与报告示教素材" }
];
const materialItems = ["脱敏 DICOM 样例", "试点科室联系人", "报告模板偏好", "数据权限确认", "演示会议时间"];
const reportTemplates = ["术前规划版", "MDT 讨论版", "科研教学版"];
const reviewTones = ["医生复核", "MDT 建议", "教学标注"];
const reportStatusFilters = ["全部报告", "已确认", "待复核", "已归档", "生成中"];
const exportFormats = ["PDF 报告", "PNG 截图", "MDT 摘要"];
const manualAcceptanceItems = [
  { id: "sandboxDryRun", label: "沙盒联调", detail: "确认部署路径、病例包和演示账号可按计划运行" },
  { id: "mdtBriefing", label: "MDT 演示排期", detail: "确认会前材料包、参会角色和演示时间" },
  { id: "handoffReview", label: "交付复盘", detail: "确认首例闭环指标、反馈记录和下一步扩展路径" }
] as const;

type ImagingEvidence = {
  status: "idle" | "running" | "completed";
  step: number;
  slice: number;
  viewKey: "all" | "liver" | "tumor" | "vessel";
  viewLabel: string;
  exportCount: number;
  completedAt: string;
  lastEvent: string;
};

type DemoState = {
  activeCaseId: string;
  caseSearch: string;
  riskFilter: string;
  statusFilter: string;
  selectedPilotCaseIds: string[];
  pilotTarget: string;
  pilotMode: string;
  deploymentPath: string;
  casePackage: string;
  materialChecklist: Record<string, boolean>;
  pilotSubmittedAt: string;
  reportSearch: string;
  reportStatusFilter: string;
  reportTemplate: string;
  reviewTone: string;
  reviewNotes: Record<string, string>;
  exportFormat: string;
  exportHistory: string[];
  pilotOrganization: string;
  pilotContact: string;
  pilotPhone: string;
  pilotDepartment: string;
  pilotHospitalLevel: string;
  pilotMonthlyVolume: string;
  pilotNeed: string;
  pilotRemark: string;
  pilotSubmissionTrail: string[];
  pilotAcceptanceChecks: Record<string, boolean>;
  imagingEvidence: Record<string, ImagingEvidence>;
  lastAction: string;
};

type DemoStateUpdate = DemoState | ((state: DemoState) => DemoState);
type StorageStatus = {
  tone: "ready" | "warning";
  label: string;
  detail: string;
  updatedAt: string;
};

type DemoStateBundle = {
  demoState: DemoState;
  storageStatus: StorageStatus;
};

function defaultMaterialChecklist() {
  return Object.fromEntries(materialItems.map((item, index) => [item, index < 3]));
}

function createDefaultDemoState(): DemoState {
  return {
    activeCaseId: featuredCase.id,
    caseSearch: "",
    riskFilter: "全部风险",
    statusFilter: "全部状态",
    selectedPilotCaseIds: [featuredCase.id, cases[1]?.id].filter(Boolean),
    pilotTarget: pilotTargets[0],
    pilotMode: cooperationModes[0],
    deploymentPath: deploymentOptions[0].label,
    casePackage: casePackageOptions[0].label,
    materialChecklist: defaultMaterialChecklist(),
    pilotSubmittedAt: "",
    reportSearch: "",
    reportStatusFilter: "全部报告",
    reportTemplate: reportTemplates[0],
    reviewTone: reviewTones[0],
    reviewNotes: {},
    exportFormat: exportFormats[0],
    exportHistory: [],
    pilotOrganization: "云南省某某医院",
    pilotContact: "李主任",
    pilotPhone: "138-0000-2026",
    pilotDepartment: "肝胆胰外科 / 影像科",
    pilotHospitalLevel: "三甲医院",
    pilotMonthlyVolume: "每月 80 例",
    pilotNeed: "希望先验证术前规划、血管邻近风险提示与 MDT 会前材料生成。",
    pilotRemark: "优先使用脱敏病例包完成 7 天首例闭环演示。",
    pilotSubmissionTrail: [],
    pilotAcceptanceChecks: {},
    imagingEvidence: {},
    lastAction: "已载入默认试点沙盒配置。"
  };
}

function mergeDemoState(value: Partial<DemoState>): DemoState {
  const fallback = createDefaultDemoState();
  return {
    ...fallback,
    ...value,
    selectedPilotCaseIds: Array.isArray(value.selectedPilotCaseIds) && value.selectedPilotCaseIds.length ? value.selectedPilotCaseIds : fallback.selectedPilotCaseIds,
    exportHistory: Array.isArray(value.exportHistory) ? value.exportHistory : fallback.exportHistory,
    pilotSubmissionTrail: Array.isArray(value.pilotSubmissionTrail) ? value.pilotSubmissionTrail : fallback.pilotSubmissionTrail,
    pilotAcceptanceChecks: { ...fallback.pilotAcceptanceChecks, ...(value.pilotAcceptanceChecks || {}) },
    imagingEvidence: { ...fallback.imagingEvidence, ...(value.imagingEvidence || {}) },
    materialChecklist: { ...fallback.materialChecklist, ...(value.materialChecklist || {}) },
    reviewNotes: { ...fallback.reviewNotes, ...(value.reviewNotes || {}) }
  };
}

function statusTime() {
  return new Date().toLocaleTimeString("zh-CN", { hour12: false });
}

function storageStatus(label: string, detail: string, tone: StorageStatus["tone"] = "ready"): StorageStatus {
  return { detail, label, tone, updatedAt: statusTime() };
}

function loadInitialDemoState(): DemoStateBundle {
  if (typeof window === "undefined") {
    return {
      demoState: createDefaultDemoState(),
      storageStatus: storageStatus("内存演示", "服务端渲染环境使用默认样例状态。", "warning")
    };
  }

  try {
    const saved = window.localStorage.getItem(demoStorageKey);
    return saved
      ? {
          demoState: mergeDemoState(JSON.parse(saved) as Partial<DemoState>),
          storageStatus: storageStatus("状态已恢复", "已从本机缓存载入上次演示配置。")
        }
      : {
          demoState: createDefaultDemoState(),
          storageStatus: storageStatus("默认样例", "已载入默认演示配置，后续操作会自动保存。")
        };
  } catch {
    return {
      demoState: createDefaultDemoState(),
      storageStatus: storageStatus("临时状态", "浏览器阻止读取本地缓存，本次演示使用默认样例。", "warning")
    };
  }
}

function usePersistentDemoState() {
  const [bundle, setBundle] = useState<DemoStateBundle>(loadInitialDemoState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(demoStorageKey, JSON.stringify(bundle.demoState));
      setBundle((current) =>
        current.demoState === bundle.demoState
          ? { ...current, storageStatus: storageStatus("状态已保存", "演示配置已写入本机缓存。") }
          : current
      );
    } catch {
      setBundle((current) =>
        current.demoState === bundle.demoState
          ? {
              ...current,
              storageStatus: storageStatus("临时状态", "浏览器阻止写入本地缓存，本次操作仅在当前会话保留。", "warning")
            }
          : current
      );
    }
  }, [bundle.demoState]);

  const updateDemoState = useCallback((update: DemoStateUpdate) => {
    setBundle((current) => ({
      ...current,
      demoState: typeof update === "function" ? update(current.demoState) : update
    }));
  }, []);

  const resetDemoState = useCallback(() => {
    setBundle({
      demoState: { ...createDefaultDemoState(), lastAction: "已恢复默认演示状态。" },
      storageStatus: storageStatus("已恢复默认", "所有演示状态已回到样例配置。")
    });
  }, []);

  return [bundle.demoState, updateDemoState, bundle.storageStatus, resetDemoState] as const;
}

type RouteState = {
  path: string;
  params: URLSearchParams;
};

function useHashRoute() {
  const getRoute = (): RouteState => {
    const hash = window.location.hash.replace(/^#/, "");
    const [path = "/", query = ""] = hash.split("?");
    return {
      path: path || "/",
      params: new URLSearchParams(query)
    };
  };
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return route;
}

function hashFor(path: string) {
  return `#${path}`;
}

function caseHref(path: "/imaging" | "/reports", item: ClinicalCase = featuredCase, extra = "") {
  const suffix = extra ? `&${extra}` : "";
  return `#${path}?case=${encodeURIComponent(item.id)}${suffix}`;
}

function metricValue(item: ClinicalCase, label: string) {
  return item.metrics.find((metric) => metric.label === label)?.value || "-";
}

function flowHref(path: string, selectedCase: ClinicalCase = featuredCase) {
  if (path === "/imaging") return caseHref("/imaging", selectedCase);
  if (path === "/reports") return caseHref("/reports", selectedCase, "generated=1");
  return hashFor(path);
}

function TopNav({ currentPath }: { currentPath: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [currentPath]);

  return (
    <header className="top-nav">
      <a className="brand-mark" href="#/">
        <span className="brand-glyph">
          <Sparkles size={16} />
        </span>
        <span>
          <strong>肝视界</strong>
          <small>GanSight AI</small>
        </span>
      </a>

      <nav className={`nav-links ${open ? "open" : ""}`}>
        {navItems.map((item) => (
          <a className={currentPath === item.path ? "active" : ""} href={hashFor(item.path)} key={item.path}>
            {item.label}
          </a>
        ))}
      </nav>

      <a className="nav-cta" href="#/pilot">
        申请试点
        <ChevronRight size={16} />
      </a>

      <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="切换导航">
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
    </header>
  );
}

function PageHeader({
  eyebrow,
  title,
  body,
  action
}: {
  eyebrow: string;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <section className="page-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{body}</p>
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </section>
  );
}

function StatCard({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: string }) {
  return (
    <motion.article className={`stat-card tone-${tone}`} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{delta}</small>
    </motion.article>
  );
}

function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return (
    <div className="section-title">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {body ? <p>{body}</p> : null}
    </div>
  );
}

type DemoErrorBoundaryProps = {
  children: ReactNode;
  resetKey: string;
};

type DemoErrorBoundaryState = {
  error: Error | null;
};

class DemoErrorBoundary extends Component<DemoErrorBoundaryProps, DemoErrorBoundaryState> {
  state: DemoErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): DemoErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("GanSight demo render failure", error, info.componentStack);
  }

  componentDidUpdate(previousProps: DemoErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (this.state.error) {
      return <RuntimeErrorFallback error={this.state.error} onRetry={() => this.setState({ error: null })} />;
    }

    return this.props.children;
  }
}

function RuntimeErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const reload = () => window.location.reload();
  const goHome = () => {
    window.location.hash = "#/";
    onRetry();
  };

  return (
    <section className="runtime-error">
      <div className="runtime-error-visual">
        <AlertTriangle size={30} />
        <span>Runtime Guard</span>
      </div>
      <div>
        <span className="eyebrow">Demo Recovery</span>
        <h1>演示状态暂时中断</h1>
        <p>当前页面渲染时遇到异常，平台已保留导航和恢复入口，便于继续演示或回到默认链路。</p>
        <code>{error.message || "Unknown render error"}</code>
        <div className="runtime-error-actions">
          <button className="primary-button" type="button" onClick={onRetry}>
            重新尝试
            <RefreshCw size={17} />
          </button>
          <button className="secondary-button" type="button" onClick={goHome}>
            返回首页
          </button>
          <button className="secondary-button" type="button" onClick={reload}>
            刷新演示
          </button>
        </div>
      </div>
    </section>
  );
}

function ExperienceFlow({ activePath, selectedCase = featuredCase }: { activePath: string; selectedCase?: ClinicalCase }) {
  return (
    <section className="experience-flow" aria-label="肝视界 Demo 演示链路">
      <div className="experience-flow-head">
        <span className="eyebrow">Demo Journey</span>
        <h2>一条链路跑完整个平台</h2>
      </div>
      <div className="experience-flow-rail">
        {experienceFlow.map((item, index) => (
          <a className={activePath === item.path ? "active" : ""} href={flowHref(item.path, selectedCase)} key={item.path}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{item.title}</strong>
            <small>{item.detail}</small>
          </a>
        ))}
      </div>
    </section>
  );
}

function CaseOverviewBand({ selectedCase, mode = "analysis" }: { selectedCase: ClinicalCase; mode?: "analysis" | "report" }) {
  const overviewMetrics = ["肝脏体积", "肿瘤最大直径", "血管邻近情况", "分割置信度"];

  return (
    <section className="case-overview-band">
      <a className="case-overview-visual" href={caseHref("/imaging", selectedCase)}>
        <img src={selectedCase.snapshot} alt={`${selectedCase.id} 当前病例快照`} />
        <span>{mode === "report" ? "Report Source" : "Active Case"}</span>
      </a>
      <div className="case-overview-copy">
        <span className="eyebrow">{mode === "report" ? "Report Context" : "Clinical Context"}</span>
        <h2>{selectedCase.id} · {selectedCase.lesion}</h2>
        <p>
          {selectedCase.patient} / {selectedCase.sex} / {selectedCase.age} 岁 · {selectedCase.hospital} · {selectedCase.department}
        </p>
      </div>
      <div className="case-overview-metrics">
        {overviewMetrics.map((label) => (
          <article key={label}>
            <span>{label}</span>
            <strong>{metricValue(selectedCase, label)}</strong>
          </article>
        ))}
      </div>
      <div className="case-overview-actions">
        <RiskBadge risk={selectedCase.risk} />
        <a className="secondary-button" href={caseHref("/imaging", selectedCase)}>
          影像分析
        </a>
        <a className="primary-button" href={caseHref("/reports", selectedCase, "generated=1")}>
          报告预览
        </a>
      </div>
    </section>
  );
}

function DemoStatusHub({
  currentPath,
  demoState,
  onDemoStateReset,
  onDemoStateChange,
  selectedCase,
  storageStatus
}: {
  currentPath: string;
  demoState: DemoState;
  onDemoStateReset: () => void;
  onDemoStateChange: (update: DemoStateUpdate) => void;
  selectedCase: ClinicalCase;
  storageStatus: StorageStatus;
}) {
  const selectedPilotCases = cases.filter((item) => demoState.selectedPilotCaseIds.includes(item.id));
  const checkedMaterials = materialItems.filter((item) => demoState.materialChecklist[item]).length;
  const readinessScore = Math.min(100, Math.round((selectedPilotCases.length ? 28 : 0) + (checkedMaterials / materialItems.length) * 52 + (demoState.pilotSubmittedAt ? 20 : 0)));
  const priority = priorityForCase(selectedCase);
  const activeInPilotPackage = demoState.selectedPilotCaseIds.includes(selectedCase.id);
  const deliveryLabel = demoState.pilotSubmittedAt ? "已提交" : checkedMaterials === materialItems.length ? "可提交" : "待补齐";
  const activeImagingEvidence = demoState.imagingEvidence[selectedCase.id];
  const imagingLabel = activeImagingEvidence?.status === "completed" ? "已完成" : activeImagingEvidence?.status === "running" ? "处理中" : "待演示";
  const imagingDetail = activeImagingEvidence
    ? `${activeImagingEvidence.viewLabel} · 切片 ${String(activeImagingEvidence.slice).padStart(3, "0")}`
    : "完成 AI 分析后同步到试点验收";

  const toggleActiveCaseInPilotPackage = () => {
    onDemoStateChange((state) => {
      const selected = state.selectedPilotCaseIds.includes(selectedCase.id);
      if (selected && state.selectedPilotCaseIds.length === 1) {
        return {
          ...state,
          activeCaseId: selectedCase.id,
          lastAction: `试点病例包至少保留 1 例，当前病例 ${selectedCase.id} 已保留。`
        };
      }
      const nextCaseIds = selected ? state.selectedPilotCaseIds.filter((id) => id !== selectedCase.id) : [...state.selectedPilotCaseIds, selectedCase.id];
      return {
        ...state,
        activeCaseId: selectedCase.id,
        selectedPilotCaseIds: nextCaseIds,
        lastAction: selected ? `已从试点病例包移除当前病例 ${selectedCase.id}。` : `已将当前病例 ${selectedCase.id} 加入试点病例包。`
      };
    });
  };

  return (
    <section className="demo-status-hub" aria-label="当前演示状态">
      <a className="hub-active-case" href={caseHref("/imaging", selectedCase)}>
        <img src={selectedCase.snapshot} alt={`${selectedCase.id} 当前演示病例`} />
        <div>
          <span className="eyebrow">Active Case</span>
          <strong>{selectedCase.id}</strong>
          <small>{selectedCase.lesion} · {selectedCase.risk}</small>
        </div>
      </a>

      <div className="hub-signal-grid">
        {[
          { label: "复核优先级", value: priority.label, detail: priority.detail },
          { label: "试点病例包", value: `${selectedPilotCases.length} 例`, detail: demoState.casePackage },
          { label: "影像演示", value: imagingLabel, detail: imagingDetail },
          { label: "报告模板", value: demoState.reportTemplate, detail: `${demoState.exportFormat} · ${demoState.reviewTone}` },
          { label: "交付准备度", value: `${readinessScore}%`, detail: `${deliveryLabel} · 材料 ${checkedMaterials}/${materialItems.length}` }
        ].map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </div>

      <div className="hub-actions">
        <a className={currentPath === "/imaging" ? "active" : ""} href={caseHref("/imaging", selectedCase)}>
          <Activity size={15} />
          影像
        </a>
        <a className={currentPath === "/reports" ? "active" : ""} href={caseHref("/reports", selectedCase, "generated=1")}>
          <FileText size={15} />
          报告
        </a>
        <a className={currentPath === "/pilot" ? "active" : ""} href="#/pilot">
          <ShieldCheck size={15} />
          试点
        </a>
        <button type="button" onClick={toggleActiveCaseInPilotPackage}>
          {activeInPilotPackage ? <CheckCircle2 size={15} /> : <Plus size={15} />}
          {activeInPilotPackage ? "已入包" : "入包"}
        </button>
      </div>

      <div className="hub-last-action">
        <div>
          <span>最近动作</span>
          <strong>{demoState.lastAction || "等待演示操作同步"}</strong>
        </div>
        <div className={`hub-storage ${storageStatus.tone}`}>
          <Database size={15} />
          <div>
            <span>{storageStatus.label}</span>
            <small>{storageStatus.detail} · {storageStatus.updatedAt}</small>
          </div>
          <button type="button" onClick={onDemoStateReset}>
            恢复默认
          </button>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const confidence = metricValue(featuredCase, "分割置信度");
  const capabilityCards = [
    { icon: BrainCircuit, title: "肝脏智能分割", text: "自动识别肝脏轮廓，生成可复核的结构化分割结果。" },
    { icon: Microscope, title: "肿瘤智能分割", text: "突出病灶边界、数量、体积和最大直径，辅助风险判断。" },
    { icon: Layers3, title: "血管与三维重建", text: "肝脏、肿瘤、血管分色呈现，支持多角度术前观察。" },
    { icon: FileText, title: "辅助报告生成", text: "沉淀量化指标、AI 分析说明和医生复核要点。" }
  ];

  return (
    <>
      <section className="home-hero">
        <div className="hero-copy">
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            多模态影像智能分析平台
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            肝视界
            <span>让肝脏肿瘤评估从二维影像走向可解释的三维决策。</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
            面向肝胆外科、影像科和远程会诊场景，整合 DICOM 解析、AI 分割、三维重建和辅助报告生成，
            为术前规划与科研教学提供清晰、可信、可演示的工作台。
          </motion.p>
          <motion.div className="hero-actions" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}>
            <a className="primary-button" href={caseHref("/imaging", featuredCase)}>
              进入平台
              <ArrowRight size={18} />
            </a>
            <a className="secondary-button" href={caseHref("/reports", featuredCase)}>
              查看样例报告
            </a>
            <a className="ghost-link" href="#/pilot">
              申请试点
            </a>
          </motion.div>
        </div>

        <motion.div className="hero-visual" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }}>
          <div className="hero-canvas-shell">
            <MedicalScene compact />
            <div className="hero-floating-metric left">
              <span>分割置信度</span>
              <strong>{confidence}</strong>
            </div>
            <div className="hero-floating-metric right">
              <span>平均处理</span>
              <strong>{featuredCase.processingTime}</strong>
            </div>
          </div>
          <div className="product-strip">
            {productShots.slice(0, 4).map((shot, index) => (
              <img src={shot} alt={`肝视界产品样例 ${index + 1}`} key={shot} />
            ))}
          </div>
        </motion.div>
      </section>

      <ExperienceFlow activePath="/" />

      <section className="pain-section">
        <SectionTitle
          eyebrow="Clinical Friction"
          title="把耗时、难解释、不直观的影像分析流程压缩成一条可复核链路"
          body="平台重点解决人工分割耗时长、肿瘤边界识别难、三维关系展示不直观、基层影像分析能力不足等问题。"
        />
        <div className="pain-grid">
          {["人工分割耗时长", "肿瘤边界识别难", "三维关系展示不直观", "基层影像分析能力不足"].map((item, index) => (
            <article className="pain-item" key={item}>
              <span>0{index + 1}</span>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="capability-section">
        <SectionTitle eyebrow="Core Capability" title="从切片到模型，从指标到报告" />
        <div className="capability-grid">
          {capabilityCards.map(({ icon: Icon, title, text }) => (
            <article className="capability-card" key={title}>
              <Icon size={24} />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="scenario-band">
        <div>
          <span className="eyebrow">Scenarios</span>
          <h2>术前规划、远程会诊、科研教学和数据复盘，一套界面贯通。</h2>
        </div>
        <div className="scenario-list">
          {["术前规划", "远程会诊", "科研教学", "数据复盘"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>
    </>
  );
}

function DashboardPage({
  demoState,
  onDemoStateChange
}: {
  demoState: DemoState;
  onDemoStateChange: (update: DemoStateUpdate) => void;
}) {
  const filteredCases = useMemo(() => {
    const search = demoState.caseSearch.trim().toLowerCase();
    return cases.filter((item) => {
      const matchesSearch = search
        ? [item.id, item.patient, item.hospital, item.department, item.type, item.lesion, item.status].join(" ").toLowerCase().includes(search)
        : true;
      const matchesRisk = demoState.riskFilter === "全部风险" || item.risk === demoState.riskFilter;
      const matchesStatus = demoState.statusFilter === "全部状态" || item.status === demoState.statusFilter;
      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [demoState.caseSearch, demoState.riskFilter, demoState.statusFilter]);

  const selectedPilotCases = cases.filter((item) => demoState.selectedPilotCaseIds.includes(item.id));

  return (
    <>
      <PageHeader
        eyebrow="Data Command Center"
        title="数据驾驶舱"
        body="以病例、报告、处理耗时、分割准确率和风险分布为核心指标，快速观察平台运行状态。"
        action={
          <a className="primary-button" href={caseHref("/imaging", featuredCase)}>
            演示单病例闭环
            <ArrowRight size={18} />
          </a>
        }
      />

      <ExperienceFlow activePath="/dashboard" />

      <section className="stats-grid">
        {metrics.map((metric) => (
          <StatCard {...metric} key={metric.label} />
        ))}
      </section>

      <PilotCommandCenter demoState={demoState} onDemoStateChange={onDemoStateChange} selectedPilotCases={selectedPilotCases} />

      <CaseWorkbench
        demoState={demoState}
        filteredCases={filteredCases}
        onDemoStateChange={onDemoStateChange}
        selectedPilotCases={selectedPilotCases}
      />

      <section className="dashboard-grid">
        <article className="chart-panel wide">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Trend</span>
              <h3>月度病例趋势</h3>
            </div>
            <BarChart3 size={22} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyCases}>
              <defs>
                <linearGradient id="caseGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe7f3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #dbe7f3" }} />
              <Legend />
              <Area type="monotone" dataKey="cases" name="病例数" stroke="#0ea5e9" fill="url(#caseGradient)" strokeWidth={3} />
              <Area type="monotone" dataKey="reports" name="报告数" stroke="#14b8a6" fill="#14b8a61a" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Lesion</span>
              <h3>病灶类型占比</h3>
            </div>
            <Activity size={22} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={lesionTypeData} dataKey="value" nameKey="name" innerRadius={62} outerRadius={104} paddingAngle={4}>
                {lesionTypeData.map((entry, index) => (
                  <Cell fill={chartColors[index % chartColors.length]} key={entry.name} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #dbe7f3" }} />
            </PieChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Risk</span>
              <h3>风险等级分布</h3>
            </div>
            <ShieldCheck size={22} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe7f3" />
              <XAxis dataKey="level" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #dbe7f3" }} />
              <Bar dataKey="count" name="病例数" radius={[12, 12, 0, 0]} fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </article>

        <article className="chart-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Follow-up</span>
              <h3>随访时间分布</h3>
            </div>
            <Clock3 size={22} />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={followupData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe7f3" />
              <XAxis dataKey="range" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 16, border: "1px solid #dbe7f3" }} />
              <Bar dataKey="value" name="随访病例" radius={[12, 12, 0, 0]} fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </article>
      </section>
    </>
  );
}

function priorityForCase(item: ClinicalCase) {
  if (item.risk.includes("高") || item.risk.includes("复核")) return { label: "P1", detail: "优先复核", tone: "high" };
  if (item.risk.includes("中")) return { label: "P2", detail: "医生确认", tone: "medium" };
  return { label: "P3", detail: "常规归档", tone: "low" };
}

function modelViewLabel(view: "all" | "liver" | "tumor" | "vessel") {
  if (view === "liver") return "肝脏模型";
  if (view === "tumor") return "病灶定位";
  if (view === "vessel") return "血管优先";
  return "全部结构";
}

function pilotCommandActionFor(demoState: DemoState) {
  const selectedPilotCases = cases.filter((item) => demoState.selectedPilotCaseIds.includes(item.id));
  const priorityCase = selectedPilotCases.find((item) => priorityForCase(item).label === "P1") || selectedPilotCases[0] || featuredCase;
  const highPriorityPilotCases = selectedPilotCases.filter((item) => priorityForCase(item).label === "P1").length;
  const checkedMaterials = materialItems.filter((item) => demoState.materialChecklist[item]).length;
  const completedImagingCases = selectedPilotCases.filter((item) => demoState.imagingEvidence[item.id]?.status === "completed").length;
  const reviewNoteCount = Object.values(demoState.reviewNotes).filter((value) => value.trim()).length;
  const uncheckedManualItem = manualAcceptanceItems.find((item) => !demoState.pilotAcceptanceChecks[item.id]);

  if (selectedPilotCases.length < 2 || highPriorityPilotCases === 0) {
    return {
      label: "扩充病例包",
      detail: "纳入至少 2 例病例，并保留 1 例 P1 场景",
      href: "#/dashboard",
      tone: "warning"
    };
  }

  if (completedImagingCases === 0) {
    return {
      label: "完成影像演示",
      detail: `${priorityCase.id} 需要 AI 分析与三维查看留痕`,
      href: caseHref("/imaging", priorityCase),
      tone: "active"
    };
  }

  if (checkedMaterials < materialItems.length) {
    return {
      label: "补齐试点材料",
      detail: `材料清单 ${checkedMaterials}/${materialItems.length}，优先补齐权限和排期`,
      href: "#/pilot",
      tone: "warning"
    };
  }

  if (reviewNoteCount === 0) {
    return {
      label: "补充医生复核",
      detail: `${priorityCase.id} 需要复核意见进入报告闭环`,
      href: caseHref("/reports", priorityCase, "generated=1"),
      tone: "active"
    };
  }

  if (demoState.exportHistory.length === 0) {
    return {
      label: "生成会前材料",
      detail: "导出报告或加入 MDT 会前材料包",
      href: caseHref("/reports", priorityCase, "generated=1"),
      tone: "active"
    };
  }

  if (!demoState.pilotSubmittedAt) {
    return {
      label: "提交试点配置",
      detail: "配置已具备沟通条件，进入交付确认",
      href: "#/pilot",
      tone: "ready"
    };
  }

  if (uncheckedManualItem) {
    return {
      label: uncheckedManualItem.label,
      detail: uncheckedManualItem.detail,
      href: "#/pilot",
      tone: "active"
    };
  }

  return {
    label: "进入交付复盘",
    detail: "病例、影像、报告、材料和提交记录已形成闭环",
    href: "#/pilot",
    tone: "ready"
  };
}

function pilotAcceptanceItemsFor(demoState: DemoState) {
  const selectedPilotCases = cases.filter((item) => demoState.selectedPilotCaseIds.includes(item.id));
  const checkedMaterials = materialItems.filter((item) => demoState.materialChecklist[item]).length;
  const reviewNoteCount = Object.values(demoState.reviewNotes).filter((value) => value.trim()).length;
  const highPriorityPilotCases = selectedPilotCases.filter((item) => priorityForCase(item).label === "P1").length;
  const completedImagingCases = selectedPilotCases.filter((item) => demoState.imagingEvidence[item.id]?.status === "completed");

  return [
    {
      id: "casePackageReady",
      label: "病例包就绪",
      detail: `${selectedPilotCases.length} 例已纳入试点包，含 ${highPriorityPilotCases} 例 P1 场景`,
      done: selectedPilotCases.length >= 2 && highPriorityPilotCases > 0,
      mode: "auto"
    },
    {
      id: "imagingReady",
      label: "影像演示",
      detail: `${completedImagingCases.length}/${selectedPilotCases.length || 0} 例完成 AI 分析与三维查看留痕`,
      done: completedImagingCases.length > 0,
      mode: "auto"
    },
    {
      id: "materialsReady",
      label: "材料齐套",
      detail: `材料清单 ${checkedMaterials}/${materialItems.length}，用于沟通部署和数据权限`,
      done: checkedMaterials === materialItems.length,
      mode: "auto"
    },
    {
      id: "reviewReady",
      label: "报告复核",
      detail: `${reviewNoteCount} 条医生复核意见，模板为 ${demoState.reportTemplate}`,
      done: reviewNoteCount > 0,
      mode: "auto"
    },
    {
      id: "exportTrailReady",
      label: "导出留痕",
      detail: `${demoState.exportHistory.length} 条报告导出或 MDT 材料记录`,
      done: demoState.exportHistory.length > 0,
      mode: "auto"
    },
    {
      id: "submissionReady",
      label: "提交记录",
      detail: demoState.pilotSubmittedAt ? `${demoState.pilotSubmittedAt} 已生成沟通路径` : "等待提交试点配置",
      done: Boolean(demoState.pilotSubmittedAt),
      mode: "auto"
    },
    ...manualAcceptanceItems.map((item) => ({
      ...item,
      done: Boolean(demoState.pilotAcceptanceChecks[item.id]),
      mode: "manual"
    }))
  ] as const;
}

function PilotCommandCenter({
  demoState,
  onDemoStateChange,
  selectedPilotCases
}: {
  demoState: DemoState;
  onDemoStateChange: (update: DemoStateUpdate) => void;
  selectedPilotCases: ClinicalCase[];
}) {
  const acceptanceItems = pilotAcceptanceItemsFor(demoState);
  const doneAcceptanceItems = acceptanceItems.filter((item) => item.done);
  const acceptanceScore = Math.round((doneAcceptanceItems.length / acceptanceItems.length) * 100);
  const commandAction = pilotCommandActionFor(demoState);
  const completedImagingCases = selectedPilotCases.filter((item) => demoState.imagingEvidence[item.id]?.status === "completed");
  const checkedMaterials = materialItems.filter((item) => demoState.materialChecklist[item]).length;
  const reviewNoteCount = Object.values(demoState.reviewNotes).filter((value) => value.trim()).length;
  const highPriorityCases = cases.filter((item) => priorityForCase(item).label === "P1");
  const leadCase = selectedPilotCases.find((item) => priorityForCase(item).label === "P1") || selectedPilotCases[0] || featuredCase;
  const missingItems = acceptanceItems.filter((item) => !item.done).slice(0, 4);
  const readinessSignals = [
    { label: "病例包", value: `${selectedPilotCases.length} 例`, detail: `${highPriorityCases.filter((item) => demoState.selectedPilotCaseIds.includes(item.id)).length} 例 P1` },
    { label: "影像留痕", value: `${completedImagingCases.length} 例`, detail: "AI 分析完成病例" },
    { label: "材料清单", value: `${checkedMaterials}/${materialItems.length}`, detail: demoState.deploymentPath },
    { label: "报告复核", value: `${reviewNoteCount} 条`, detail: `${demoState.reportTemplate} · ${demoState.exportFormat}` }
  ];
  const commandTimeline = [
    { label: "病例包", href: "#/dashboard", done: selectedPilotCases.length >= 2, detail: demoState.casePackage },
    { label: "影像", href: caseHref("/imaging", leadCase), done: completedImagingCases.length > 0, detail: demoState.imagingEvidence[leadCase.id]?.viewLabel || "等待留痕" },
    { label: "报告", href: caseHref("/reports", leadCase, "generated=1"), done: reviewNoteCount > 0 && demoState.exportHistory.length > 0, detail: `${reviewNoteCount} 条复核 / ${demoState.exportHistory.length} 条导出` },
    { label: "试点", href: "#/pilot", done: Boolean(demoState.pilotSubmittedAt), detail: demoState.pilotSubmittedAt || "等待提交" }
  ];

  const focusHighRiskPackage = () => {
    const highPriorityIds = highPriorityCases.map((item) => item.id);
    onDemoStateChange((state) => ({
      ...state,
      activeCaseId: highPriorityIds[0] || state.activeCaseId,
      casePackage: casePackageOptions[0].label,
      riskFilter: "全部风险",
      statusFilter: "全部状态",
      selectedPilotCaseIds: Array.from(new Set([...state.selectedPilotCaseIds, ...highPriorityIds])),
      lastAction: "已将 P1 高优先级病例纳入试点指挥台。"
    }));
  };

  const focusGaps = () => {
    onDemoStateChange((state) => ({
      ...state,
      caseSearch: "",
      riskFilter: "全部风险",
      statusFilter: "全部状态",
      activeCaseId: leadCase.id,
      lastAction: "已聚焦试点交付缺口，准备补齐演示闭环。"
    }));
  };

  return (
    <section className="pilot-command-center" aria-label="试点演示指挥台">
      <div className="command-hero-panel">
        <div className="command-copy">
          <span className="eyebrow">Pilot Command</span>
          <h3>试点演示指挥台</h3>
          <p>{demoState.pilotOrganization} · {demoState.pilotDepartment} · {demoState.pilotMode}</p>
        </div>
        <div className="command-score-ring" style={{ "--command-score": `${acceptanceScore}%` } as CSSProperties}>
          <strong>{acceptanceScore}</strong>
          <span>Ready</span>
        </div>
        <article className={`command-next-card ${commandAction.tone}`}>
          <span>下一步</span>
          <strong>{commandAction.label}</strong>
          <small>{commandAction.detail}</small>
          <a href={commandAction.href}>
            继续推进
            <ArrowRight size={16} />
          </a>
        </article>
      </div>

      <div className="command-signal-grid">
        {readinessSignals.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </div>

      <div className="command-board-grid">
        <article className="command-board-card">
          <div className="mini-heading">
            <span className="eyebrow">Gaps</span>
            <strong>交付缺口</strong>
          </div>
          <div className="command-gap-list">
            {(missingItems.length ? missingItems : acceptanceItems.slice(0, 4)).map((item) => (
              <div className={item.done ? "done" : ""} key={item.id}>
                {item.done ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.detail}</small>
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="command-board-card">
          <div className="mini-heading">
            <span className="eyebrow">Pilot Cases</span>
            <strong>试点病例阵列</strong>
          </div>
          <div className="command-case-stack">
            {(selectedPilotCases.length ? selectedPilotCases : [featuredCase]).slice(0, 3).map((item) => {
              const evidence = demoState.imagingEvidence[item.id];
              const priority = priorityForCase(item);
              return (
                <a href={caseHref("/imaging", item)} key={item.id}>
                  <img src={item.snapshot} alt={`${item.id} 试点病例`} />
                  <span>
                    <strong>{item.id}</strong>
                    <small>{priority.label} · {evidence?.status === "completed" ? evidence.viewLabel : item.status}</small>
                  </span>
                </a>
              );
            })}
          </div>
        </article>

        <article className="command-board-card">
          <div className="mini-heading">
            <span className="eyebrow">Runway</span>
            <strong>交付节奏</strong>
          </div>
          <div className="command-timeline">
            {commandTimeline.map((item, index) => (
              <a className={item.done ? "done" : ""} href={item.href} key={item.label}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </a>
            ))}
          </div>
        </article>
      </div>

      <div className="command-action-row">
        <button className="secondary-button" type="button" onClick={focusHighRiskPackage}>
          <ShieldCheck size={16} />
          锁定 P1 病例包
        </button>
        <button className="secondary-button" type="button" onClick={focusGaps}>
          <Sparkles size={16} />
          聚焦交付缺口
        </button>
        <a className="primary-button" href="#/pilot">
          打开试点沙盒
          <ArrowRight size={17} />
        </a>
      </div>
    </section>
  );
}

function CaseWorkbench({
  demoState,
  filteredCases,
  onDemoStateChange,
  selectedPilotCases
}: {
  demoState: DemoState;
  filteredCases: ClinicalCase[];
  onDemoStateChange: (update: DemoStateUpdate) => void;
  selectedPilotCases: ClinicalCase[];
}) {
  const highPriorityCount = cases.filter((item) => priorityForCase(item).label === "P1").length;
  const reportReadyCount = cases.filter((item) => item.reportStatus.includes("已") || item.status.includes("报告")).length;

  const updateFilters = (patch: Partial<Pick<DemoState, "caseSearch" | "riskFilter" | "statusFilter">>) => {
    onDemoStateChange((state) => ({ ...state, ...patch }));
  };

  const togglePilotCase = (caseId: string) => {
    onDemoStateChange((state) => {
      const selected = state.selectedPilotCaseIds.includes(caseId);
      const nextCaseIds = selected ? state.selectedPilotCaseIds.filter((id) => id !== caseId) : [...state.selectedPilotCaseIds, caseId];
      return {
        ...state,
        activeCaseId: caseId,
        selectedPilotCaseIds: nextCaseIds.length ? nextCaseIds : [caseId],
        lastAction: selected ? `已从试点病例包移除 ${caseId}。` : `已将 ${caseId} 加入试点病例包。`
      };
    });
  };

  return (
    <section className="case-workbench">
      <div className="workbench-head">
        <div>
          <span className="eyebrow">Case Workbench</span>
          <h3>病例优先级工作台</h3>
          <p>从同一个工作台筛选病例、设置试点包，并进入影像分析、报告复核或试点配置。</p>
        </div>
        <a className="secondary-button" href="#/pilot">
          配置试点包
        </a>
      </div>

      <div className="workbench-controls">
        <label>
          <span>检索病例</span>
          <input
            value={demoState.caseSearch}
            onChange={(event) => updateFilters({ caseSearch: event.target.value })}
            placeholder="病例编号 / 医院 / 病灶 / 状态"
          />
        </label>
        <label>
          <span>风险等级</span>
          <select value={demoState.riskFilter} onChange={(event) => updateFilters({ riskFilter: event.target.value })}>
            {riskFilters.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>处理状态</span>
          <select value={demoState.statusFilter} onChange={(event) => updateFilters({ statusFilter: event.target.value })}>
            {statusFilters.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="workbench-signal-grid">
        {[
          { label: "筛选结果", value: `${filteredCases.length} 例`, detail: "当前工作台可见病例" },
          { label: "P1 优先级", value: `${highPriorityCount} 例`, detail: "高风险或需复核病例" },
          { label: "报告就绪", value: `${reportReadyCount} 例`, detail: "已生成或已归档报告" },
          { label: "试点病例包", value: `${selectedPilotCases.length} 例`, detail: demoState.casePackage },
          { label: "最近动作", value: demoState.lastAction ? "已记录" : "待操作", detail: demoState.lastAction || "选择病例后同步到试点配置" }
        ].map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </div>

      <div className="data-table case-workbench-table">
        <div className="table-row table-head">
          <span>病例编号</span>
          <span>患者</span>
          <span>影像类型</span>
          <span>病灶摘要</span>
          <span>优先级</span>
          <span>风险</span>
          <span>状态</span>
          <span>试点包</span>
          <span>操作</span>
        </div>
        {filteredCases.length ? (
          filteredCases.map((item) => {
            const priority = priorityForCase(item);
            const selected = demoState.selectedPilotCaseIds.includes(item.id);
            return (
              <div className="table-row" key={item.id}>
                <span>{item.id}</span>
                <span>{item.patient}</span>
                <span>{item.type}</span>
                <span>{item.lesion}</span>
                <span>
                  <span className={`priority-pill ${priority.tone}`}>
                    {priority.label}
                    <small>{priority.detail}</small>
                  </span>
                </span>
                <span>
                  <RiskBadge risk={item.risk} />
                </span>
                <span>{item.status}</span>
                <span className={selected ? "pilot-selected" : "pilot-pending"}>{selected ? "已加入" : "待选择"}</span>
                <span className="row-actions">
                  <a href={caseHref("/imaging", item)} onClick={() => onDemoStateChange((state) => ({ ...state, activeCaseId: item.id }))}>
                    分析
                  </a>
                  <a href={caseHref("/reports", item)} onClick={() => onDemoStateChange((state) => ({ ...state, activeCaseId: item.id }))}>
                    报告
                  </a>
                  <button type="button" onClick={() => togglePilotCase(item.id)}>
                    {selected ? "移除" : "试点"}
                  </button>
                </span>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <Database size={28} />
            <strong>没有匹配病例</strong>
            <span>调整检索词、风险等级或处理状态后继续筛选。</span>
          </div>
        )}
      </div>
    </section>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const className = risk.includes("高") ? "high" : risk.includes("中") ? "medium" : risk.includes("复核") ? "review" : "low";
  return <span className={`risk-badge ${className}`}>{risk}</span>;
}

function CaseSidePanel({
  selectedCase,
  fileName,
  onSelectFile,
  onClear,
  onStart
}: {
  selectedCase: ClinicalCase;
  fileName: string;
  onSelectFile: () => void;
  onClear: () => void;
  onStart: () => void;
}) {
  return (
    <article className="upload-panel case-side-panel">
      <div className="case-profile">
        <span className="eyebrow">Active Case</span>
        <h3>{selectedCase.id}</h3>
        <div className="case-profile-main">
          <strong>{selectedCase.patient}</strong>
          <span>
            {selectedCase.sex} / {selectedCase.age} 岁
          </span>
        </div>
        <p>{selectedCase.hospital}</p>
        <p>{selectedCase.department} · {selectedCase.accession}</p>
        <RiskBadge risk={selectedCase.risk} />
      </div>

      <div className="case-switcher">
        <div className="mini-heading">
          <span className="eyebrow">Case Queue</span>
          <strong>病例切换</strong>
        </div>
        {cases.map((item) => (
          <a
            className={item.id === selectedCase.id ? "active" : ""}
            data-case-id={item.id}
            href={caseHref("/imaging", item)}
            key={item.id}
          >
            <span>{item.id}</span>
            <strong>{item.lesion}</strong>
            <small>
              {item.patient} · {item.type} · {item.status}
            </small>
            <RiskBadge risk={item.risk} />
          </a>
        ))}
      </div>

      <div className="upload-drop compact-drop" onClick={onSelectFile} role="button" tabIndex={0}>
        <UploadCloud size={28} />
        <strong>选择 DICOM 文件夹压缩包</strong>
        <span>当前病例文件可替换演示</span>
      </div>

      <div className="file-meta">
        <div>
          <span>文件名</span>
          <strong>{fileName}</strong>
        </div>
        <div>
          <span>文件大小</span>
          <strong>{selectedCase.fileSize}</strong>
        </div>
        <div>
          <span>影像类型</span>
          <strong>{selectedCase.type}</strong>
        </div>
        <div>
          <span>切片数量</span>
          <strong>{selectedCase.sliceCount} 张</strong>
        </div>
        <div>
          <span>上传状态</span>
          <strong className="status-ready">已就绪</strong>
        </div>
      </div>
      <div className="upload-actions">
        <button className="primary-button" type="button" onClick={onStart}>
          开始处理
        </button>
        <button className="secondary-button" type="button" onClick={onClear}>
          清空
        </button>
      </div>
    </article>
  );
}

function ImagingPage({
  demoState,
  onDemoStateChange,
  selectedCase
}: {
  demoState: DemoState;
  onDemoStateChange: (update: DemoStateUpdate) => void;
  selectedCase: ClinicalCase;
}) {
  const savedEvidence = demoState.imagingEvidence[selectedCase.id];
  const [slice, setSlice] = useState(savedEvidence?.slice ?? Math.min(72, selectedCase.sliceCount));
  const [overlays, setOverlays] = useState({ liver: true, tumor: true, vessel: true });
  const [modelView, setModelView] = useState<"all" | "liver" | "tumor" | "vessel">(savedEvidence?.viewKey ?? "all");
  const [activeStep, setActiveStep] = useState(savedEvidence?.status === "completed" ? 7 : savedEvidence?.step ?? 0);
  const [isRunning, setIsRunning] = useState(false);
  const [fileName, setFileName] = useState(selectedCase.fileName);
  const [liverOpacity, setLiverOpacity] = useState(58);
  const [exportNotice, setExportNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const recordImagingEvidence = useCallback(
    (patch: Partial<ImagingEvidence>, action: string) => {
      onDemoStateChange((state) => {
        const previous = state.imagingEvidence[selectedCase.id] || {
          status: "idle",
          step: 0,
          slice,
          viewKey: modelView,
          viewLabel: modelViewLabel(modelView),
          exportCount: 0,
          completedAt: "",
          lastEvent: ""
        };
        const nextEvidence: ImagingEvidence = {
          ...previous,
          step: activeStep,
          slice,
          viewKey: modelView,
          viewLabel: modelViewLabel(modelView),
          ...patch
        };

        return {
          ...state,
          activeCaseId: selectedCase.id,
          imagingEvidence: {
            ...state.imagingEvidence,
            [selectedCase.id]: nextEvidence
          },
          lastAction: action
        };
      });
    },
    [activeStep, modelView, onDemoStateChange, selectedCase.id, slice]
  );

  useEffect(() => {
    const evidence = demoState.imagingEvidence[selectedCase.id];
    setSlice(evidence?.slice ?? Math.min(72, selectedCase.sliceCount));
    setFileName(selectedCase.fileName);
    setModelView(evidence?.viewKey ?? "all");
    setActiveStep(evidence?.status === "completed" ? 7 : evidence?.step ?? 0);
    setIsRunning(false);
    setExportNotice(evidence?.status === "completed" ? evidence.lastEvent : "");
  }, [selectedCase]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setActiveStep((step) => {
        const nextStep = Math.min(7, step + 1);
        if (nextStep >= 7) {
          const message = `${selectedCase.id} AI 分析完成，已生成结构化报告草稿。`;
          setIsRunning(false);
          setExportNotice(message);
          recordImagingEvidence(
            {
              status: "completed",
              step: 7,
              completedAt: statusTime(),
              lastEvent: message
            },
            message
          );
          window.clearInterval(timer);
          return 7;
        }
        recordImagingEvidence(
          {
            status: "running",
            step: nextStep,
            completedAt: "",
            lastEvent: `${selectedCase.id} 正在执行 AI 分割与三维重建。`
          },
          `${selectedCase.id} 正在执行 AI 分割与三维重建。`
        );
        return nextStep;
      });
    }, 850);

    return () => window.clearInterval(timer);
  }, [isRunning, recordImagingEvidence, selectedCase.id]);

  const modelVisibility = useMemo(
    () => ({
      showLiver: modelView === "all" || modelView === "liver",
      showTumor: modelView === "all" || modelView === "tumor",
      showVessel: modelView === "all" || modelView === "vessel"
    }),
    [modelView]
  );

  const startProcessing = () => {
    setActiveStep(0);
    setExportNotice("");
    setIsRunning(true);
    recordImagingEvidence(
      {
        status: "running",
        step: 0,
        completedAt: "",
        lastEvent: `${selectedCase.id} 已启动 AI 分析流程。`
      },
      `${selectedCase.id} 已启动 AI 分割与三维重建。`
    );
  };

  const processingComplete = activeStep === 7;
  const evidence = demoState.imagingEvidence[selectedCase.id];
  const evidenceStatus = processingComplete || evidence?.status === "completed" ? "已完成" : isRunning || evidence?.status === "running" ? "处理中" : "待演示";
  const workstationSignals = [
    { label: "复核优先级", value: selectedCase.risk.includes("高") ? "P1" : selectedCase.risk.includes("复核") ? "P1" : selectedCase.risk.includes("中") ? "P2" : "P3", detail: "结合风险等级自动提示" },
    { label: "关键切片", value: String(slice).padStart(3, "0"), detail: `${selectedCase.sliceCount} 张序列内定位` },
    { label: "病灶负荷", value: metricValue(selectedCase, "肿瘤体积"), detail: metricValue(selectedCase, "肿瘤数量") },
    { label: "报告状态", value: processingComplete ? "草稿就绪" : selectedCase.reportStatus, detail: processingComplete ? "可进入报告中心" : "等待 AI 流程完成" },
    { label: "演示留痕", value: evidenceStatus, detail: evidence?.lastEvent || "开始处理后写入试点沙盒" }
  ];
  const evidenceSummary = [
    { label: "状态", value: evidenceStatus, detail: evidence?.completedAt ? `完成于 ${evidence.completedAt}` : "等待 AI 流程完成" },
    { label: "三维视角", value: evidence?.viewLabel || modelViewLabel(modelView), detail: `肝脏透明度 ${liverOpacity}%` },
    { label: "关键切片", value: String(evidence?.slice ?? slice).padStart(3, "0"), detail: `${selectedCase.sliceCount} 张序列` },
    { label: "截图导出", value: `${evidence?.exportCount || 0} 次`, detail: "可作为 MDT 会前材料" }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Segmentation & Reconstruction"
        title="影像分割与三维重建中心"
        body={`${selectedCase.id} · ${selectedCase.patient} · ${selectedCase.lesion}。从 DICOM 解析到三维重建，再到辅助报告生成，形成单病例演示闭环。`}
        action={
          <div className="header-actions">
            <button className="primary-button" type="button" onClick={startProcessing}>
              开始处理
              <ArrowRight size={18} />
            </button>
            <a
              className={`secondary-button ${processingComplete ? "" : "disabled-link"}`}
              href={caseHref("/reports", selectedCase, "generated=1")}
              onClick={() => {
                const message = `${selectedCase.id} 已从影像中心进入辅助报告生成。`;
                recordImagingEvidence({ lastEvent: message }, message);
              }}
            >
              生成报告
              <FileText size={17} />
            </a>
          </div>
        }
      />

      <ExperienceFlow activePath="/imaging" selectedCase={selectedCase} />
      <CaseOverviewBand selectedCase={selectedCase} />

      <section className="workstation-status-grid" aria-label="影像工作站状态">
        {workstationSignals.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </section>

      <section className={`imaging-evidence-strip ${processingComplete ? "complete" : ""}`} aria-label="影像演示留痕">
        <div>
          <span className="eyebrow">Workflow Evidence</span>
          <strong>{evidence?.lastEvent || `${selectedCase.id} 等待开始影像分析。`}</strong>
        </div>
        <div className="imaging-evidence-grid">
          {evidenceSummary.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="imaging-grid">
        <CaseSidePanel
          selectedCase={selectedCase}
          fileName={fileName}
          onSelectFile={() => fileInput.current?.click()}
          onClear={() => {
            const message = `${selectedCase.id} 已清空影像演示输入，等待重新选择 DICOM。`;
            setFileName("未选择文件");
            setActiveStep(0);
            setIsRunning(false);
            setExportNotice("");
            recordImagingEvidence(
              {
                status: "idle",
                step: 0,
                completedAt: "",
                lastEvent: message
              },
              message
            );
          }}
          onStart={startProcessing}
        />
        <input
          ref={fileInput}
          type="file"
          accept=".zip,.dcm"
          hidden
          onChange={(event) => {
            const nextFileName = event.target.files?.[0]?.name || fileName;
            const message = `${selectedCase.id} 已替换 DICOM 源文件。`;
            setFileName(nextFileName);
            setActiveStep(0);
            setIsRunning(false);
            setExportNotice("");
            recordImagingEvidence(
              {
                status: "idle",
                step: 0,
                completedAt: "",
                lastEvent: message
              },
              message
            );
          }}
        />

        <ProcessTimeline
          activeStep={activeStep}
          isRunning={isRunning}
          selectedCase={selectedCase}
          onStart={startProcessing}
          onReset={() => {
            const message = `${selectedCase.id} 已重置 AI 处理流程。`;
            setActiveStep(0);
            setIsRunning(false);
            setExportNotice("");
            recordImagingEvidence(
              {
                status: "idle",
                step: 0,
                completedAt: "",
                lastEvent: message
              },
              message
            );
          }}
        />
      </section>

      {exportNotice ? (
        <motion.div className="workflow-toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <CheckCircle2 size={18} />
          <span>{exportNotice}</span>
          <a href={caseHref("/reports", selectedCase, "generated=1")}>查看对应报告</a>
        </motion.div>
      ) : null}

      <section className="viewer-grid">
        <CtSliceViewer
          slice={slice}
          sliceCount={selectedCase.sliceCount}
          onSliceChange={setSlice}
          overlays={overlays}
          onOverlayChange={(key) => setOverlays((value) => ({ ...value, [key]: !value[key] }))}
          measurements={selectedCase.measurements}
        />

        <div className="model-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">3D Model</span>
              <h3>三维模型查看</h3>
            </div>
            <Rotate3D size={22} />
          </div>
          <div className="model-tabs">
            {[
              ["all", "全部模型"],
              ["liver", "肝脏模型"],
              ["tumor", "肿瘤模型"],
              ["vessel", "血管模型"]
            ].map(([value, label]) => (
              <button
                className={modelView === value ? "active" : ""}
                key={value}
                type="button"
                onClick={() => {
                  const nextView = value as typeof modelView;
                  const message = `${selectedCase.id} 已切换至${modelViewLabel(nextView)}视角。`;
                  setModelView(nextView);
                  setExportNotice(message);
                  recordImagingEvidence(
                    {
                      viewKey: nextView,
                      viewLabel: modelViewLabel(nextView),
                      lastEvent: message
                    },
                    message
                  );
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="model-preset-grid" aria-label="三维模型视角预设">
            {modelPresets.map((preset) => (
              <button
                className={modelView === preset.view && liverOpacity === preset.opacity ? "active" : ""}
                data-model-preset={preset.key}
                key={preset.key}
                type="button"
                onClick={() => {
                  const nextView = preset.view as typeof modelView;
                  const message = `${selectedCase.id} 已切换到${preset.label}视角。`;
                  setModelView(nextView);
                  setLiverOpacity(preset.opacity);
                  setExportNotice(message);
                  recordImagingEvidence(
                    {
                      viewKey: nextView,
                      viewLabel: preset.label,
                      lastEvent: message
                    },
                    message
                  );
                }}
              >
                <span>{preset.label}</span>
                <small>{preset.detail}</small>
              </button>
            ))}
          </div>
          <div className="model-control-grid">
            <label>
              <span>肝脏透明度</span>
              <input
                type="range"
                min="28"
                max="72"
                value={liverOpacity}
                onChange={(event) => setLiverOpacity(Number(event.target.value))}
              />
            </label>
            <button
              className="secondary-button icon-text"
              type="button"
              onClick={() => {
                const message = `${selectedCase.id} 已模拟导出当前三维视角截图。`;
                setExportNotice(message);
                recordImagingEvidence(
                  {
                    exportCount: (demoState.imagingEvidence[selectedCase.id]?.exportCount || 0) + 1,
                    lastEvent: message
                  },
                  message
                );
              }}
            >
              <Download size={16} />
              截图导出
            </button>
            <a
              className="primary-button icon-text"
              href={caseHref("/reports", selectedCase, "generated=1")}
              onClick={() => {
                const message = `${selectedCase.id} 已从影像中心进入辅助报告生成。`;
                recordImagingEvidence({ lastEvent: message }, message);
              }}
            >
              <FileText size={16} />
              生成报告
            </a>
          </div>
          <div className="model-stage">
            <MedicalScene {...modelVisibility} liverOpacity={liverOpacity / 100} />
            <div className="model-stage-overlay">
              <span>当前视角</span>
              <strong>{modelViewLabel(modelView)}</strong>
              <small>透明度 {liverOpacity}% · 可拖拽旋转</small>
            </div>
          </div>
          <div className="model-hints">
            <span>拖拽旋转</span>
            <span>滚轮缩放</span>
            <span>右键平移</span>
            <span>结构分色显示</span>
          </div>
        </div>
      </section>
    </>
  );
}

function ReportsPage({
  demoState,
  generated,
  onDemoStateChange,
  selectedCase
}: {
  demoState: DemoState;
  generated: boolean;
  onDemoStateChange: (update: DemoStateUpdate) => void;
  selectedCase: ClinicalCase;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [exportNotice, setExportNotice] = useState(generated ? "已从影像中心生成该病例的辅助报告草稿。" : "");
  const reviewNote = demoState.reviewNotes[selectedCase.id] || "";
  const filteredReports = useMemo(() => {
    const search = demoState.reportSearch.trim().toLowerCase();
    return reportList.filter((report) => {
      const reportCase = cases.find((item) => item.id === report.caseId);
      const matchesSearch = search
        ? [report.id, report.name, report.patient, report.status, report.risk, reportCase?.hospital, reportCase?.lesion].join(" ").toLowerCase().includes(search)
        : true;
      const matchesStatus = demoState.reportStatusFilter === "全部报告" || report.status === demoState.reportStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [demoState.reportSearch, demoState.reportStatusFilter]);

  const selectedReportCaseIds = new Set(filteredReports.map((report) => report.caseId));
  const reviewNoteCount = Object.values(demoState.reviewNotes).filter((value) => value.trim()).length;

  useEffect(() => {
    setExportNotice(generated ? "已从影像中心生成该病例的辅助报告草稿。" : "");
  }, [generated, selectedCase]);

  const handleExport = (message: string) => {
    const stamped = `${new Date().toLocaleTimeString("zh-CN", { hour12: false })} · ${message}`;
    setExportNotice(message);
    onDemoStateChange((state) => ({
      ...state,
      exportHistory: [stamped, ...state.exportHistory].slice(0, 5),
      lastAction: message
    }));
  };

  const regenerate = () => {
    setRegenerating(true);
    setExportNotice("");
    window.setTimeout(() => {
      setRegenerating(false);
      handleExport(`${selectedCase.reportId} 已按${demoState.reportTemplate}重新生成。`);
    }, 1100);
  };

  const reportReviewItems = [
    { label: "关键测量", value: selectedCase.measurements[0]?.value || "-", detail: selectedCase.measurements[0]?.detail || "等待测量" },
    { label: "血管邻近", value: selectedCase.measurements[1]?.value || "-", detail: selectedCase.measurements[1]?.detail || "等待复核" },
    { label: "复核建议", value: selectedCase.risk.includes("高") || selectedCase.risk.includes("复核") ? "建议 MDT" : "常规复核", detail: selectedCase.reportStatus },
    { label: "输出格式", value: demoState.exportFormat, detail: `${demoState.reportTemplate} · ${demoState.reviewTone}` }
  ];

  return (
    <>
      <PageHeader
        eyebrow="AI Report Center"
        title="辅助报告中心"
        body={`${selectedCase.reportId} · ${selectedCase.patient} · ${selectedCase.lesion}。报告内容与当前演示病例保持一致。`}
        action={
          <button className="primary-button" type="button" onClick={() => setPreviewOpen(true)}>
            预览报告
            <Eye size={18} />
          </button>
        }
      />

      <ExperienceFlow activePath="/reports" selectedCase={selectedCase} />
      <CaseOverviewBand selectedCase={selectedCase} mode="report" />

      <section className="report-hero">
        <article className="analysis-card">
          <span className="eyebrow">Analysis Result</span>
          <h3>{selectedCase.id} / {selectedCase.patient}</h3>
          <div className="analysis-grid">
            <span>影像类型</span>
            <strong>{selectedCase.type}</strong>
            <span>分析时间</span>
            <strong>{selectedCase.time}</strong>
            <span>模型版本</span>
            <strong>{selectedCase.modelVersion}</strong>
            <span>处理耗时</span>
            <strong>{selectedCase.processingTime}</strong>
            <span>风险等级</span>
            <strong>
              <RiskBadge risk={selectedCase.risk} />
            </strong>
          </div>
        </article>

        <article className="report-visual">
          <img src={selectedCase.snapshot} alt={`${selectedCase.id} 三维模型快照`} />
          <div>
            <span>三维重建快照</span>
            <strong>{selectedCase.lesion} · 肝脏 / 肿瘤 / 血管结构已分色</strong>
          </div>
        </article>
      </section>

      <section className="quant-grid">
        {selectedCase.metrics.map((metric) => (
          <article className="quant-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="ai-summary">
        <div>
          <span className="eyebrow">AI Assisted Insight</span>
          <h2>{selectedCase.aiSummary}</h2>
        </div>
        <div className="summary-points">
          {selectedCase.summaryPoints.map((item) => (
            <p key={item}>
              <CheckCircle2 size={18} />
              {item}
            </p>
          ))}
        </div>
      </section>

      <section className="report-review-board">
        <div className="report-review-head">
          <div>
            <span className="eyebrow">Review Board</span>
            <h3>结构化复核清单</h3>
          </div>
          <a className="secondary-button" href={caseHref("/imaging", selectedCase)}>
            回到影像工作站
          </a>
        </div>
        <div className="report-review-grid">
          {reportReviewItems.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>
        <div className="report-signoff-flow">
          {reportReviewStages.map((stage, index) => (
            <div className={index <= (generated ? 1 : 0) ? "active" : ""} key={stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{stage}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="report-template-panel">
        <div className="report-template-head">
          <div>
            <span className="eyebrow">Template & Sign-off</span>
            <h3>报告模板与复核意见</h3>
            <p>模板、复核语气和医生意见会保存在当前演示沙盒中，便于跨病例复盘。</p>
          </div>
          <span>{demoState.reportTemplate} · {demoState.reviewTone}</span>
        </div>
        <div className="report-template-options">
          <div>
            <strong>报告模板</strong>
            <div>
              {reportTemplates.map((template) => (
                <button
                  className={demoState.reportTemplate === template ? "active" : ""}
                  key={template}
                  type="button"
                  onClick={() => onDemoStateChange((state) => ({ ...state, reportTemplate: template, lastAction: `报告模板已切换为${template}。` }))}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>
          <div>
            <strong>复核语气</strong>
            <div>
              {reviewTones.map((tone) => (
                <button
                  className={demoState.reviewTone === tone ? "active" : ""}
                  key={tone}
                  type="button"
                  onClick={() => onDemoStateChange((state) => ({ ...state, reviewTone: tone, lastAction: `复核语气已切换为${tone}。` }))}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>
          <div>
            <strong>导出格式</strong>
            <div>
              {exportFormats.map((format) => (
                <button
                  className={demoState.exportFormat === format ? "active" : ""}
                  key={format}
                  type="button"
                  onClick={() => onDemoStateChange((state) => ({ ...state, exportFormat: format, lastAction: `导出格式已切换为${format}。` }))}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>
        </div>
        <label className="review-note-box">
          <span>医生复核意见</span>
          <textarea
            value={reviewNote}
            onChange={(event) =>
              onDemoStateChange((state) => ({
                ...state,
                lastAction: `已更新 ${selectedCase.id} 的复核意见。`,
                reviewNotes: { ...state.reviewNotes, [selectedCase.id]: event.target.value }
              }))
            }
            placeholder="例如：建议补充动脉期原始序列，MDT 会前重点复核血管邻近区域。"
          />
        </label>
        <div className="export-history">
          <div>
            <span className="eyebrow">Export Trail</span>
            <strong>导出记录</strong>
          </div>
          {demoState.exportHistory.length ? (
            demoState.exportHistory.map((item) => <span key={item}>{item}</span>)
          ) : (
            <span>尚未导出，本次演示的导出动作会在这里留痕。</span>
          )}
        </div>
      </section>

      <section className="report-sheet">
        <div className="report-sheet-header">
          <div>
            <span className="eyebrow">Structured Preview</span>
            <h3>{selectedCase.reportName}</h3>
            <p>{selectedCase.hospital} · {selectedCase.department}</p>
          </div>
          <RiskBadge risk={selectedCase.risk} />
        </div>
        <div className="report-sheet-grid">
          <div>
            <span>病例编号</span>
            <strong>{selectedCase.id}</strong>
          </div>
          <div>
            <span>报告编号</span>
            <strong>{selectedCase.reportId}</strong>
          </div>
          <div>
            <span>患者</span>
            <strong>{selectedCase.patient} / {selectedCase.sex} / {selectedCase.age} 岁</strong>
          </div>
          <div>
            <span>影像编号</span>
            <strong>{selectedCase.accession}</strong>
          </div>
          <div>
            <span>生成时间</span>
            <strong>{selectedCase.generatedAt}</strong>
          </div>
        </div>
        <div className="report-sheet-body">
          <img src={selectedCase.snapshot} alt={`${selectedCase.id} 报告快照`} />
          <div>
            <h4>AI 辅助建议</h4>
            <p>{selectedCase.aiSummary}</p>
            <div className="mini-measurements">
              {selectedCase.measurements.map((item) => (
                <span key={item.label}>
                  {item.label} <strong>{item.value}</strong>
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {exportNotice ? (
        <motion.div className="workflow-toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <CheckCircle2 size={18} />
          <span>{exportNotice}</span>
        </motion.div>
      ) : null}

      <section className="report-workbench">
        <div className="workbench-head">
          <div>
            <span className="eyebrow">Report Workbench</span>
            <h3>跨病例报告工作台</h3>
            <p>筛选报告状态、回看病例上下文，并按当前模板导出报告材料。</p>
          </div>
          <button className="secondary-button icon-text" type="button" onClick={regenerate}>
            <RefreshCw className={regenerating ? "spin" : ""} size={16} />
            {regenerating ? "重新生成中" : "重新生成"}
          </button>
        </div>

        <div className="workbench-controls">
          <label>
            <span>检索报告</span>
            <input
              value={demoState.reportSearch}
              onChange={(event) => onDemoStateChange((state) => ({ ...state, reportSearch: event.target.value }))}
              placeholder="报告编号 / 患者 / 医院 / 病灶"
            />
          </label>
          <label>
            <span>报告状态</span>
            <select value={demoState.reportStatusFilter} onChange={(event) => onDemoStateChange((state) => ({ ...state, reportStatusFilter: event.target.value }))}>
              {reportStatusFilters.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span>导出格式</span>
            <select value={demoState.exportFormat} onChange={(event) => onDemoStateChange((state) => ({ ...state, exportFormat: event.target.value }))}>
              {exportFormats.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="report-workbench-summary">
          {[
            { label: "当前报告", value: `${filteredReports.length} 份`, detail: "筛选后的报告数量" },
            { label: "覆盖病例", value: `${selectedReportCaseIds.size} 例`, detail: "可回跳影像分析" },
            { label: "复核意见", value: `${reviewNoteCount} 条`, detail: "已保存到沙盒状态" },
            { label: "导出格式", value: demoState.exportFormat, detail: demoState.reportTemplate }
          ].map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>

        <div className="data-table reports-table">
          <div className="table-row table-head">
            <span>报告编号</span>
            <span>报告名称</span>
            <span>患者</span>
            <span>生成时间</span>
            <span>风险等级</span>
            <span>状态</span>
            <span>操作</span>
          </div>
          {filteredReports.length ? (
            filteredReports.map((report) => {
              const reportCase = cases.find((item) => item.id === report.caseId) || selectedCase;
              const hasNote = Boolean(demoState.reviewNotes[report.caseId]?.trim());
              return (
                <div className="table-row" key={report.id}>
                  <span>{report.id}</span>
                  <span>{report.name}</span>
                  <span>{report.patient}</span>
                  <span>{report.generatedAt}</span>
                  <span>
                    <RiskBadge risk={report.risk} />
                  </span>
                  <span>{hasNote ? "已复核" : report.status}</span>
                  <span className="row-actions">
                    <a href={caseHref("/reports", reportCase)} onClick={() => onDemoStateChange((state) => ({ ...state, activeCaseId: reportCase.id }))}>
                      预览
                    </a>
                    <a href={caseHref("/imaging", reportCase)} onClick={() => onDemoStateChange((state) => ({ ...state, activeCaseId: reportCase.id }))}>
                      影像
                    </a>
                    <button type="button" onClick={() => handleExport(`${report.id} 已模拟导出${demoState.exportFormat}。`)}>
                      <Download size={14} />
                    </button>
                    <button type="button" onClick={() => handleExport(`${report.id} 已加入 MDT 会前材料包。`)}>
                      <FileDown size={14} />
                    </button>
                  </span>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <FileText size={28} />
              <strong>没有匹配报告</strong>
              <span>调整报告编号、患者、医院或状态筛选后继续查看。</span>
            </div>
          )}
        </div>
      </section>

      {previewOpen ? (
        <ReportPreview
          demoState={demoState}
          reviewNote={reviewNote}
          selectedCase={selectedCase}
          onExport={handleExport}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </>
  );
}

function ReportPreview({
  demoState,
  reviewNote,
  selectedCase,
  onExport,
  onClose
}: {
  demoState: DemoState;
  reviewNote: string;
  selectedCase: ClinicalCase;
  onExport: (message: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <motion.article
        className="report-modal"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(event) => event.stopPropagation()}
      >
        <button className="icon-button modal-close" type="button" onClick={onClose} aria-label="关闭报告预览">
          <X size={18} />
        </button>
        <span className="eyebrow">Report Preview</span>
        <h2>{selectedCase.reportName}</h2>
        <div className="preview-meta-grid">
          {[
            { label: "模板", value: demoState.reportTemplate },
            { label: "复核语气", value: demoState.reviewTone },
            { label: "导出格式", value: demoState.exportFormat },
            { label: "病例", value: selectedCase.id }
          ].map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
        <div className="preview-body">
          <img src={selectedCase.snapshot} alt={`${selectedCase.id} 模型报告插图`} />
          <div>
            <h3>AI 辅助结论</h3>
            <p>{selectedCase.aiSummary}</p>
            <div className="preview-note">
              <span>医生复核意见</span>
              <strong>{reviewNote.trim() || "待医生填写复核意见"}</strong>
            </div>
            <div className="preview-actions">
              <button className="primary-button" type="button" onClick={() => onExport(`${selectedCase.reportId} 已模拟导出${demoState.exportFormat}。`)}>
                导出当前格式
              </button>
              <button className="secondary-button" type="button" onClick={() => onExport(`${selectedCase.reportId} 已加入 MDT 会前材料包。`)}>
                加入 MDT 包
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

function PartnersPage() {
  const [selectedExpert, setSelectedExpert] = useState<(typeof expertProfiles)[number] | null>(null);

  return (
    <>
      <PageHeader
        eyebrow="Clinical Collaboration"
        title="合作与专家支持"
        body="展示合作医院、医学顾问、指导老师与合作证明，让 Demo 不只是界面演示，也有真实临床协作背景。"
      />

      <ExperienceFlow activePath="/partners" />

      <section className="partner-signal-band">
        <div>
          <span className="eyebrow">Clinical Trust</span>
          <h2>让演示从视觉样机变成可讨论的临床协作方案</h2>
        </div>
        <div className="partner-signal-grid">
          {partnerSignals.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="hospital-grid">
        {hospitals.map((hospital) => (
          <article className="hospital-card" key={hospital.name}>
            <img src={hospital.image} alt={hospital.name} />
            <div>
              <Hospital size={22} />
              <h3>{hospital.name}</h3>
              <p>{hospital.focus}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="photo-story">
        <SectionTitle eyebrow="Field Evidence" title="合作交流与临床场景素材" body="来自需求文档附件的真实图片素材，用于提升平台可信度与完整度。" />
        <div className="photo-rail">
          {collaborationPhotos.map((photo, index) => (
            <img src={photo} alt={`合作交流照片 ${index + 1}`} key={photo} />
          ))}
        </div>
      </section>

      <section className="expert-section">
        <SectionTitle eyebrow="Advisors" title="医学顾问与指导老师" />
        <div className="expert-grid">
          {expertProfiles.map((expert) => (
            <article className="expert-card" key={expert.name}>
              <img src={expert.image} alt={expert.name} />
              <div>
                <span>{expert.title}</span>
                <h3>{expert.name}</h3>
                <p>{expert.org}</p>
                <button className="secondary-button" type="button" onClick={() => setSelectedExpert(expert)}>
                  查看简介
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="proof-section">
        <SectionTitle eyebrow="Documents" title="合作证明" />
        <div className="proof-grid">
          {proofImages.map((image, index) => (
            <a href={image} target="_blank" rel="noreferrer" key={image}>
              <img src={image} alt={`合作证明 ${index + 1}`} />
              <span>查看证明 {index + 1}</span>
            </a>
          ))}
        </div>
      </section>

      {selectedExpert ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelectedExpert(null)}>
          <motion.article
            className="expert-modal"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button className="icon-button modal-close" type="button" onClick={() => setSelectedExpert(null)} aria-label="关闭专家简介">
              <X size={18} />
            </button>
            <img src={selectedExpert.image} alt={selectedExpert.name} />
            <div>
              <span className="eyebrow">{selectedExpert.title}</span>
              <h2>{selectedExpert.name}</h2>
              <p className="expert-org">{selectedExpert.org}</p>
              <p>{selectedExpert.intro}</p>
            </div>
          </motion.article>
        </div>
      ) : null}
    </>
  );
}

function PilotPage({
  demoState,
  onDemoStateChange
}: {
  demoState: DemoState;
  onDemoStateChange: (update: DemoStateUpdate) => void;
}) {
  const selectedTarget = demoState.pilotTarget;
  const selectedMode = demoState.pilotMode;
  const selectedPilotCases = cases.filter((item) => demoState.selectedPilotCaseIds.includes(item.id));
  const checkedMaterials = materialItems.filter((item) => demoState.materialChecklist[item]).length;
  const missingMaterials = materialItems.filter((item) => !demoState.materialChecklist[item]);
  const submitted = Boolean(demoState.pilotSubmittedAt);
  const readinessScore = Math.min(100, Math.round((selectedPilotCases.length ? 28 : 0) + (checkedMaterials / materialItems.length) * 52 + (submitted ? 20 : 0)));
  const activeConfigStep = submitted ? 4 : checkedMaterials === materialItems.length ? 3 : selectedPilotCases.length ? 2 : 1;
  const highPriorityPilotCases = selectedPilotCases.filter((item) => priorityForCase(item).label === "P1").length;
  const acceptanceItems = pilotAcceptanceItemsFor(demoState);
  const acceptedItems = acceptanceItems.filter((item) => item.done).length;
  const acceptanceScore = Math.round((acceptedItems / acceptanceItems.length) * 100);
  const deliveryStatus = submitted
    ? { label: "已提交", tone: "ready", detail: "交付沟通路径已生成，可回到影像或报告中心演示首例闭环。" }
    : missingMaterials.length
      ? { label: "待补齐", tone: "warning", detail: `仍需确认 ${missingMaterials.join("、")}。` }
      : { label: "可提交", tone: "ready", detail: "材料、病例包和部署路径已就绪，可生成试点沟通路径。" };

  const updatePilot = (patch: Partial<DemoState>) => {
    onDemoStateChange((state) => ({ ...state, ...patch }));
  };

  const toggleMaterial = (item: string) => {
    onDemoStateChange((state) => ({
      ...state,
      lastAction: `${item}${state.materialChecklist[item] ? "已取消确认" : "已确认"}。`,
      materialChecklist: { ...state.materialChecklist, [item]: !state.materialChecklist[item] }
    }));
  };

  const togglePilotCase = (caseId: string) => {
    onDemoStateChange((state) => {
      const selected = state.selectedPilotCaseIds.includes(caseId);
      const nextCaseIds = selected ? state.selectedPilotCaseIds.filter((id) => id !== caseId) : [...state.selectedPilotCaseIds, caseId];
      return {
        ...state,
        activeCaseId: caseId,
        lastAction: selected ? `试点病例包已移除 ${caseId}。` : `试点病例包已加入 ${caseId}。`,
        selectedPilotCaseIds: nextCaseIds.length ? nextCaseIds : [caseId]
      };
    });
  };

  const toggleAcceptanceCheck = (itemId: string, label: string) => {
    onDemoStateChange((state) => {
      const checked = Boolean(state.pilotAcceptanceChecks[itemId]);
      return {
        ...state,
        lastAction: `${label}${checked ? "已撤销验收" : "已标记验收"}。`,
        pilotAcceptanceChecks: { ...state.pilotAcceptanceChecks, [itemId]: !checked }
      };
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submittedAt = new Date().toLocaleString("zh-CN", { hour12: false });
    const trailItem = `${submittedAt} · ${selectedTarget} · ${demoState.deploymentPath} · ${selectedPilotCases.length} 例 · 材料 ${checkedMaterials}/${materialItems.length}`;
    onDemoStateChange((state) => ({
      ...state,
      lastAction: missingMaterials.length ? "试点配置已保存，等待补齐材料清单。" : "试点配置已提交，进入沟通准备状态。",
      pilotSubmittedAt: submittedAt,
      pilotSubmissionTrail: [trailItem, ...state.pilotSubmissionTrail].slice(0, 4)
    }));
  };

  const resetPilotSandbox = () => {
    const defaults = createDefaultDemoState();
    onDemoStateChange((state) => ({
      ...state,
      activeCaseId: defaults.activeCaseId,
      selectedPilotCaseIds: defaults.selectedPilotCaseIds,
      pilotTarget: defaults.pilotTarget,
      pilotMode: defaults.pilotMode,
      deploymentPath: defaults.deploymentPath,
      casePackage: defaults.casePackage,
      materialChecklist: defaults.materialChecklist,
      pilotSubmittedAt: defaults.pilotSubmittedAt,
      pilotOrganization: defaults.pilotOrganization,
      pilotContact: defaults.pilotContact,
      pilotPhone: defaults.pilotPhone,
      pilotDepartment: defaults.pilotDepartment,
      pilotHospitalLevel: defaults.pilotHospitalLevel,
      pilotMonthlyVolume: defaults.pilotMonthlyVolume,
      pilotNeed: defaults.pilotNeed,
      pilotRemark: defaults.pilotRemark,
      pilotSubmissionTrail: defaults.pilotSubmissionTrail,
      pilotAcceptanceChecks: defaults.pilotAcceptanceChecks,
      lastAction: "已恢复默认试点沙盒配置。"
    }));
  };

  const withdrawSubmission = () => {
    onDemoStateChange((state) => ({
      ...state,
      pilotSubmittedAt: "",
      lastAction: "已撤回本次试点提交，配置仍保留在沙盒中。"
    }));
  };

  return (
    <>
      <section className="pilot-hero">
        <div className="pilot-hero-copy">
          <span className="eyebrow">Pilot Program</span>
          <h1>7 天跑通首例 AI 影像试点</h1>
          <p>
            面向医院、影像科、肝胆外科、远程医疗平台和医学院校，把病例选择、影像分割、三维重建、风险评估和辅助报告串成一条可演示、可复核的试点链路。
          </p>
          <div className="hero-actions">
            <a className="primary-button" href={caseHref("/imaging", featuredCase)}>
              启动病例闭环
              <ArrowRight size={18} />
            </a>
            <a className="secondary-button" href={caseHref("/reports", featuredCase, "generated=1")}>
              查看报告样例
              <FileText size={17} />
            </a>
          </div>
          <div className="pilot-kpi-row">
            {pilotHighlights.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong>{item.label === "试点周期" ? `${readinessScore}%` : item.value}</strong>
                <small>{item.label === "试点周期" ? "当前试点准备度" : item.detail}</small>
              </article>
            ))}
          </div>
        </div>

        <motion.div
          className="pilot-hero-visual"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55 }}
        >
          <div className="pilot-showcase-stage">
            <MedicalScene compact liverOpacity={0.52} />
            <div className="pilot-scan-overlay">
              <span>Active Case</span>
              <strong>{featuredCase.id}</strong>
              <small>{featuredCase.lesion} / {featuredCase.risk}</small>
            </div>
          </div>
          <div className="pilot-loop-panel">
            {["对象", "部署", "病例包", "材料"].map((item, index) => (
              <div className={index < activeConfigStep ? "active" : ""} key={item}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      <ExperienceFlow activePath="/pilot" />

      <section className="pilot-journey" aria-label="试点闭环路径">
        {pilotJourney.map(({ icon: Icon, ...item }) => (
          <article key={item.step}>
            <div>
              <span>{item.step}</span>
              <Icon size={22} />
            </div>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="pilot-layout">
        <aside className="pilot-aside">
          <div className="pilot-aside-header">
            <span className="eyebrow">试点配置</span>
            <h2>{selectedTarget} · {selectedMode}</h2>
            <p>当前组合会作为提交后的沟通重点，用于匹配演示病例、部署方式和报告模板。</p>
          </div>

          <a className="pilot-case-link" href={caseHref("/imaging", featuredCase)}>
            <img src={featuredCase.snapshot} alt={`${featuredCase.id} 试点演示病例`} />
            <div>
              <span>演示病例</span>
              <strong>{featuredCase.id}</strong>
              <small>{featuredCase.patient} · {featuredCase.type} · {featuredCase.risk}</small>
            </div>
            <ArrowRight size={18} />
          </a>

          <div>
            <span className="eyebrow">合作对象</span>
            <div className="chip-cloud">
              {pilotTargets.map((target) => (
                <button
                  className={selectedTarget === target ? "active" : ""}
                  key={target}
                  type="button"
                  onClick={() => updatePilot({ pilotTarget: target, lastAction: `试点对象已切换为${target}。` })}
                >
                  {target}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="eyebrow">合作方式</span>
            <div className="mode-list">
              {cooperationModes.map((mode) => (
                <button
                  className={selectedMode === mode ? "active" : ""}
                  key={mode}
                  type="button"
                  onClick={() => updatePilot({ lastAction: `合作方式已切换为${mode}。`, pilotMode: mode })}
                >
                  <Handshake size={17} />
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="pilot-assurance">
            <span className="eyebrow">数据与权限</span>
            {pilotAssurances.map((item) => (
              <p key={item}>
                <CheckCircle2 size={16} />
                {item}
              </p>
            ))}
          </div>

          <div className="pilot-delivery-panel">
            <div className="pilot-readiness-meter" style={{ "--readiness": `${readinessScore}%` } as CSSProperties}>
              <strong>{readinessScore}%</strong>
              <span>准备度</span>
            </div>
            <div>
              <span className="eyebrow">Delivery Status</span>
              <strong>{deliveryStatus.label}</strong>
              <p>{deliveryStatus.detail}</p>
            </div>
          </div>
        </aside>

        <form className="pilot-form" onSubmit={submit}>
          <div className="pilot-form-header">
            <div>
              <span className="eyebrow">Start Pilot</span>
              <h2>提交试点需求</h2>
              <p>我们会基于当前选择准备试点沟通：{selectedTarget} / {selectedMode}。</p>
            </div>
            <div className="pilot-header-actions">
              {submitted ? (
                <button className="secondary-button icon-text" type="button" onClick={withdrawSubmission}>
                  撤回提交
                </button>
              ) : null}
              <button className="secondary-button icon-text" type="button" onClick={resetPilotSandbox}>
                <RefreshCw size={16} />
                恢复默认
              </button>
              <span className="pilot-form-status">{submitted ? "已进入准备" : "1 个工作日响应"}</span>
            </div>
          </div>

          <div className="pilot-configurator">
            <div className="pilot-stepper">
              {["试点对象", "部署路径", "病例包", "材料确认"].map((step, index) => (
                <div className={index < activeConfigStep ? "active" : ""} key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>

            <div className="pilot-option-grid">
              <div>
                <span className="eyebrow">Deployment</span>
                <strong>部署路径</strong>
                {deploymentOptions.map((option) => (
                  <button
                    className={demoState.deploymentPath === option.label ? "active" : ""}
                    key={option.label}
                    type="button"
                    onClick={() => updatePilot({ deploymentPath: option.label, lastAction: `部署路径已选择${option.label}。` })}
                  >
                    <span>{option.label}</span>
                    <small>{option.detail}</small>
                  </button>
                ))}
              </div>
              <div>
                <span className="eyebrow">Case Package</span>
                <strong>病例包策略</strong>
                {casePackageOptions.map((option) => (
                  <button
                    className={demoState.casePackage === option.label ? "active" : ""}
                    key={option.label}
                    type="button"
                    onClick={() => updatePilot({ casePackage: option.label, lastAction: `病例包策略已切换为${option.label}。` })}
                  >
                    <span>{option.label}</span>
                    <small>{option.detail}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="pilot-case-package">
              <div>
                <span className="eyebrow">Selected Cases</span>
                <strong>试点病例包 · {selectedPilotCases.length} 例</strong>
              </div>
              <div>
                {cases.map((item) => {
                  const selected = demoState.selectedPilotCaseIds.includes(item.id);
                  return (
                    <button className={selected ? "active" : ""} key={item.id} type="button" onClick={() => togglePilotCase(item.id)}>
                      <span>{item.id}</span>
                      <strong>{item.lesion}</strong>
                      <small>{item.type} · {item.risk}</small>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="material-checklist">
              <div>
                <span className="eyebrow">Materials</span>
                <strong>材料清单 · {checkedMaterials}/{materialItems.length}</strong>
              </div>
              <div>
                {materialItems.map((item) => (
                  <button
                    aria-pressed={Boolean(demoState.materialChecklist[item])}
                    className={demoState.materialChecklist[item] ? "checked" : ""}
                    key={item}
                    type="button"
                    onClick={() => toggleMaterial(item)}
                  >
                    <CheckCircle2 size={17} />
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className={`pilot-alert ${deliveryStatus.tone}`}>
              {missingMaterials.length ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <div>
                <strong>{deliveryStatus.label === "待补齐" ? "材料缺口提示" : "交付配置就绪"}</strong>
                <span>{deliveryStatus.detail}</span>
              </div>
            </div>

            <div className="pilot-delivery-grid">
              {[
                { label: "部署路径", value: demoState.deploymentPath, detail: demoState.casePackage },
                { label: "病例优先级", value: `${highPriorityPilotCases} 例 P1`, detail: `${selectedPilotCases.length} 例进入首批包` },
                { label: "报告输出", value: demoState.reportTemplate, detail: `${demoState.exportFormat} · ${demoState.reviewTone}` },
                { label: "最近动作", value: demoState.lastAction ? "已同步" : "待操作", detail: demoState.lastAction || "操作后会同步到沙盒状态" }
              ].map((item) => (
                <article key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <small>{item.detail}</small>
                </article>
              ))}
            </div>

            <div className="pilot-acceptance-board">
              <div className="pilot-acceptance-head">
                <div>
                  <span className="eyebrow">Acceptance Gate</span>
                  <strong>试点交付验收 · {acceptedItems}/{acceptanceItems.length}</strong>
                  <small>自动证据来自病例、材料、报告和提交记录；人工项用于标记联调与复盘。</small>
                </div>
                <div className="acceptance-score" style={{ "--acceptance": `${acceptanceScore}%` } as CSSProperties}>
                  <span>{acceptanceScore}%</span>
                  <small>验收进度</small>
                </div>
              </div>
              <div className="pilot-acceptance-list">
                {acceptanceItems.map((item) => (
                  <article className={item.done ? "done" : ""} key={item.id}>
                    <div>
                      {item.done ? <CheckCircle2 size={18} /> : <Clock3 size={18} />}
                      <div>
                        <strong>{item.label}</strong>
                        <small>{item.detail}</small>
                      </div>
                    </div>
                    {item.mode === "manual" ? (
                      <button
                        aria-pressed={item.done}
                        className={item.done ? "checked" : ""}
                        type="button"
                        onClick={() => toggleAcceptanceCheck(item.id, item.label)}
                      >
                        {item.done ? "撤销" : "标记"}
                      </button>
                    ) : (
                      <span>{item.done ? "已达标" : "待证据"}</span>
                    )}
                  </article>
                ))}
              </div>
            </div>
          </div>

          <div className="form-grid">
            <label>
              单位名称
              <input required value={demoState.pilotOrganization} onChange={(event) => updatePilot({ pilotOrganization: event.target.value })} placeholder="例如：云南省某某医院" />
            </label>
            <label>
              联系人
              <input required value={demoState.pilotContact} onChange={(event) => updatePilot({ pilotContact: event.target.value })} placeholder="请输入联系人姓名" />
            </label>
            <label>
              联系方式
              <input required value={demoState.pilotPhone} onChange={(event) => updatePilot({ pilotPhone: event.target.value })} placeholder="手机号 / 邮箱" />
            </label>
            <label>
              所属科室
              <input value={demoState.pilotDepartment} onChange={(event) => updatePilot({ pilotDepartment: event.target.value })} placeholder="影像科 / 肝胆外科" />
            </label>
            <label>
              医院级别
              <select value={demoState.pilotHospitalLevel} onChange={(event) => updatePilot({ pilotHospitalLevel: event.target.value })}>
                <option>三甲医院</option>
                <option>三级医院</option>
                <option>基层医院</option>
                <option>医学院校</option>
                <option>远程医疗平台</option>
              </select>
            </label>
            <label>
              预计病例量
              <input value={demoState.pilotMonthlyVolume} onChange={(event) => updatePilot({ pilotMonthlyVolume: event.target.value })} placeholder="例如：每月 80 例" />
            </label>
          </div>
          <label>
            合作需求
            <textarea value={demoState.pilotNeed} onChange={(event) => updatePilot({ pilotNeed: event.target.value })} placeholder="请描述希望验证或接入的场景，例如术前规划、远程会诊、科研教学等。" />
          </label>
          <label>
            备注
            <textarea value={demoState.pilotRemark} onChange={(event) => updatePilot({ pilotRemark: event.target.value })} placeholder="其他补充信息" />
          </label>
          <button className="primary-button submit-button" type="submit">
            提交申请
            <Send size={18} />
          </button>

          <div className="pilot-submission-trail">
            <div>
              <span className="eyebrow">Submission Trail</span>
              <strong>提交记录</strong>
            </div>
            {demoState.pilotSubmissionTrail.length ? (
              demoState.pilotSubmissionTrail.map((item) => <span key={item}>{item}</span>)
            ) : (
              <span>尚未提交，提交后会保留最近 4 条试点沟通记录。</span>
            )}
          </div>

          {submitted ? (
            <motion.div className="submit-success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <CheckCircle2 size={20} />
              <div>
                <strong>已生成试点沟通路径</strong>
                <span>
                  {demoState.pilotSubmittedAt} · {demoState.deploymentPath} · {selectedPilotCases.length} 例病例 · 材料 {checkedMaterials}/{materialItems.length}
                </span>
              </div>
              <a href={caseHref("/imaging", featuredCase)}>影像分析</a>
              <a href={caseHref("/reports", featuredCase, "generated=1")}>辅助报告</a>
            </motion.div>
          ) : null}
        </form>
      </section>
    </>
  );
}

function NotFoundPage() {
  return (
    <section className="not-found">
      <PanelTop size={42} />
      <h1>页面不存在</h1>
      <a className="primary-button" href="#/">
        返回首页
      </a>
    </section>
  );
}

function App() {
  const route = useHashRoute();
  const [demoState, onDemoStateChange, storageStatus, resetDemoState] = usePersistentDemoState();
  const currentPath = route.path;
  const selectedCase = useMemo(() => {
    const caseId = route.params.get("case") || demoState.activeCaseId;
    return cases.find((item) => item.id === caseId) || featuredCase;
  }, [demoState.activeCaseId, route]);
  const reportGenerated = route.params.get("generated") === "1";
  const showDemoStatusHub = currentPath !== "/" && navItems.some((item) => item.path === currentPath);

  useEffect(() => {
    if (selectedCase.id === demoState.activeCaseId) return;
    onDemoStateChange((state) => ({ ...state, activeCaseId: selectedCase.id }));
  }, [demoState.activeCaseId, onDemoStateChange, selectedCase.id]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath, selectedCase.id]);

  const page = useMemo(() => {
    switch (currentPath) {
      case "/":
        return <HomePage />;
      case "/dashboard":
        return <DashboardPage demoState={demoState} onDemoStateChange={onDemoStateChange} />;
      case "/imaging":
        return <ImagingPage demoState={demoState} onDemoStateChange={onDemoStateChange} selectedCase={selectedCase} />;
      case "/reports":
        return <ReportsPage demoState={demoState} selectedCase={selectedCase} generated={reportGenerated} onDemoStateChange={onDemoStateChange} />;
      case "/partners":
        return <PartnersPage />;
      case "/pilot":
        return <PilotPage demoState={demoState} onDemoStateChange={onDemoStateChange} />;
      default:
        return <NotFoundPage />;
    }
  }, [currentPath, demoState, onDemoStateChange, reportGenerated, selectedCase]);

  return (
    <div className="app-shell">
      <TopNav currentPath={currentPath} />
      <main>
        <DemoErrorBoundary resetKey={`${currentPath}:${selectedCase.id}`}>
          {showDemoStatusHub ? (
            <DemoStatusHub
              currentPath={currentPath}
              demoState={demoState}
              onDemoStateChange={onDemoStateChange}
              onDemoStateReset={resetDemoState}
              selectedCase={selectedCase}
              storageStatus={storageStatus}
            />
          ) : null}
          {page}
        </DemoErrorBoundary>
      </main>
      <footer className="site-footer">
        <div>
          <strong>肝视界</strong>
          <span>基于多模态影像的肝脏肿瘤分割与三维可视化辅助评估系统</span>
        </div>
        <div>
          <Database size={16} />
          Mock data only
        </div>
        <div>
          <Building2 size={16} />
          Demo platform
        </div>
        <div>
          <Stethoscope size={16} />
          Clinical workflow preview
        </div>
      </footer>
    </div>
  );
}

export default App;
