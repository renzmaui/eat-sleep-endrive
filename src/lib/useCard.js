import { useEffect, useState } from 'react';
import { canvasToBlob } from './exportImage';

// Renders a canvas card in the background and keeps { url, blob } ready,
// so Save / Share buttons respond instantly (and pop-ups aren't blocked).
export function useCard(render, deps) {
  const [card, setCard] = useState(null);
  useEffect(() => {
    let alive = true;
    let url;
    setCard(null);
    Promise.resolve()
      .then(render)
      .then((canvas) => (canvas ? canvasToBlob(canvas) : null))
      .then((blob) => {
        if (!alive || !blob) return;
        url = URL.createObjectURL(blob);
        setCard({ url, blob });
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (url) URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return card;
}
