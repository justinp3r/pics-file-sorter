import { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { CarouselItem } from '../lib/batching';
import { getPreview, type Preview } from '../lib/preview';
import { useI18n } from '../i18n';

interface Props {
  items: CarouselItem[];
}

const VISIBLE_RANGE = 2;
const WHEEL_LOCK_MS = 180;

type PreviewMap = Record<string, Preview | null>;

function Carousel({ items }: Props) {
  const { t } = useI18n();
  const [activeIdx, setActiveIdx] = useState(0);
  const [previews, setPreviews] = useState<PreviewMap>({});
  const requestedRef = useRef<Set<string>>(new Set());
  const wheelLockRef = useRef(0);

  useEffect(() => {
    requestedRef.current = new Set();
    setPreviews({});
    setActiveIdx(0);
  }, [items]);

  // Load previews for the visible window. Tracking requests in a ref keeps
  // this effect from re-running every time a preview resolves.
  useEffect(() => {
    let cancelled = false;
    for (let off = -VISIBLE_RANGE; off <= VISIBLE_RANGE; off++) {
      const idx = activeIdx + off;
      if (idx < 0 || idx >= items.length) continue;
      const item = items[idx];
      if (requestedRef.current.has(item.key)) continue;
      requestedRef.current.add(item.key);
      getPreview(item.representative).then((p) => {
        if (!cancelled) setPreviews((prev) => ({ ...prev, [item.key]: p }));
      });
    }
    return () => {
      cancelled = true;
    };
  }, [activeIdx, items]);

  // Prefetch the rest of the batch while the UI is idle, so swiping through
  // the carousel never waits on thumbnail generation.
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

  const onSelect = useCallback((idx: number) => setActiveIdx(idx), []);

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
          if (Math.abs(offset) > VISIBLE_RANGE + 1) return null;
          return (
            <CarouselCard
              key={item.key}
              item={item}
              index={idx}
              offset={offset}
              preview={previews[item.key]}
              onSelect={onSelect}
            />
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

interface CardProps {
  item: CarouselItem;
  index: number;
  offset: number;
  preview: Preview | null | undefined;
  onSelect: (index: number) => void;
}

/** One card in the 3D strip. Memoized so preview updates and description
 *  typing don't re-render untouched cards. */
const CarouselCard = memo(function CarouselCard({
  item,
  index,
  offset,
  preview,
  onSelect,
}: CardProps) {
  const abs = Math.abs(offset);
  const isVideo = item.representative.isVideo;

  return (
    <div
      className={'carousel-card' + (offset === 0 ? ' is-active' : '')}
      style={
        {
          '--offset': offset,
          '--abs-offset': abs,
          zIndex: 10 - abs,
        } as React.CSSProperties
      }
      onClick={() => onSelect(index)}
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
                {item.representative.extension.toUpperCase().replace('.', '')}
              </span>
            )}
          </div>
        )}
        {isVideo && (
          <div
            className={
              'video-play-badge ' +
              (preview && preview.cornerLuminance > 0.6 ? 'dark' : 'light')
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
});

/** Memoized: typing in the scenery description re-renders SceneryView but
 *  leaves the carousel subtree untouched (its `items` prop is stable). */
export default memo(Carousel);
