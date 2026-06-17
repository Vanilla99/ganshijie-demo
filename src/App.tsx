import { motion } from "framer-motion";
import {
  Activity,
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
  RefreshCw,
  Rotate3D,
  Send,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UploadCloud,
  X
} from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
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

function DashboardPage() {
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

      <section className="stats-grid">
        {metrics.map((metric) => (
          <StatCard {...metric} key={metric.label} />
        ))}
      </section>

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

      <CaseTable />
    </>
  );
}

function CaseTable() {
  return (
    <section className="table-section">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Priority Cases</span>
          <h3>重点病例列表 · 点击进入闭环演示</h3>
        </div>
        <a className="secondary-button" href={caseHref("/reports", featuredCase)}>
          查看报告中心
        </a>
      </div>
      <div className="data-table">
        <div className="table-row table-head">
          <span>病例编号</span>
          <span>患者</span>
          <span>影像类型</span>
          <span>病灶摘要</span>
          <span>风险</span>
          <span>状态</span>
          <span>操作</span>
        </div>
        {cases.map((item) => (
          <div className="table-row" key={item.id}>
            <span>{item.id}</span>
            <span>{item.patient}</span>
            <span>{item.type}</span>
            <span>{item.lesion}</span>
            <span>
              <RiskBadge risk={item.risk} />
            </span>
            <span>{item.status}</span>
            <span className="row-actions">
              <a href={caseHref("/imaging", item)}>分析</a>
              <a href={caseHref("/reports", item)}>报告</a>
            </span>
          </div>
        ))}
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

function ImagingPage({ selectedCase }: { selectedCase: ClinicalCase }) {
  const [slice, setSlice] = useState(72);
  const [overlays, setOverlays] = useState({ liver: true, tumor: true, vessel: true });
  const [modelView, setModelView] = useState<"all" | "liver" | "tumor" | "vessel">("all");
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [fileName, setFileName] = useState(selectedCase.fileName);
  const [liverOpacity, setLiverOpacity] = useState(58);
  const [exportNotice, setExportNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSlice(Math.min(72, selectedCase.sliceCount));
    setFileName(selectedCase.fileName);
    setActiveStep(0);
    setIsRunning(false);
    setExportNotice("");
  }, [selectedCase]);

  useEffect(() => {
    if (!isRunning) return;
    const timer = window.setInterval(() => {
      setActiveStep((step) => {
        if (step >= 7) {
          setIsRunning(false);
          setExportNotice("AI 分析完成，已生成结构化报告草稿。");
          window.clearInterval(timer);
          return 7;
        }
        return step + 1;
      });
    }, 850);

    return () => window.clearInterval(timer);
  }, [isRunning]);

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
  };

  const processingComplete = activeStep === 7;

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
            <a className={`secondary-button ${processingComplete ? "" : "disabled-link"}`} href={caseHref("/reports", selectedCase, "generated=1")}>
              生成报告
              <FileText size={17} />
            </a>
          </div>
        }
      />

      <section className="imaging-grid">
        <CaseSidePanel
          selectedCase={selectedCase}
          fileName={fileName}
          onSelectFile={() => fileInput.current?.click()}
          onClear={() => {
            setFileName("未选择文件");
            setActiveStep(0);
            setIsRunning(false);
            setExportNotice("");
          }}
          onStart={startProcessing}
        />
        <input
          ref={fileInput}
          type="file"
          accept=".zip,.dcm"
          hidden
          onChange={(event) => setFileName(event.target.files?.[0]?.name || fileName)}
        />

        <ProcessTimeline
          activeStep={activeStep}
          isRunning={isRunning}
          onStart={startProcessing}
          onReset={() => {
            setActiveStep(0);
            setIsRunning(false);
            setExportNotice("");
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
                onClick={() => setModelView(value as typeof modelView)}
              >
                {label}
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
            <button className="secondary-button icon-text" type="button" onClick={() => setExportNotice("已模拟导出当前三维视角截图。")}>
              <Download size={16} />
              截图导出
            </button>
            <a className="primary-button icon-text" href={caseHref("/reports", selectedCase, "generated=1")}>
              <FileText size={16} />
              生成报告
            </a>
          </div>
          <div className="model-stage">
            <MedicalScene {...modelVisibility} liverOpacity={liverOpacity / 100} />
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

function ReportsPage({ selectedCase, generated }: { selectedCase: ClinicalCase; generated: boolean }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [exportNotice, setExportNotice] = useState(generated ? "已从影像中心生成该病例的辅助报告草稿。" : "");

  useEffect(() => {
    setExportNotice(generated ? "已从影像中心生成该病例的辅助报告草稿。" : "");
  }, [generated, selectedCase]);

  const regenerate = () => {
    setRegenerating(true);
    setExportNotice("");
    window.setTimeout(() => {
      setRegenerating(false);
      setExportNotice(`${selectedCase.reportId} 已重新生成。`);
    }, 1100);
  };

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

      <section className="table-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Reports</span>
            <h3>报告列表</h3>
          </div>
          <button className="secondary-button icon-text" type="button" onClick={regenerate}>
            <RefreshCw className={regenerating ? "spin" : ""} size={16} />
            {regenerating ? "重新生成中" : "重新生成"}
          </button>
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
          {reportList.map((report) => (
            <div className="table-row" key={report.id}>
              <span>{report.id}</span>
              <span>{report.name}</span>
              <span>{report.patient}</span>
              <span>{report.generatedAt}</span>
              <span>
                <RiskBadge risk={report.risk} />
              </span>
              <span>{report.status}</span>
              <span className="row-actions">
                <a href={caseHref("/reports", cases.find((item) => item.id === report.caseId) || selectedCase)}>
                  预览
                </a>
                <button type="button" onClick={() => setExportNotice(`${report.id} 已模拟下载 PDF。`)}>
                  <Download size={14} />
                </button>
                <button type="button" onClick={() => setExportNotice(`${report.id} 已模拟导出图片。`)}>
                  <FileDown size={14} />
                </button>
              </span>
            </div>
          ))}
        </div>
      </section>

      {previewOpen ? (
        <ReportPreview
          selectedCase={selectedCase}
          onExport={(message) => setExportNotice(message)}
          onClose={() => setPreviewOpen(false)}
        />
      ) : null}
    </>
  );
}

function ReportPreview({
  selectedCase,
  onExport,
  onClose
}: {
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
        <div className="preview-body">
          <img src={selectedCase.snapshot} alt={`${selectedCase.id} 模型报告插图`} />
          <div>
            <h3>AI 辅助结论</h3>
            <p>{selectedCase.aiSummary}</p>
            <div className="preview-actions">
              <button className="primary-button" type="button" onClick={() => onExport(`${selectedCase.reportId} 已模拟下载 PDF。`)}>
                下载 PDF
              </button>
              <button className="secondary-button" type="button" onClick={() => onExport(`${selectedCase.reportId} 已模拟导出图片。`)}>
                导出图片
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

function PilotPage() {
  const [submitted, setSubmitted] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <PageHeader
        eyebrow="Pilot Program"
        title="合作试点申请"
        body="面向医院、影像科、肝胆外科、远程医疗平台和医学院校，支持医院试点、数据接入、科研教学和定制部署。"
      />

      <section className="pilot-layout">
        <aside className="pilot-aside">
          <div>
            <span className="eyebrow">合作对象</span>
            <div className="chip-cloud">
              {pilotTargets.map((target) => (
                <span key={target}>{target}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="eyebrow">合作方式</span>
            <div className="mode-list">
              {cooperationModes.map((mode) => (
                <p key={mode}>
                  <Handshake size={17} />
                  {mode}
                </p>
              ))}
            </div>
          </div>
        </aside>

        <form className="pilot-form" onSubmit={submit}>
          <div className="form-grid">
            <label>
              单位名称
              <input required placeholder="例如：云南省某某医院" />
            </label>
            <label>
              联系人
              <input required placeholder="请输入联系人姓名" />
            </label>
            <label>
              联系方式
              <input required placeholder="手机号 / 邮箱" />
            </label>
            <label>
              所属科室
              <input placeholder="影像科 / 肝胆外科" />
            </label>
            <label>
              医院级别
              <select defaultValue="三甲医院">
                <option>三甲医院</option>
                <option>三级医院</option>
                <option>基层医院</option>
                <option>医学院校</option>
                <option>远程医疗平台</option>
              </select>
            </label>
            <label>
              预计病例量
              <input placeholder="例如：每月 80 例" />
            </label>
          </div>
          <label>
            合作需求
            <textarea placeholder="请描述希望验证或接入的场景，例如术前规划、远程会诊、科研教学等。" />
          </label>
          <label>
            备注
            <textarea placeholder="其他补充信息" />
          </label>
          <button className="primary-button submit-button" type="submit">
            提交申请
            <Send size={18} />
          </button>

          {submitted ? (
            <motion.div className="submit-success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <CheckCircle2 size={20} />
              已收到您的试点申请，项目团队将在 1 个工作日内联系您。
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
  const currentPath = route.path;
  const selectedCase = useMemo(() => {
    const caseId = route.params.get("case");
    return cases.find((item) => item.id === caseId) || featuredCase;
  }, [route]);
  const reportGenerated = route.params.get("generated") === "1";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPath]);

  const page = useMemo(() => {
    switch (currentPath) {
      case "/":
        return <HomePage />;
      case "/dashboard":
        return <DashboardPage />;
      case "/imaging":
        return <ImagingPage selectedCase={selectedCase} />;
      case "/reports":
        return <ReportsPage selectedCase={selectedCase} generated={reportGenerated} />;
      case "/partners":
        return <PartnersPage />;
      case "/pilot":
        return <PilotPage />;
      default:
        return <NotFoundPage />;
    }
  }, [currentPath]);

  return (
    <div className="app-shell">
      <TopNav currentPath={currentPath} />
      <main>{page}</main>
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
