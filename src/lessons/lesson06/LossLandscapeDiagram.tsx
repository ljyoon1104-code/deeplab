export function LossLandscapeDiagram({
  showDirection = false,
}: {
  showDirection?: boolean
}) {
  return (
    <svg
      viewBox="0 0 340 300"
      className="mx-auto h-auto w-full max-w-[26rem]"
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
        d="M30 54 Q95 238 170 238 Q245 238 310 54 L310 270 L30 270 Z"
        fill="url(#loss-area)"
      />
      <path
        d="M30 54 Q95 238 170 238 Q245 238 310 54"
        fill="none"
        stroke="#6366f1"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="250" cy="186" r="9" fill="#e11d48" stroke="white" strokeWidth="4" />
      <text x="250" y="155" textAnchor="middle" fontSize="20" fontWeight="800" fill="#9f1239">
        현재 위치
      </text>
      {showDirection && (
        <line
          x1="235"
          y1="196"
          x2="196"
          y2="225"
          stroke="#4f46e5"
          strokeWidth="5"
          markerEnd="url(#loss-arrow)"
        />
      )}
      <text x="170" y="264" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f766e">
        Loss가 작은 곳
      </text>
      <text x="34" y="38" fontSize="20" fontWeight="700" fill="#64748b">
        Loss 큼
      </text>
      <text x="310" y="38" textAnchor="end" fontSize="20" fontWeight="700" fill="#64748b">
        Loss 큼
      </text>
    </svg>
  )
}
