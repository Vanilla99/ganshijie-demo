import { Check, Loader2, Play, RotateCcw, UploadCloud } from "lucide-react";
import { processSteps } from "../data";
import type { ClinicalCase } from "../data";

type ProcessTimelineProps = {
  activeStep: number;
  isRunning: boolean;
  selectedCase: ClinicalCase;
  onStart: () => void;
  onReset: () => void;
};

export default function ProcessTimeline({ activeStep, isRunning, selectedCase, onStart, onReset }: ProcessTimelineProps) {
  const progress = Math.min(100, Math.round((activeStep / (processSteps.length - 1)) * 100));
  const complete = activeStep === processSteps.length - 1;
  const currentStep = processSteps[Math.min(activeStep, processSteps.length - 1)];
  const elapsed = complete ? selectedCase.processingTime : isRunning ? `0${Math.min(activeStep + 1, 4)}:${(activeStep * 7 + 18).toString().padStart(2, "0")}` : "待启动";

  return (
    <div className="process-panel">
      <div className="panel-heading compact-heading">
        <div>
          <span className="eyebrow">Pipeline</span>
          <h3>AI 处理流程</h3>
        </div>
        <div className="process-actions">
          <button className="secondary-button icon-text" type="button">
            <UploadCloud size={16} />
            DICOM.zip
          </button>
          <button className="primary-button icon-text" type="button" onClick={onStart} disabled={isRunning}>
            {isRunning ? <Loader2 className="spin" size={16} /> : <Play size={16} />}
            {isRunning ? "处理中" : "开始处理"}
          </button>
          <button className="icon-button" type="button" onClick={onReset} aria-label="重置处理流程">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div className="progress-track">
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="pipeline-status-grid">
        <article>
          <span>当前阶段</span>
          <strong>{complete ? "处理完成" : currentStep}</strong>
        </article>
        <article>
          <span>模型版本</span>
          <strong>{selectedCase.modelVersion}</strong>
        </article>
        <article>
          <span>处理耗时</span>
          <strong>{elapsed}</strong>
        </article>
        <article>
          <span>输出状态</span>
          <strong>{complete ? "报告草稿已生成" : isRunning ? "队列运行中" : "等待执行"}</strong>
        </article>
      </div>

      <div className="step-list">
        {processSteps.map((step, index) => {
          const done = index < activeStep || activeStep === processSteps.length - 1;
          const active = index === activeStep && activeStep !== processSteps.length - 1;

          return (
            <div className={`step-item ${done ? "done" : ""} ${active ? "active" : ""}`} key={step}>
              <span className="step-icon">
                {done ? <Check size={14} /> : active ? <Loader2 className="spin" size={14} /> : index + 1}
              </span>
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      <div className={`pipeline-next-step ${complete ? "complete" : ""}`}>
        <Check size={16} />
        <span>{complete ? "可进入报告中心复核 AI 结论和关键测量。" : "处理过程中保留每一阶段状态，便于医生复核与演示讲解。"}</span>
      </div>
    </div>
  );
}
