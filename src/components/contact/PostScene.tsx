/** The envelope dropping into the postbox while the letter is "posted". */
export function PostScene() {
  return (
    <div aria-hidden="true" className="tp-post__scene">
      <svg viewBox="0 0 160 112" className="tp-post__envelope">
        <rect x="4" y="18" width="152" height="90" rx="6" fill="#fffdf8" stroke="#2a170e" strokeWidth="4" />
        <path d="M6 104 64 62M154 104 96 62" fill="none" stroke="#2a170e" strokeWidth="3" strokeLinecap="round" />
        <path
          className="tp-post__flap"
          d="M6 22 80 74 154 22"
          fill="#fbe3b4"
          stroke="#2a170e"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <circle cx="80" cy="72" r="11" fill="#a24a1a" stroke="#2a170e" strokeWidth="3" />
      </svg>
      <svg viewBox="0 0 200 260" className="tp-post__box">
        <rect x="86" y="170" width="28" height="86" fill="#5a3a28" stroke="#2a170e" strokeWidth="4" />
        <path
          d="M30 70a70 54 0 0 1 140 0v104H30z"
          fill="#c2622b"
          stroke="#2a170e"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <rect x="58" y="86" width="84" height="14" rx="7" fill="#2a170e" />
        <path d="M44 128h112" stroke="#2a170e" strokeWidth="3" strokeLinecap="round" opacity=".35" />
        <g className="tp-post__flag">
          <path d="M170 120V64" stroke="#2a170e" strokeWidth="5" strokeLinecap="round" />
          <path d="M170 64h22v16h-22" fill="#f2be6b" stroke="#2a170e" strokeWidth="4" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

/** Small postbox with its flag up, shown once the letter is sent. */
export function SentPostbox() {
  return (
    <svg viewBox="0 0 200 150" aria-hidden="true" className="tp-post__box tp-post__box--sent">
      <rect x="86" y="96" width="28" height="52" fill="#5a3a28" stroke="#2a170e" strokeWidth="4" />
      <path d="M30 50a70 44 0 0 1 140 0v52H30z" fill="#c2622b" stroke="#2a170e" strokeWidth="5" strokeLinejoin="round" />
      <rect x="58" y="58" width="84" height="12" rx="6" fill="#2a170e" />
      <path d="M170 92V22" stroke="#2a170e" strokeWidth="5" strokeLinecap="round" />
      <path d="M170 22h22v16h-22" fill="#f2be6b" stroke="#2a170e" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}
