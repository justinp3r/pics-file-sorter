import { useEffect, useRef, useState } from 'react';
import type { CarouselItem } from '../lib/batching';
import { getPreview, type Preview } from '../lib/preview';
import { useI18n } from '../i18n';

interface Props {
  items: CarouselItem[];
}

const VISIBLE_RANGE = 2;
const WHEEL_LOCK_MS = 180;

export default function Carousel({ items }: Props) {
  const { t } = useI18n();
  const [activeIdx, setActiveIdx] = useState(0);
  const [previews, setPreviews] = useState<Record<string, Preview | null>>({});
  const wheelLockRef = useRef(0);

  useEffect(() => setActiveIdx(0), [items]);

  // Load previews for the visible window (cache makes repeats instant).
  useEffect(() => {
    let cancelled = false;
    for (let off = -VISIBLE_RANGE; off <= VISIBLE_RANGE; off++) {
      const idx = activeIdx + off;
      if (idx < 0 || idx >= items.length) continue;
      const item = items[idx];
      if (previews[item.key] !== undefined) continue;
      getPreview(item.representative).then((p) => {
        if (cancelled) return;
        setPreviews((prev) =>
          prev[item.key] !== undefined ? prev : { ...prev, [item.key]: p }
        );
      });
    }
    return () => {
      cancelled = true;
    };
  }, [activeIdx, items, previews]);

  // Prefetch the rest of the batch in the background while the UI is idle,
  // so swiping through the carousel never waits on thumbnail generation.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (const item of items) {
        if (cancelled) return;
        await getPreview(item.representative);
      }
    };
    const hasIdle = typeof window.requestIdleCallback === 'function';
    const id = hasIdle
      ? window.requestIdleCallback(() => void run())
      : window.setTimeout(run, 300);
    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, [items]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setActiveIdx((i) => Math.max(0, i - 1));
      else if (e.key === 'ArrowRight')
        setActiveIdx((i) => Math.min(items.length - 1, i + 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [items.length]);

  if (items.length === 0) {
    return <div className="carousel-empty">{t('scenery.emptyBatch')}</div>;
  }

  const prev = () => setActiveIdx((i) => Math.max(0, i - 1));
  const next = () => setActiveIdx((i) => Math.min(items.length - 1, i + 1));

  const onWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now < wheelLockRef.current) return;
    wheelLockRef.current = now + WHEEL_LOCK_MS;
    if (e.deltaY > 0 || e.deltaX > 0) next();
    else if (e.deltaY < 0 || e.deltaX < 0) prev();
  };

  return (
    <div className="carousel-wrap">
      <button
        className="carousel-nav carousel-nav-left"
        onClick={prev}
        disabled={activeIdx === 0}
        aria-label={t('scenery.prevImage')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="carousel-strip" onWheel={onWheel} role="region">
        {items.map((item, idx) => {
          const offset = idx - activeIdx;
          const abs = Math.abs(offset);
          if (abs > VISIBLE_RANGE + 1) return null;
          const preview = previews[item.key];
          const isVideo = item.representative.isVideo;
          return (
            <div
              key={item.key}
              className={'carousel-card' + (offset === 0 ? ' is-active' : '')}
              style={
                {
                  '--offset': offset,
                  '--abs-offset': abs,
                  zIndex: 10 - abs,
                } as React.CSSProperties
              }
              onClick={() => setActiveIdx(idx)}
            >
              <div className="carousel-card-inner">
                {preview ? (
                  <img
                    src={preview.url}
                    alt={item.representative.name}
                    draggable={false}
                    decoding="async"
                  />
                ) : (
                  <div className="carousel-card-fallback">
                    {preview === undefined ? (
                      <div className="spinner-small" />
                    ) : (
                      <span>
                        {item.representative.extension
                          .toUpperCase()
                          .replace('.', '')}
                      </span>
                    )}
                  </div>
                )}
                {isVideo && (
                  <div
                    className={
                      'video-play-badge ' +
                      (preview && preview.cornerLuminance > 0.6
                        ? 'dark'
                        : 'light')
                    }
                    aria-hidden
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="7 4 20 12 7 20" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className="carousel-nav carousel-nav-right"
        onClick={next}
        disabled={activeIdx === items.length - 1}
        aria-label={t('scenery.nextImage')}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
