export default function MatchRing({ score, size = 80 }) {
  const r = size / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const numScore = Number(score) || 0;
  const dash = (Math.min(numScore, 100) / 100) * circumference;
  const cx = size / 2;

  const strokeColor = numScore >= 60 ? 'url(#ringGradV4)' : 'var(--text-muted)';
  const textColor = numScore >= 60 ? 'var(--text-primary)' : 'var(--text-secondary)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="ringGradV4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle
        cx={cx} cy={cx} r={r} fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`} transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dasharray 0.8s ease' }}
      />
      <text x={cx} y={cx + 2} textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize={size * 0.26} fontWeight="800" fill={textColor}>
        {Math.round(numScore)}%
      </text>
      <text x={cx} y={cx + size * 0.2} textAnchor="middle" fontFamily="Plus Jakarta Sans, sans-serif" fontSize={size * 0.1} fontWeight="700" fill="var(--text-muted)">
        MATCH
      </text>
    </svg>
  );
}
