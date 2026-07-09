import { useCallback, useEffect, useState } from 'react';
import './App.css';
import DirectorySelection from './components/DirectorySelection';
import SceneryView from './components/SceneryView';
import FileStructureBuild from './components/FileStructureBuild';
import ProgressView from './components/ProgressView';
import DoneScreen from './components/DoneScreen';
import SettingsDialog from './components/settings/SettingsDialog';
import { I18nProvider, useI18n } from './i18n';
import type { AppScreen, AppSettings, Batch } from './types';
import { scanDirectory } from './lib/fileSystem';
import { groupIntoBatches } from './lib/batching';
import {
  batchGapFromSettings,
  loadSettings,
  saveSettings,
} from './lib/settings';
import { systemPrefersDark } from './lib/platform';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const effectiveTheme =
    settings.theme === 'system'
      ? systemDark
        ? 'dark'
        : 'light'
      : settings.theme;

  useEffect(() => {
    document.documentElement.dataset.theme = effectiveTheme;
  }, [effectiveTheme]);

  useEffect(() => {
    document.documentElement.lang = settings.language;
    saveSettings(settings);
  }, [settings]);

  return (
    <I18nProvider lang={settings.language}>
      <AppContent settings={settings} onSettingsChange={setSettings} />
    </I18nProvider>
  );
}

interface AppContentProps {
  settings: AppSettings;
  onSettingsChange: (s: AppSettings) => void;
}

function AppContent({ settings, onSettingsChange }: AppContentProps) {
  const { t } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [screen, setScreen] = useState<AppScreen>('directory');
  const [sourceHandle, setSourceHandle] =
    useState<FileSystemDirectoryHandle | null>(null);
  const [targetHandle, setTargetHandle] =
    useState<FileSystemDirectoryHandle | null>(null);

  const [scanning, setScanning] = useState(false);
  const [scanCount, setScanCount] = useState(0);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);

  const proceedToScenery = useCallback(async () => {
    if (!sourceHandle) return;
    setScanning(true);
    setScanError(null);
    setScanCount(0);
    try {
      const files = await scanDirectory(
        sourceHandle,
        settings.syntaxTokens,
        setScanCount
      );
      setBatches(groupIntoBatches(files, batchGapFromSettings(settings)));
      setScreen('scenery');
    } catch (err: unknown) {
      setScanError(err instanceof Error ? err.message : String(err));
    } finally {
      setScanning(false);
    }
  }, [sourceHandle, settings]);

  const updateBatch = useCallback((idx: number, patch: Partial<Batch>) => {
    setBatches((bs) => bs.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  }, []);

  const restart = useCallback(() => {
    setScreen('directory');
    setSourceHandle(null);
    setTargetHandle(null);
    setBatches([]);
    setScanCount(0);
  }, []);

  const goToBuild = useCallback(() => setScreen('build'), []);
  const backToScenery = useCallback(() => setScreen('scenery'), []);
  const startBuild = useCallback(() => setScreen('progress'), []);
  const buildDone = useCallback(() => setScreen('done'), []);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-left">
          {(screen === 'scenery' || screen === 'build') && (
            <button
              className="back-link"
              onClick={screen === 'scenery' ? restart : backToScenery}
            >
              ← {t('common.back')}
            </button>
          )}
        </div>
        <div className="app-header-right">
          <button
            className="icon-btn"
            onClick={() => setSettingsOpen(true)}
            aria-label={t('settings.title')}
            title={t('settings.title')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
          </button>
        </div>
      </header>

      <main className="app-main">
        {screen === 'directory' && (
          <DirectorySelection
            sourceHandle={sourceHandle}
            targetHandle={targetHandle}
            scanning={scanning}
            scanCount={scanCount}
            error={scanError}
            onSourcePicked={setSourceHandle}
            onTargetPicked={setTargetHandle}
            onContinue={proceedToScenery}
          />
        )}
        {screen === 'scenery' && (
          <SceneryView
            batches={batches}
            onUpdateBatch={updateBatch}
            onFinish={goToBuild}
          />
        )}
        {screen === 'build' && (
          <FileStructureBuild
            batches={batches}
            onBack={backToScenery}
            onStart={startBuild}
          />
        )}
        {screen === 'progress' && targetHandle && (
          <ProgressView
            target={targetHandle}
            batches={batches}
            onDone={buildDone}
          />
        )}
        {screen === 'done' && <DoneScreen onRestart={restart} />}
      </main>

      {settingsOpen && (
        <SettingsDialog
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onApply={(s) => {
            onSettingsChange(s);
            setSettingsOpen(false);
          }}
        />
      )}
    </div>
  );
}
