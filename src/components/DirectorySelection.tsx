import { useCallback, useState } from 'react';
import { pickDirectory, supportsFileSystemAPI } from '../lib/fileSystem';
import { useI18n } from '../i18n';

interface Props {
  sourceHandle: FileSystemDirectoryHandle | null;
  targetHandle: FileSystemDirectoryHandle | null;
  scanning: boolean;
  scanCount: number;
  error: string | null;
  onSourcePicked: (h: FileSystemDirectoryHandle) => void;
  onTargetPicked: (h: FileSystemDirectoryHandle) => void;
  onContinue: () => void;
}

export default function DirectorySelection({
  sourceHandle,
  targetHandle,
  scanning,
  scanCount,
  error,
  onSourcePicked,
  onTargetPicked,
  onContinue,
}: Props) {
  const { t } = useI18n();
  const [pickerError, setPickerError] = useState<string | null>(null);
  const supported = supportsFileSystemAPI();

  const pick = useCallback(
    async (
      mode: 'read' | 'readwrite',
      id: string,
      onPicked: (h: FileSystemDirectoryHandle) => void
    ) => {
      setPickerError(null);
      try {
        onPicked(await pickDirectory({ mode, id }));
      } catch (err: unknown) {
        const e = err as { name?: string; message?: string };
        if (e?.name !== 'AbortError') {
          setPickerError(e?.message ?? 'Error');
        }
      }
    },
    []
  );

  const ready = sourceHandle && targetHandle && !scanning;

  return (
    <div className="screen-center">
      <div className="welcome-card">
        <h1 className="card-title">{t('locate.title')}</h1>

        {!supported && (
          <div className="warn-banner">{t('locate.unsupported')}</div>
        )}

        <div className="dir-actions">
          <div className="dir-steps">
            <button
              className="btn-mac"
              onClick={() => pick('read', 'source', onSourcePicked)}
              disabled={!supported || scanning}
            >
              1.{' '}
              {sourceHandle
                ? `${t('locate.source')}: ${sourceHandle.name}`
                : t('locate.openSource')}
            </button>
            <span className="step-connector" aria-hidden />
            <button
              className="btn-mac"
              onClick={() => pick('readwrite', 'target', onTargetPicked)}
              disabled={!supported || scanning}
            >
              2.{' '}
              {targetHandle
                ? `${t('locate.target')}: ${targetHandle.name}`
                : t('locate.openTarget')}
            </button>
          </div>
          <button
            className="btn-mac btn-mac-primary"
            disabled={!ready}
            onClick={onContinue}
          >
            {scanning
              ? t('locate.scanning', { count: scanCount })
              : t('locate.analyze')}
          </button>
        </div>

        {(pickerError || error) && (
          <div className="error-banner">{pickerError || error}</div>
        )}
      </div>
    </div>
  );
}
