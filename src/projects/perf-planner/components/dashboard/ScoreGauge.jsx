import { scoreColor } from "../../lib/calculator.js";

export default function ScoreGauge({ score, size = 110 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = cx - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;
  const color = scoreColor(score);

  return (
    <svg
      width={size}
      height={size}
      style={{ transform: "rotate(-90deg)", display: "block" }}
    >
      {/* Track */}
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={9}
      />
      {/* Score arc */}
      <circle
        cx={cx} cy={cy} r={radius}
        fill="none"
        stroke={color}
        strokeWidth={9}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
      />
      {/* Score text — counter-rotate so it reads upright */}
      <text
        x={cx} y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize={size * 0.24}
        fontWeight="800"
        style={{ transform: `rotate(90deg)`, transformOrigin: `${cx}px ${cy}px`, transition: "fill 0.3s ease" }}
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}
