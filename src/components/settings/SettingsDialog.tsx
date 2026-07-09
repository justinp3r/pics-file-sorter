import { useEffect, useState } from 'react';
import type {
  AppSettings,
  BatchGapPreset,
  Language,
  ThemePreference,
} from '../../types';
import { LANGUAGES, useI18n } from '../../i18n';
import { APP_VERSION } from '../../lib/settings';
import { detectOS, osLabel } from '../../lib/platform';
import SyntaxEditor from './SyntaxEditor';

interface Props {
  settings: AppSettings;
  onClose: () => void;
  onApply: (s: AppSettings) => void;
}

type Pane = 'general' | 'appearance' | 'info';

export default function SettingsDialog({ settings, onClose, onApply }: Props) {
  const { t } = useI18n();
  const [pane, setPane] = useState<Pane>('general');
  const [draft, setDraft] = useState<AppSettings>(settings);

  const patch = (p: Partial<AppSettings>) =>
    setDraft((d) => ({ ...d, ...p }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const panes: { id: Pane; label: string; icon: JSX.Element; tint: string }[] =
    [
      {
        id: 'general',
        label: t('settings.general'),
        tint: '#8e8e93',
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
            <circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" />
            <circle cx="15" cy="12" r="2" fill="currentColor" stroke="none" />
            <circle cx="7" cy="17" r="2" fill="currentColor" stroke="none" />
          </svg>
        ),
      },
      {
        id: 'appearance',
        label: t('settings.appearance'),
        tint: '#0a84ff',
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 1 0 0 20V2z" />
            <path d="M12 2a10 10 0 0 1 0 20V2z" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        ),
      },
      {
        id: 'info',
        label: t('settings.info'),
        tint: '#64748b',
        icon: (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="11" x2="12" y2="16" />
            <circle cx="12" cy="8" r="0.5" fill="currentColor" />
          </svg>
        ),
      },
    ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="settings-window"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="settings-titlebar">
          <h2 id="settings-title">{t('settings.title')}</h2>
          <button
            className="titlebar-close"
            onClick={onClose}
            aria-label={t('common.close')}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-main">
          <nav className="settings-sidebar">
            {panes.map((p) => (
              <button
                key={p.id}
                className={'side-item' + (pane === p.id ? ' is-active' : '')}
                onClick={() => setPane(p.id)}
              >
                <span className="side-icon" style={{ background: p.tint }}>
                  {p.icon}
                </span>
                {p.label}
              </button>
            ))}
          </nav>

          <section className="settings-content">
            {pane === 'general' && (
              <GeneralPane draft={draft} patch={patch} />
            )}
            {pane === 'appearance' && (
              <AppearancePane draft={draft} patch={patch} />
            )}
            {pane === 'info' && <InfoPane />}
          </section>
        </div>

        <footer className="settings-footer">
          <button className="btn-mac" onClick={onClose}>
            {t('common.close')}
          </button>
          <button
            className="btn-mac btn-mac-primary"
            onClick={() => onApply(draft)}
          >
            {t('common.apply')}
          </button>
        </footer>
      </div>
    </div>
  );
}

interface PaneProps {
  draft: AppSettings;
  patch: (p: Partial<AppSettings>) => void;
}

function GeneralPane({ draft, patch }: PaneProps) {
  const { t } = useI18n();
  const gapOptions: { value: BatchGapPreset; label: string }[] = [
    { value: '1min', label: t('settings.gap1min') },
    { value: '10min', label: t('settings.gap10min') },
    { value: 'day', label: t('settings.gap1day') },
    { value: 'custom', label: t('settings.gapCustom') },
  ];

  return (
    <>
      <h3 className="pane-title">{t('settings.general')}</h3>

      <div className="group">
        <div className="group-row">
          <span className="row-label">{t('settings.language')}</span>
          <select
            className="mac-select"
            value={draft.language}
            onChange={(e) => patch({ language: e.target.value as Language })}
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="group">
        <div className="group-row">
          <span className="row-label">{t('settings.batchGap')}</span>
          <select
            className="mac-select"
            value={draft.batchGapPreset}
            onChange={(e) =>
              patch({ batchGapPreset: e.target.value as BatchGapPreset })
            }
          >
            {gapOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        {draft.batchGapPreset === 'custom' && (
          <div className="group-row">
            <span className="row-label">{t('settings.minutes')}</span>
            <input
              type="number"
              className="num-input"
              min={1}
              max={10080}
              value={draft.customGapMinutes}
              onChange={(e) =>
                patch({
                  customGapMinutes: Math.max(
                    1,
                    Math.round(Number(e.target.value) || 1)
                  ),
                })
              }
            />
          </div>
        )}
      </div>

      <div className="group">
        <div className="group-row group-row-stacked">
          <span className="row-label">{t('settings.syntax')}</span>
          <SyntaxEditor
            tokens={draft.syntaxTokens}
            onChange={(syntaxTokens) => patch({ syntaxTokens })}
          />
        </div>
      </div>
    </>
  );
}

function AppearancePane({ draft, patch }: PaneProps) {
  const { t } = useI18n();
  const options: { value: ThemePreference; label: string }[] = [
    { value: 'system', label: t('settings.themeSystem') },
    { value: 'light', label: t('settings.themeLight') },
    { value: 'dark', label: t('settings.themeDark') },
  ];

  return (
    <>
      <h3 className="pane-title">{t('settings.appearance')}</h3>
      <div className="group">
        <div className="group-row">
          <span className="row-label">{t('settings.theme')}</span>
          <div className="segmented" role="radiogroup">
            {options.map((o) => (
              <button
                key={o.value}
                role="radio"
                aria-checked={draft.theme === o.value}
                className={draft.theme === o.value ? 'is-active' : ''}
                onClick={() => patch({ theme: o.value })}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <p className="group-note">
        {t('settings.systemNote', { os: osLabel(detectOS()) })}
      </p>
    </>
  );
}

function InfoPane() {
  const { t } = useI18n();
  return (
    <>
      <h3 className="pane-title">{t('settings.info')}</h3>
      <div className="about">
        <div className="about-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
            <circle cx="12" cy="13" r="3.2" />
          </svg>
        </div>
        <div className="about-name">Pics File Sorter</div>
        <div className="about-version">
          {t('info.version')} {APP_VERSION}
        </div>
        <p className="about-desc">{t('info.description')}</p>
      </div>
    </>
  );
}
