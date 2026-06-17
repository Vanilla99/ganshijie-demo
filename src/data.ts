export const asset = (file: string) => `/assets/docx/${file}`;

export const navItems = [
  { path: "/", label: "首页" },
  { path: "/dashboard", label: "数据驾驶舱" },
  { path: "/imaging", label: "影像中心" },
  { path: "/reports", label: "辅助报告" },
  { path: "/partners", label: "合作支持" },
  { path: "/pilot", label: "试点申请" }
] as const;

export const metrics = [
  { label: "累计病例数", value: "2,486", delta: "+18.6%", tone: "blue" },
  { label: "已完成影像分析", value: "2,214", delta: "+23.1%", tone: "cyan" },
  { label: "已生成报告", value: "1,932", delta: "+16.8%", tone: "indigo" },
  { label: "平均处理时间", value: "04:36", delta: "-31.4%", tone: "green" },
  { label: "肝脏分割准确率", value: "96.8%", delta: "+2.1%", tone: "violet" },
  { label: "肿瘤分割准确率", value: "93.4%", delta: "+3.7%", tone: "amber" }
];

export const lesionTypeData = [
  { name: "肝细胞癌", value: 42 },
  { name: "胆管细胞癌", value: 16 },
  { name: "转移瘤", value: 22 },
  { name: "血管瘤", value: 12 },
  { name: "其他", value: 8 }
];

export const monthlyCases = [
  { month: "1月", cases: 128, reports: 96 },
  { month: "2月", cases: 142, reports: 108 },
  { month: "3月", cases: 176, reports: 144 },
  { month: "4月", cases: 213, reports: 189 },
  { month: "5月", cases: 254, reports: 221 },
  { month: "6月", cases: 286, reports: 247 },
  { month: "7月", cases: 318, reports: 284 },
  { month: "8月", cases: 352, reports: 319 }
];

export const riskData = [
  { level: "低风险", count: 36 },
  { level: "中风险", count: 54 },
  { level: "高风险", count: 32 },
  { level: "需复核", count: 14 }
];

export const followupData = [
  { range: "0-3月", value: 18 },
  { range: "3-6月", value: 36 },
  { range: "6-12月", value: 61 },
  { range: "1-2年", value: 44 },
  { range: "2年以上", value: 28 }
];

export type ClinicalCase = {
  id: string;
  patient: string;
  age: number;
  sex: string;
  hospital: string;
  department: string;
  accession: string;
  type: string;
  lesion: string;
  risk: string;
  time: string;
  status: string;
  fileName: string;
  fileSize: string;
  sliceCount: number;
  modelVersion: string;
  processingTime: string;
  reportId: string;
  reportName: string;
  generatedAt: string;
  reportStatus: string;
  snapshot: string;
  metrics: Array<{ label: string; value: string }>;
  measurements: Array<{ label: string; value: string; detail: string }>;
  aiSummary: string;
  summaryPoints: string[];
};

