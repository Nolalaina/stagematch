export default function MatchRing({ score, size = 80 }) {
  const r = size / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const numScore = Number(score) || 0;
  const dash = (Math.min(numScore, 100) / 100) * circumference;
  const cx = size / 2;

  return (
    <svg className="match-ring" width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`Score de compatibilité ${Math.round(numScore)} pour cent`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--color-rule)" strokeWidth="6" />
      <circle
        cx={cx} cy={cx} r={r} fill="none" stroke="var(--color-accent)" strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`} transform={`rotate(-90 ${cx} ${cx})`}
      />
      <text x={cx} y={cx + 2} textAnchor="middle" fontFamily="var(--font-body)" fontSize={size * 0.26} fontWeight="700" fill="var(--color-ink)">
        {Math.round(numScore)}%
      </text>
      <text x={cx} y={cx + size * 0.2} textAnchor="middle" fontFamily="var(--font-body)" fontSize={size * 0.1} fontWeight="600" fill="var(--color-muted)">
        match
      </text>
    </svg>
  );
}
