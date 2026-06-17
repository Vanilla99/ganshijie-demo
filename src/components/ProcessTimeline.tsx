import { Check, Loader2, Play, RotateCcw, UploadCloud } from "lucide-react";
import { processSteps } from "../data";

type ProcessTimelineProps = {
  activeStep: number;
  isRunning: boolean;
  onStart: () => void;
  onReset: () => void;
};

export default function ProcessTimeline({ activeStep, isRunning, onStart, onReset }: ProcessTimelineProps) {
  const progress = Math.min(100, Math.round((activeStep / (processSteps.length - 1)) * 100));

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
    </div>
  );
}
