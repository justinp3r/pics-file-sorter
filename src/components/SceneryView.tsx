import { useMemo, useState } from 'react';
import type { Batch } from '../types';
import Carousel from './Carousel';
import { buildCarouselItems } from '../lib/batching';
import { useI18n } from '../i18n';

interface Props {
  batches: Batch[];
  onUpdateBatch: (idx: number, patch: Partial<Batch>) => void;
  onFinish: () => void;
}

interface RangeFormatters {
  date: Intl.DateTimeFormat;
  time: Intl.DateTimeFormat;
}

const formatterCache = new Map<string, RangeFormatters>();

function getFormatters(locale: string): RangeFormatters {
  let formatters = formatterCache.get(locale);
  if (!formatters) {
    formatters = {
      date: new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      time: new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    formatterCache.set(locale, formatters);
  }
  return formatters;
}

function formatDateRange(start: Date, end: Date, locale: string): string {
  const { date, time } = getFormatters(locale);
  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  if (sameDay) {
    return `${date.format(start)} · ${time.format(start)} – ${time.format(end)}`;
  }
  return `${date.format(start)} – ${date.format(end)}`;
}

export default function SceneryView({
  batches,
  onUpdateBatch,
  onFinish,
}: Props) {
  const { t, lang } = useI18n();
  const [activeIdx, setActiveIdx] = useState(0);
  const activeBatch = batches[activeIdx];

  // Keyed on `files` (stable across description edits) so typing in the
  // input doesn't rebuild the carousel.
  const carouselItems = useMemo(
    () => (activeBatch ? buildCarouselItems(activeBatch.files) : []),
    [activeBatch?.files]
  );

  if (batches.length === 0) {
    return (
      <div className="screen-center">
        <div className="welcome-card">
          <h2 className="card-title">{t('scenery.noMediaTitle')}</h2>
          <p className="card-subtitle">{t('scenery.noMediaText')}</p>
        </div>
      </div>
    );
  }

  const onNext = () => {
    if (activeIdx < batches.length - 1) setActiveIdx(activeIdx + 1);
    else onFinish();
  };

  return (
    <div className="scenery-view">
      <div className="scenery-header">
        <div className="scenery-title">{t('scenery.describe')}</div>
        <input
          className="scenery-input"
          placeholder={t('scenery.placeholder')}
          value={activeBatch.description}
          onChange={(e) =>
            onUpdateBatch(activeIdx, { description: e.target.value })
          }
        />
        <div className="scenery-meta">
          {formatDateRange(activeBatch.startDate, activeBatch.endDate, lang)} ·{' '}
          {t('scenery.filesCount', { count: activeBatch.files.length })}
        </div>
      </div>

      <Carousel items={carouselItems} />

      <div className="scenery-bottom">
        <div className="scenery-dots" role="tablist">
          {batches.map((b, i) => (
            <button
              key={b.id}
              className={'dot' + (i === activeIdx ? ' is-active' : '')}
              aria-label={t('scenery.batchAria', { n: i + 1 })}
              onClick={() => setActiveIdx(i)}
            />
          ))}
        </div>
        <button className="btn btn-primary scenery-next" onClick={onNext}>
          {activeIdx < batches.length - 1
            ? t('scenery.next')
            : t('scenery.continue')}
        </button>
      </div>
    </div>
  );
}
