import { DEFAULT_PROFILE, SPARKLE_OPTIONS, PALETTES, FONT_PAIRINGS, FONT_FAMILIES } from '../lib/profile';

export default function Settings({ profile, onChange }) {
  function set(field, value) {
    onChange(prev => ({ ...prev, [field]: value }));
  }

  return (
    <div className="card settings-card">
      <h3>customize</h3>

      <label className="settings-label">hero title</label>
      <input
        type="text"
        className="settings-input"
        value={profile.heroTitle}
        maxLength={60}
        onChange={e => set('heroTitle', e.target.value)}
      />

      <label className="settings-label">your name (for the greeting)</label>
      <input
        type="text"
        className="settings-input"
        value={profile.userName}
        maxLength={30}
        placeholder="leave blank to skip the greeting"
        onChange={e => set('userName', e.target.value)}
      />

      <label className="settings-label">tagline</label>
      <input
        type="text"
        className="settings-input"
        value={profile.heroTagline}
        maxLength={80}
        placeholder="leave blank to show a rotating daily quote instead"
        onChange={e => set('heroTagline', e.target.value)}
      />

      <label className="settings-label">sparkle</label>
      <div className="category-picker">
        {SPARKLE_OPTIONS.map(s => (
          <button
            type="button"
            key={s}
            className={'category-chip' + (profile.sparkle === s ? ' active' : '')}
            onClick={() => set('sparkle', s)}
          >
            {s}
          </button>
        ))}
        <input
          type="text"
          className="icon-input"
          value={SPARKLE_OPTIONS.includes(profile.sparkle) ? '' : profile.sparkle}
          onChange={e => set('sparkle', e.target.value || DEFAULT_PROFILE.sparkle)}
          maxLength={2}
          placeholder="✏️"
          aria-label="custom sparkle"
        />
      </div>

      <label className="settings-label">theme palette</label>
      <div className="palette-picker">
        {PALETTES.map(p => (
          <button
            type="button"
            key={p.key}
            className={'palette-chip palette-' + p.key + (profile.palette === p.key ? ' active' : '')}
            onClick={() => set('palette', p.key)}
          >
            <span className="palette-swatch" />
            {p.label}
          </button>
        ))}
      </div>

      <label className="settings-label">fonts</label>
      <div className="palette-picker">
        {FONT_PAIRINGS.map(f => (
          <button
            type="button"
            key={f.key}
            className={'font-chip' + (profile.font === f.key ? ' active' : '')}
            style={{ fontFamily: FONT_FAMILIES[f.key].mono }}
            onClick={() => set('font', f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button type="button" className="settings-reset" onClick={() => onChange(() => ({ ...DEFAULT_PROFILE }))}>
        reset to defaults
      </button>
    </div>
  );
}
