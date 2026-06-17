import { ChevronLeft, ChevronRight, ScanLine, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { asset } from "../data";

type CtSliceViewerProps = {
  slice: number;
  sliceCount?: number;
  onSliceChange: (value: number) => void;
  overlays: {
    liver: boolean;
    tumor: boolean;
    vessel: boolean;
  };
  onOverlayChange: (key: "liver" | "tumor" | "vessel") => void;
  measurements?: Array<{ label: string; value: string; detail: string }>;
};

export default function CtSliceViewer({
  slice,
  sliceCount = 128,
  onSliceChange,
  overlays,
  onOverlayChange,
  measurements = []
}: CtSliceViewerProps) {
  const [windowPreset, setWindowPreset] = useState("肝脏增强");
  const displaySlice = String(slice).padStart(3, "0");
  const thumbnailSlices = [0.28, 0.42, 0.56, 0.67, 0.82].map((ratio) => Math.max(1, Math.round(sliceCount * ratio)));
  const activeOverlayCount = Object.values(overlays).filter(Boolean).length;

  return (
    <div className="ct-viewer">
      <div className="ct-toolbar">
        <div>
          <span className="eyebrow">CT Slice</span>
          <strong>序列 A / {displaySlice}</strong>
        </div>
        <div className="slice-actions">
          <button className="icon-button" type="button" onClick={() => onSliceChange(Math.max(1, slice - 1))}>
            <ChevronLeft size={18} />
          </button>
          <button className="icon-button" type="button" onClick={() => onSliceChange(Math.min(sliceCount, slice + 1))}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="ct-workbench-strip">
        <div>
          <ScanLine size={17} />
          <span>增强期 · 横断位</span>
        </div>
        <div>
          <SlidersHorizontal size={17} />
          <span>{windowPreset}</span>
        </div>
        <div>
          <span>{activeOverlayCount}/3 图层开启</span>
        </div>
      </div>

      <div className="window-presets" aria-label="窗宽窗位预设">
        {["软组织", "肝脏增强", "血管期"].map((item) => (
          <button
            className={windowPreset === item ? "active" : ""}
            data-window-preset={item}
            key={item}
            type="button"
            onClick={() => setWindowPreset(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="ct-stage" aria-label="CT 切片与分割叠加查看器">
        <img className="ct-reference" src={asset("image1.jpeg")} alt="平台影像样例截图" />
        <div className="ct-aperture">
          <div className="ct-orbit ct-orbit-a" />
          <div className="ct-orbit ct-orbit-b" />
          <div className="ct-slice-core" style={{ transform: `translate(-50%, -50%) rotate(${slice / 12}deg)` }} />
          {overlays.liver ? <div className="ct-mask liver-mask" /> : null}
          {overlays.tumor ? <div className="ct-mask tumor-mask" /> : null}
          {overlays.vessel ? <div className="ct-mask vessel-mask" /> : null}
          <div className="ct-measure-line" />
          <div className="ct-measure-tag">38.2 mm</div>
          <div className="ct-crosshair horizontal" />
          <div className="ct-crosshair vertical" />
        </div>
        <div className="ct-meta">
          <span>512 x 512</span>
          <span>窗宽 350 / 窗位 40</span>
          <span>层厚 1.25 mm</span>
        </div>
      </div>

      <input
        className="slice-slider"
        type="range"
        min="1"
        max={sliceCount}
        value={slice}
        onChange={(event) => onSliceChange(Number(event.target.value))}
        aria-label="切换 CT 切片"
      />

      <div className="overlay-toggles">
        {[
          ["liver", "肝脏", "liver-dot", "96.8%"],
          ["tumor", "肿瘤", "tumor-dot", "93.4%"],
          ["vessel", "血管", "vessel-dot", "91.2%"]
        ].map(([key, label, dot, score]) => (
          <button
            className={`toggle-pill ${overlays[key as keyof typeof overlays] ? "active" : ""}`}
            key={key}
            type="button"
            onClick={() => onOverlayChange(key as "liver" | "tumor" | "vessel")}
          >
            <span className={dot} />
            {label}
            <small>{score}</small>
          </button>
        ))}
      </div>

      <div className="slice-rail" aria-label="关键切片缩略轴">
        {thumbnailSlices.map((item) => (
          <button
            className={Math.abs(item - slice) <= 2 ? "active" : ""}
            type="button"
            key={item}
            onClick={() => onSliceChange(item)}
          >
            <span />
            {String(item).padStart(3, "0")}
          </button>
        ))}
      </div>

      {measurements.length ? (
        <div className="measurement-strip">
          {measurements.map((item) => (
            <article key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
