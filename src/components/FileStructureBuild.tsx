import type { Batch } from '../types';
import { useI18n } from '../i18n';

interface Props {
  batches: Batch[];
  onBack: () => void;
  onStart: () => void;
}

export default function FileStructureBuild({
  batches,
  onBack,
  onStart,
}: Props) {
  const { t } = useI18n();
  const namedCount = batches.filter(
    (b) => b.description.trim().length > 0
  ).length;

  return (
    <div className="screen-center">
      <div className="welcome-card">
        <h1 className="card-title">{t('build.title')}</h1>
        <p className="card-subtitle">
          {t('build.namedCount', { named: namedCount, total: batches.length })}
          {namedCount < batches.length && <> {t('build.skipNote')}</>}
        </p>
        <div className="card-actions">
          <button className="btn-mac" onClick={onBack}>
            {t('build.back')}
          </button>
          <button
            className="btn-mac btn-mac-primary"
            onClick={onStart}
            disabled={namedCount === 0}
          >
            {t('build.start')}
          </button>
        </div>
      </div>
    </div>
  );
}