export const cases: ClinicalCase[] = [
  {
    id: "GSJ-CT-24081",
    patient: "李**",
    age: 56,
    sex: "男",
    hospital: "云南省第一人民医院",
    department: "肝胆胰外科",
    accession: "CT20260615-081",
    type: "增强 CT",
    lesion: "肝右叶占位",
    risk: "高风险",
    time: "2026-06-15 10:26",
    status: "已生成报告",
    fileName: "YHH-20260615-CT-DICOM.zip",
    fileSize: "642.8 MB",
    sliceCount: 128,
    modelVersion: "GanSight-Seg v2.4",
    processingTime: "04:36",
    reportId: "RPT-20260615-081",
    reportName: "肝脏肿瘤智能分析报告",
    generatedAt: "2026-06-15 10:32",
    reportStatus: "已确认",
    snapshot: asset("image5.jpeg"),
    metrics: [
      { label: "肝脏体积", value: "1,286 ml" },
      { label: "肿瘤数量", value: "3 个" },
      { label: "肿瘤最大直径", value: "38.2 mm" },
      { label: "肿瘤体积", value: "24.7 ml" },
      { label: "病灶位置", value: "S6 / S7" },
      { label: "血管邻近情况", value: "距门静脉右支 4.1 mm" },
      { label: "分割置信度", value: "94.6%" }
    ],
    measurements: [
      { label: "最大径", value: "38.2 mm", detail: "横断位第 072 层" },
      { label: "门静脉距离", value: "4.1 mm", detail: "右支邻近区" },
      { label: "肝剩余体积", value: "72.4%", detail: "模拟术前规划" }
    ],
    aiSummary:
      "重点关注区域位于右后叶，邻近门静脉右支，建议结合增强期表现进行复核。",
    summaryPoints: [
      "分割结果轮廓连续，肝包膜边缘清晰。",
      "病灶位于 S6 / S7，最大直径约 38.2 mm。",
      "血管邻近距离较短，术前规划需重点评估。",
      "建议输出三维模型截图并进入多学科会诊流程。"
    ]
  },
  {
    id: "GSJ-MR-24079",
    patient: "张**",
    age: 49,
    sex: "女",
    hospital: "昆明医科大学第二附属医院",
    department: "影像科",
    accession: "MR20260615-079",
    type: "MRI",
    lesion: "多发小结节",
    risk: "中风险",
    time: "2026-06-15 09:18",
    status: "待医生复核",
    fileName: "KMU-20260615-MR-DICOM.zip",
    fileSize: "488.3 MB",
    sliceCount: 96,
    modelVersion: "GanSight-Seg v2.4",
    processingTime: "05:12",
    reportId: "RPT-20260615-079",
    reportName: "多模态影像辅助评估报告",
    generatedAt: "2026-06-15 09:23",
    reportStatus: "待复核",
    snapshot: asset("image3.jpeg"),
    metrics: [
      { label: "肝脏体积", value: "1,104 ml" },
      { label: "肿瘤数量", value: "5 个" },
      { label: "肿瘤最大直径", value: "18.6 mm" },
      { label: "肿瘤体积", value: "9.8 ml" },
      { label: "病灶位置", value: "S2 / S4 / S8" },
      { label: "血管邻近情况", value: "未见明显侵犯" },
      { label: "分割置信度", value: "91.8%" }
    ],
    measurements: [
      { label: "最大径", value: "18.6 mm", detail: "增强期第 048 层" },
      { label: "多发灶范围", value: "3 段", detail: "S2 / S4 / S8" },
      { label: "复核优先级", value: "P2", detail: "建议医生确认边界" }
    ],
    aiSummary:
      "多发小结节呈散在分布，当前模型提示中风险，建议结合 MRI 动态增强序列进行医生复核。",
    summaryPoints: [
      "多发病灶体积较小，局部边界需结合原始序列确认。",
      "未见明显血管侵犯征象。",
      "建议纳入随访队列并保留三维定位截图。",
      "报告状态保持待复核，适合用于会诊演示。"
    ]
  },
  {
    id: "GSJ-CT-24072",
    patient: "杨**",
    age: 62,
    sex: "男",
    hospital: "大理州人民医院",
    department: "影像科",
    accession: "CT20260614-072",
    type: "增强 CT",
    lesion: "肝左外叶病灶",
    risk: "低风险",
    time: "2026-06-14 17:42",
    status: "分析完成",
    fileName: "DLH-20260614-CT-DICOM.zip",
    fileSize: "573.1 MB",
    sliceCount: 112,
    modelVersion: "GanSight-Seg v2.3",
    processingTime: "04:02",
    reportId: "RPT-20260614-072",
    reportName: "术前规划三维重建报告",
    generatedAt: "2026-06-14 17:48",
    reportStatus: "已归档",
    snapshot: asset("image2.jpeg"),
    metrics: [
      { label: "肝脏体积", value: "1,342 ml" },
      { label: "肿瘤数量", value: "1 个" },
      { label: "肿瘤最大直径", value: "12.4 mm" },
      { label: "肿瘤体积", value: "3.1 ml" },
      { label: "病灶位置", value: "S3" },
      { label: "血管邻近情况", value: "距离主要血管 12.6 mm" },
      { label: "分割置信度", value: "95.1%" }
    ],
    measurements: [
      { label: "最大径", value: "12.4 mm", detail: "横断位第 061 层" },
      { label: "血管距离", value: "12.6 mm", detail: "低邻近风险" },
      { label: "复核优先级", value: "P3", detail: "常规归档" }
    ],
    aiSummary:
      "肝左外叶单发小病灶，距离主要血管较远，AI 提示低风险，可作为随访与教学复盘病例。",
    summaryPoints: [
      "单发小病灶边界清晰，模型置信度较高。",
      "未见重要血管邻近风险。",
      "建议保留三维定位结果用于科研教学。",
      "可进入归档报告流程。"
    ]
  },
  {
    id: "GSJ-CT-24066",
    patient: "王**",
    age: 58,
    sex: "女",
    hospital: "云南省第一人民医院",
    department: "肝胆胰外科",
    accession: "CT20260614-066",
    type: "DICOM",
    lesion: "血管邻近病灶",
    risk: "需复核",
    time: "2026-06-14 14:05",
    status: "模型重建中",
    fileName: "YHH-20260614-CT-DICOM.zip",
    fileSize: "618.4 MB",
    sliceCount: 120,
    modelVersion: "GanSight-Seg v2.4",
    processingTime: "进行中",
    reportId: "RPT-20260614-066",
    reportName: "血管邻近病灶复核报告",
    generatedAt: "待生成",
    reportStatus: "生成中",
    snapshot: asset("image4.jpeg"),
    metrics: [
      { label: "肝脏体积", value: "1,196 ml" },
      { label: "肿瘤数量", value: "2 个" },
      { label: "肿瘤最大直径", value: "26.5 mm" },
      { label: "肿瘤体积", value: "15.9 ml" },
      { label: "病灶位置", value: "S5 / S8" },
      { label: "血管邻近情况", value: "邻近肝静脉分支" },
      { label: "分割置信度", value: "89.7%" }
    ],
    measurements: [
      { label: "最大径", value: "26.5 mm", detail: "横断位第 084 层" },
      { label: "肝静脉距离", value: "3.8 mm", detail: "需重点复核" },
      { label: "复核优先级", value: "P1", detail: "建议 MDT 讨论" }
    ],
    aiSummary:
      "病灶与肝静脉分支距离较近，当前分割置信度低于平台均值，建议医生优先复核。",
    summaryPoints: [
      "血管邻近区域需重点观察。",
      "局部边界存在不确定性，建议结合原始 DICOM 复核。",
      "可生成复核报告并导出关键截图。",
      "适合作为术前规划讨论病例。"
    ]
  }
];

