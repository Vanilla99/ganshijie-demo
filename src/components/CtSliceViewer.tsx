import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const displaySlice = String(slice).padStart(3, "0");
  const thumbnailSlices = [0.28, 0.42, 0.56, 0.67, 0.82].map((ratio) => Math.max(1, Math.round(sliceCount * ratio)));

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
          ["liver", "肝脏", "liver-dot"],
          ["tumor", "肿瘤", "tumor-dot"],
          ["vessel", "血管", "vessel-dot"]
        ].map(([key, label, dot]) => (
          <button
            className={`toggle-pill ${overlays[key as keyof typeof overlays] ? "active" : ""}`}
            key={key}
            type="button"
            onClick={() => onOverlayChange(key as "liver" | "tumor" | "vessel")}
          >
            <span className={dot} />
            {label}
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
