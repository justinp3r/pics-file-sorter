import { useEffect, useRef, useState } from 'react';
import type { Batch } from '../types';
import {
  buildFileStructure,
  ensurePermission,
  type BuildProgress,
} from '../lib/fileSystem';
import { useI18n } from '../i18n';

interface Props {
  target: FileSystemDirectoryHandle;
  batches: Batch[];
  onDone: () => void;
}

export default function ProgressView({ target, batches, onDone }: Props) {
  const { t, lang } = useI18n();
  const [progress, setProgress] = useState<BuildProgress>({
    done: 0,
    total: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    (async () => {
      try {
        const ok = await ensurePermission(target, 'readwrite');
        if (!ok) {
          setError(t('progress.permissionDenied'));
          return;
        }
        const named = batches
          .filter((b) => b.description.trim().length > 0)
          .map((b) => ({
            description: b.description,
            files: b.files,
            date: b.startDate,
          }));
        await buildFileStructure(target, named, lang, setProgress);
        onDone();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      }
    })();
  }, [target, batches, lang, onDone, t]);

  const pct =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="screen-center">
      <div className="welcome-card">
        <h2 className="card-title">{t('progress.title')}</h2>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${pct}%` }}
            aria-hidden
          />
        </div>
        <div className="progress-meta">
          {t('progress.of', { done: progress.done, total: progress.total })} ·{' '}
          {pct}%
        </div>
        {progress.currentFile && (
          <div className="progress-current" title={progress.currentFile}>
            {progress.currentFile}
          </div>
        )}
        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
}