export const featuredCase = cases[0];

export const processSteps = [
  "DICOM 文件解析中",
  "CT 序列读取中",
  "图像预处理中",
  "肝脏分割中",
  "肿瘤分割中",
  "血管分割中",
  "三维模型生成中",
  "处理完成"
];

export const reportMetrics = featuredCase.metrics;

export const reportList = cases.map((item) => ({
  id: item.reportId,
  name: item.reportName,
  patient: item.patient,
  generatedAt: item.generatedAt,
  risk: item.risk,
  status: item.reportStatus,
  caseId: item.id
}));

export const hospitals = [
  {
    name: "云南省第一人民医院",
    focus: "真实病例验证、肝胆胰外科诊疗场景试点",
    image: asset("image6.jpeg")
  },
  {
    name: "大理州人民医院",
    focus: "基层医院影像分析流程优化与远程会诊支持",
    image: asset("image8.jpeg")
  },
  {
    name: "昆明医科大学第二附属医院",
    focus: "三维重建、科研教学与临床场景验证",
    image: asset("image7.jpeg")
  }
];

export const expertProfiles = [
  {
    name: "晋云",
    title: "主任医师 / 博士生导师",
    org: "云南省第一人民医院肝胆胰外科主任",
    image: asset("image14.jpeg"),
    intro:
      "提供临床需求、病例应用和医学可行性指导，擅长肝胆胰肿瘤微创手术及综合治疗。"
  },
  {
    name: "柯阳",
    title: "教授 / 博士研究生导师",
    org: "昆明医科大学第二附属医院肝胆胰外科",
    image: asset("image15.jpeg"),
    intro:
      "提供肝胆外科专业指导和临床场景验证支持，研究方向覆盖数字智能化外科与肿瘤诊疗。"
  },
  {
    name: "赵娜",
    title: "副教授 / 硕士生导师",
    org: "云南大学软件学院",
    image: asset("image16.jpeg"),
    intro:
      "负责项目技术路线、系统架构和软件平台研发指导，长期从事医疗等领域科研成果转化。"
  }
];

export const collaborationPhotos = [
  asset("image9.jpeg"),
  asset("image10.jpeg"),
  asset("image11.jpeg"),
  asset("image12.jpeg"),
  asset("image13.jpeg")
];

export const proofImages = [asset("image17.png"), asset("image18.png"), asset("image19.png")];

export const productShots = [
  asset("image1.jpeg"),
  asset("image2.jpeg"),
  asset("image3.jpeg"),
  asset("image4.jpeg"),
  asset("image5.jpeg")
];

export const pilotTargets = ["三甲医院", "基层医院", "影像科", "肝胆外科", "远程医疗平台", "医学院校"];

export const cooperationModes = ["医院试点", "数据接入", "远程会诊", "科研教学", "定制部署"];
