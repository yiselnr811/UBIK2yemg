'use client';

import { useState } from 'react';

export default function AadsFloatingAd() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;

  return (
    <aside
      aria-label="Publicidad"
      className="aads-floating-ad"
    >
      <button
        type="button"
        className="aads-floating-close"
        aria-label="Cerrar publicidad"
        onClick={() => setClosed(true)}
      >
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path
            d="M18 6 6 18M6 6l12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <iframe
        title="Publicidad de A-ADS"
        data-aa="2459205"
        src="https://acceptable.a-ads.com/2459205/?size=Adaptive"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </aside>
  );
}
