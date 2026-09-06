export function LossLandscapeDiagram({
  showDirection = false,
}: {
  showDirection?: boolean
}) {
  return (
    <svg
      viewBox="0 0 680 300"
      className="h-auto w-full"
      role="img"
      aria-labelledby="loss-landscape-title loss-landscape-description"
    >
      <title id="loss-landscape-title">Loss가 작아지는 방향을 찾는 단순화된 경사 그림</title>
      <desc id="loss-landscape-description">
        현재 위치는 오른쪽 경사면에 있으며 왼쪽의 낮은 곳으로 이동하면 Loss가 작아집니다.
      </desc>
      <defs>
        <linearGradient id="loss-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ecfeff" stopOpacity="0.25" />
        </linearGradient>
        <marker
          id="loss-arrow"
          markerWidth="10"
          markerHeight="10"
          refX="7"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#4f46e5" />
        </marker>
      </defs>
      <path
        d="M60 54 Q190 238 340 238 Q490 238 620 54 L620 270 L60 270 Z"
        fill="url(#loss-area)"
      />
      <path
        d="M60 54 Q190 238 340 238 Q490 238 620 54"
        fill="none"
        stroke="#6366f1"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="500" cy="186" r="12" fill="#e11d48" stroke="white" strokeWidth="5" />
      <text x="500" y="155" textAnchor="middle" fontSize="17" fontWeight="800" fill="#9f1239">
        현재 위치
      </text>
      {showDirection && (
        <line
          x1="470"
          y1="196"
          x2="392"
          y2="225"
          stroke="#4f46e5"
          strokeWidth="5"
          markerEnd="url(#loss-arrow)"
        />
      )}
      <text x="340" y="264" textAnchor="middle" fontSize="16" fontWeight="800" fill="#0f766e">
        Loss가 작은 곳
      </text>
      <text x="68" y="38" fontSize="15" fontWeight="700" fill="#64748b">
        Loss 큼
      </text>
      <text x="548" y="38" fontSize="15" fontWeight="700" fill="#64748b">
        Loss 큼
      </text>
    </svg>
  )
}
