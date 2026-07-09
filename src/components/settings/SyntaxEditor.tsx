import { useState } from 'react';
import type { SyntaxToken, SyntaxTokenType } from '../../types';
import {
  DYNAMIC_TOKEN_OPTIONS,
  defaultSyntaxTokens,
  newToken,
  tokenLabel,
} from '../../lib/syntax';
import { useI18n } from '../../i18n';

interface Props {
  tokens: SyntaxToken[];
  onChange: (tokens: SyntaxToken[]) => void;
}

export default function SyntaxEditor({ tokens, onChange }: Props) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [stagingType, setStagingType] = useState<SyntaxTokenType>('YYYY');
  const [stagingStatic, setStagingStatic] = useState('');

  const removeToken = (id: string) =>
    onChange(tokens.filter((tok) => tok.id !== id));

  const addDynamic = () => onChange([...tokens, newToken(stagingType)]);

  const addStatic = () => {
    const value = stagingStatic.trim();
    if (!value) return;
    onChange([...tokens, newToken('static', value)]);
    setStagingStatic('');
  };

  return (
    <div className="syntax-editor">
      <div className="syntax-editor-head">
        <div className="token-strip">
          {tokens.map((tok) => (
            <span
              key={tok.id}
              className={
                'token ' +
                (tok.type === 'static' ? 'token-static' : 'token-dynamic')
              }
            >
              {editing && (
                <button
                  className="token-x"
                  onClick={() => removeToken(tok.id)}
                  aria-label={t('settings.remove')}
                >
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              )}
              {tokenLabel(tok)}
            </span>
          ))}
        </div>
        <button
          className={'icon-btn-sm' + (editing ? ' is-active' : '')}
          onClick={() => setEditing((e) => !e)}
          aria-label={editing ? t('settings.done') : t('settings.edit')}
          title={editing ? t('settings.done') : t('settings.edit')}
        >
          {editing ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4z" />
            </svg>
          )}
        </button>
      </div>

      {editing && (
        <div className="syntax-editor-tools">
          <div className="add-token-group">
            <select
              className="token-select"
              value={stagingType}
              onChange={(e) =>
                setStagingType(e.target.value as SyntaxTokenType)
              }
              aria-label={t('settings.addDynamic')}
            >
              {DYNAMIC_TOKEN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button
              className="add-btn"
              onClick={addDynamic}
              aria-label={t('settings.addDynamic')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div className="add-token-group">
            <input
              className="token-static-input"
              placeholder={t('settings.staticPlaceholder')}
              value={stagingStatic}
              onChange={(e) => setStagingStatic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addStatic();
              }}
            />
            <button
              className="add-btn"
              onClick={addStatic}
              aria-label={t('settings.addStatic')}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <button
            className="link-btn"
            onClick={() => onChange(defaultSyntaxTokens())}
          >
            {t('settings.resetDefault')}
          </button>
        </div>
      )}
    </div>
  );
}
