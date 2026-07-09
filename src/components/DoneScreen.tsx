import { useI18n } from '../i18n';

interface Props {
  onRestart: () => void;
}

export default function DoneScreen({ onRestart }: Props) {
  const { t } = useI18n();
  return (
    <div className="screen-center">
      <div className="welcome-card">
        <h2 className="card-title">{t('done.title')}</h2>
        <p className="card-subtitle">{t('done.text')}</p>
        <div className="card-actions">
          <button className="btn-mac btn-mac-primary" onClick={onRestart}>
            {t('done.restart')}
          </button>
        </div>
      </div>
    </div>
  );
}
