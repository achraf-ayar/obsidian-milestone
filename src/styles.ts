// Stylesheet: all component styles

export const STYLES = `
  .ms-root * { box-sizing: border-box; }

  /* Topbar */
  .ms-topbar {
    display: flex; align-items: center; gap: 10px; padding: 10px 16px;
    border-bottom: 1px solid var(--background-modifier-border);
    flex-wrap: wrap; flex-shrink: 0;
    background: var(--background-secondary);
  }
  .ms-logo {
    font-family: var(--font-monospace); font-size: 14px; font-weight: 700;
    color: var(--color-accent); margin-right: 4px; white-space: nowrap;
    letter-spacing: -0.01em;
  }
  .ms-filters { display: flex; gap: 7px; flex-wrap: wrap; flex: 1; align-items: center; }
  .ms-input, .ms-select {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    color: var(--text-normal); border-radius: 6px; padding: 5px 10px;
    font-size: 12px; outline: none; font-family: var(--font-interface);
    transition: border-color 0.15s;
  }
  .ms-input { width: 150px; }
  .ms-input:focus, .ms-select:focus { border-color: var(--color-accent); }

  /* Buttons */
  .ms-btn {
    border-radius: 7px; padding: 6px 13px; font-size: 12px; font-weight: 600;
    cursor: pointer; border: none; font-family: var(--font-interface);
    transition: all 0.15s; white-space: nowrap;
    display: inline-flex; align-items: center; gap: 5px;
  }
  .ms-btn-primary { background: var(--color-accent); color: #fff; }
  .ms-btn-primary:hover { filter: brightness(1.12); transform: translateY(-1px); }
  .ms-btn-ghost {
    background: var(--background-primary); color: var(--text-muted);
    border: 1px solid var(--background-modifier-border);
  }
  .ms-btn-ghost:hover { background: var(--background-modifier-hover); color: var(--text-normal); }
  .ms-btn-panel {
    background: var(--background-primary); color: var(--text-muted);
    border: 1px solid var(--background-modifier-border);
  }
  .ms-btn-panel.active {
    background: color-mix(in srgb, var(--color-accent) 15%, transparent);
    color: var(--color-accent);
    border-color: color-mix(in srgb, var(--color-accent) 40%, transparent);
  }
  .ms-btn-panel:hover { border-color: var(--color-accent); color: var(--color-accent); }

  /* Stats bar */
  .ms-statsbar {
    display: flex; gap: 20px; padding: 6px 16px;
    background: var(--background-secondary); flex-shrink: 0;
    border-bottom: 1px solid var(--background-modifier-border);
    font-size: 11px; color: var(--text-muted); flex-wrap: wrap;
  }
  .ms-stat { display: flex; align-items: center; gap: 5px; }
  .ms-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

  /* Board & Columns */
  .ms-board {
    display: flex; gap: 14px; padding: 16px;
    overflow-x: auto; overflow-y: hidden; flex: 1; align-items: flex-start;
  }
  .ms-col {
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 10px; min-width: 272px; flex: 1;
    display: flex; flex-direction: column;
    max-height: 100%; overflow: hidden;
  }
  .ms-col-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 14px 10px;
    border-bottom: 1px solid var(--background-modifier-border);
    border-radius: 10px 10px 0 0; flex-shrink: 0;
  }
  .ms-col-title { display: flex; align-items: center; gap: 7px; font-weight: 600; font-size: 12px; }
  .ms-col-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .ms-col-count {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 20px; padding: 1px 7px;
    font-size: 10px; font-family: var(--font-monospace); color: var(--text-muted);
  }
  .ms-col-body {
    flex: 1; overflow-y: auto; padding: 8px;
    display: flex; flex-direction: column; gap: 7px;
    min-height: 60px; scrollbar-width: thin;
  }
  .ms-col.drag-over .ms-col-body {
    background: rgba(79, 110, 247, 0.07);
    border-radius: 0 0 10px 10px;
  }

  /* Cards */
  .ms-card {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px; padding: 10px 12px; cursor: grab;
    transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    position: relative; animation: msIn 0.18s ease;
  }
  @keyframes msIn {
    from { opacity: 0; transform: translateY(5px); }
    to   { opacity: 1; transform: none; }
  }
  .ms-card:hover {
    border-color: var(--color-accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  }
  .ms-card.dragging { opacity: 0.35; }
  .ms-card.ms-hidden { display: none; }
  .ms-pri-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 8px 0 0 8px; }
  .ms-card-title { font-size: 12px; font-weight: 500; line-height: 1.5; margin-bottom: 8px; padding-left: 2px; color: var(--text-normal); }
  .ms-card-meta { display: flex; flex-wrap: wrap; gap: 5px; }
  .ms-card-actions { position: absolute; top: 7px; right: 7px; display: flex; gap: 3px; opacity: 0; transition: opacity 0.15s; }
  .ms-card:hover .ms-card-actions { opacity: 1; }
  .ms-card-btn {
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    color: var(--text-muted); border-radius: 4px;
    width: 22px; height: 22px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; font-size: 11px; transition: all 0.12s;
  }
  .ms-card-btn:hover { background: var(--color-accent); color: #fff; border-color: var(--color-accent); }
  .ms-card-btn.del:hover { background: #ef4444; border-color: #ef4444; }

  /* Badges */
  .ms-badge {
    display: inline-flex; align-items: center; gap: 3px;
    border-radius: 4px; padding: 2px 7px; font-size: 10px; font-weight: 500;
  }
  .ms-badge-high   { background: color-mix(in srgb, #ef4444 15%, transparent); color: #f87171; border: 1px solid color-mix(in srgb, #ef4444 30%, transparent); }
  .ms-badge-medium { background: color-mix(in srgb, #f59e0b 15%, transparent); color: #fbbf24; border: 1px solid color-mix(in srgb, #f59e0b 30%, transparent); }
  .ms-badge-low    { background: color-mix(in srgb, #10b981 15%, transparent); color: #34d399; border: 1px solid color-mix(in srgb, #10b981 30%, transparent); }
  .ms-badge-tag    { background: color-mix(in srgb, #a855f7 15%, transparent); color: #c084fc; border: 1px solid color-mix(in srgb, #a855f7 30%, transparent); }

  /* Add card button */
  .ms-add-card-btn {
    margin: 6px 8px 8px; background: transparent;
    border: 1px dashed var(--background-modifier-border);
    border-radius: 6px; color: var(--text-faint); padding: 7px;
    font-size: 11px; cursor: pointer; font-family: var(--font-interface);
    transition: border-color 0.15s, color 0.15s; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; gap: 5px;
  }
  .ms-add-card-btn:hover { border-color: var(--color-accent); color: var(--color-accent); }
  .ms-empty { text-align: center; padding: 20px 12px; color: var(--text-faint); font-size: 11px; line-height: 1.8; }

  /* Side Panel */
  .ms-panel {
    width: 340px; min-width: 340px;
    border-left: 1px solid var(--background-modifier-border);
    background: var(--background-secondary);
    display: flex; flex-direction: column; overflow-y: hidden;
    animation: msPanelIn 0.2s ease;
  }
  @keyframes msPanelIn {
    from { transform: translateX(16px); opacity: 0; }
    to   { transform: none; opacity: 1; }
  }
  .ms-panel-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--background-modifier-border); flex-shrink: 0;
  }
  .ms-panel-title { font-size: 13px; font-weight: 700; color: var(--text-normal); }
  .ms-panel-body {
    flex: 1; overflow-y: auto; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 10px; scrollbar-width: thin;
  }
  .ms-section-label {
    font-size: 10px; font-weight: 700; color: var(--text-muted);
    text-transform: uppercase; letter-spacing: 0.07em;
    padding-bottom: 4px; border-bottom: 1px solid var(--background-modifier-border);
  }

  /* Panel Items */
  .ms-item {
    display: flex; align-items: center; gap: 10px;
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px; padding: 10px 12px; transition: border-color 0.15s;
  }
  .ms-item:hover { border-color: var(--color-accent); }
  .ms-item.drag-over-item {
    border-color: var(--color-accent);
    background: color-mix(in srgb, var(--color-accent) 5%, transparent);
  }
  .ms-avatar {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0; color: #fff;
  }
  .ms-mile-badge {
    width: 28px; height: 28px; border-radius: 6px;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 700; flex-shrink: 0; color: #fff;
  }
  .ms-item-info { flex: 1; min-width: 0; }
  .ms-item-name { font-size: 12px; font-weight: 600; color: var(--text-normal); }
  .ms-item-sub  { font-size: 10px; color: var(--text-muted); margin-top: 2px; }
  .ms-item-btns { display: flex; gap: 4px; flex-shrink: 0; }
  .ms-icon-btn {
    background: transparent; border: none; cursor: pointer;
    color: var(--text-muted); padding: 3px 6px;
    border-radius: 4px; font-size: 12px; transition: all 0.12s;
  }
  .ms-icon-btn:hover { background: var(--background-modifier-hover); color: var(--text-normal); }
  .ms-icon-btn.del:hover { color: #ef4444; background: color-mix(in srgb, #ef4444 10%, transparent); }
  .ms-drag-handle { cursor: grab; color: var(--text-faint); font-size: 14px; padding: 0 2px; user-select: none; flex-shrink: 0; }
  .ms-drag-handle:active { cursor: grabbing; }

  /* Progress */
  .ms-progress { height: 3px; background: var(--background-modifier-border); border-radius: 2px; overflow: hidden; margin-top: 5px; }
  .ms-progress-fill { height: 100%; border-radius: 2px; transition: width 0.4s; }

  /* Add Form */
  .ms-add-form {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 8px; padding: 12px 14px;
    display: flex; flex-direction: column; gap: 8px;
  }
  .ms-row { display: flex; gap: 8px; align-items: center; }
  .ms-small-input {
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    color: var(--text-normal); border-radius: 6px; padding: 6px 10px;
    font-size: 12px; outline: none; font-family: var(--font-interface);
    transition: border-color 0.15s; flex: 1; min-width: 0;
  }
  .ms-small-input:focus { border-color: var(--color-accent); }
  .ms-color-swatch {
    width: 32px; height: 32px; border-radius: 6px;
    border: 2px solid var(--background-modifier-border);
    cursor: pointer; flex-shrink: 0; transition: border-color 0.15s;
    padding: 2px;
  }
  .ms-color-swatch:hover { border-color: var(--color-accent); }
  .ms-color-swatch::-webkit-color-swatch-wrapper { padding: 0; }
  .ms-color-swatch::-webkit-color-swatch { border: none; border-radius: 4px; }

  /* Modal */
  .ms-overlay {
    position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(3px); z-index: 9999;
    display: flex; align-items: center; justify-content: center;
    animation: msIn 0.15s ease;
  }
  .ms-modal {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 12px; width: 480px; max-width: 95vw; max-height: 90vh;
    overflow-y: auto; box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
    animation: msSlide 0.18s ease;
  }
  @keyframes msSlide {
    from { transform: translateY(14px); opacity: 0; }
    to   { transform: none; opacity: 1; }
  }
  .ms-modal-hd {
    display: flex; align-items: center; justify-content: space-between;
    padding: 16px 20px 14px;
    border-bottom: 1px solid var(--background-modifier-border);
  }
  .ms-modal-title { font-size: 14px; font-weight: 700; }
  .ms-modal-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
  .ms-modal-ft {
    display: flex; gap: 8px; justify-content: flex-end;
    padding: 12px 20px 16px;
    border-top: 1px solid var(--background-modifier-border);
  }

  /* Form Elements */
  .ms-fg { display: flex; flex-direction: column; gap: 5px; }
  .ms-fl { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
  .ms-fi, .ms-fs, .ms-ft {
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    color: var(--text-normal); border-radius: 7px; padding: 8px 12px;
    font-family: var(--font-interface); font-size: 13px;
    outline: none; transition: border-color 0.15s; width: 100%;
    min-width: 0; box-sizing: border-box;
  }
  .ms-fi:focus, .ms-fs:focus, .ms-ft:focus { border-color: var(--color-accent); }
  .ms-ft { resize: vertical; min-height: 72px; }
  .ms-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

  /* Stats Dashboard */
  .ms-stats-dash {
    flex: 1; overflow-y: auto; padding: 20px 24px;
    display: flex; flex-direction: column; gap: 20px; scrollbar-width: thin;
  }
  .ms-stats-row {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 14px;
  }
  .ms-stats-card {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 10px; padding: 16px; text-align: center;
    transition: border-color 0.15s, transform 0.15s;
  }
  .ms-stats-card:hover { border-color: var(--color-accent); transform: translateY(-2px); }
  .ms-stats-card-icon {
    width: 40px; height: 40px; border-radius: 10px; margin: 0 auto 10px;
    display: flex; align-items: center; justify-content: center; font-size: 18px;
  }
  .ms-stats-card-value { font-size: 22px; font-weight: 700; color: var(--text-normal); line-height: 1.2; }
  .ms-stats-card-label { font-size: 11px; color: var(--text-muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }

  .ms-stats-charts {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;
  }
  .ms-chart-card {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 10px; padding: 16px;
    display: flex; flex-direction: column; gap: 10px;
  }
  .ms-chart-title {
    font-size: 12px; font-weight: 700; color: var(--text-normal);
    padding-bottom: 8px; border-bottom: 1px solid var(--background-modifier-border);
  }
  .ms-chart-row { display: flex; align-items: center; gap: 10px; }
  .ms-chart-label {
    font-size: 11px; color: var(--text-muted); width: 90px; flex-shrink: 0;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .ms-chart-bar-wrap {
    flex: 1; height: 10px; background: var(--background-modifier-border);
    border-radius: 5px; overflow: hidden;
  }
  .ms-chart-bar { height: 100%; border-radius: 5px; transition: width 0.5s ease; min-width: 2px; }
  .ms-chart-val { font-size: 11px; font-weight: 600; color: var(--text-normal); width: 32px; text-align: right; flex-shrink: 0; }

  /* Settings icon button (gear) */
  .ms-btn-icon {
    background: var(--background-primary); color: var(--text-muted);
    border: 1px solid var(--background-modifier-border);
    padding: 6px 10px; font-size: 14px; line-height: 1;
  }
  .ms-btn-icon:hover { border-color: var(--color-accent); color: var(--color-accent); }

  /* Settings Modal extras */
  .ms-modal-section { display: flex; flex-direction: column; gap: 12px; }
  .ms-modal-section-title {
    font-size: 15px; font-weight: 700; color: var(--text-normal);
    padding-bottom: 8px; border-bottom: 2px solid var(--background-modifier-border);
  }
  .ms-modal-section-hint {
    font-size: 11px; color: var(--text-muted); line-height: 1.6;
    padding: 8px 12px; background: var(--background-modifier-hover);
    border-radius: 6px; border-left: 3px solid var(--color-accent);
  }

  /* Tag Input */
  .ms-tag-wrap {
    display: flex; flex-wrap: wrap; gap: 5px; min-height: 38px;
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 7px; padding: 6px 10px; align-items: center;
    cursor: text; transition: border-color 0.15s;
  }
  .ms-tag-wrap:focus-within { border-color: var(--color-accent); }
  .ms-tag-pill {
    display: flex; align-items: center; gap: 3px; font-size: 11px;
    background: color-mix(in srgb, #a855f7 15%, transparent);
    color: #c084fc;
    border: 1px solid color-mix(in srgb, #a855f7 30%, transparent);
    border-radius: 4px; padding: 2px 7px;
  }
  .ms-tag-rm { cursor: pointer; opacity: 0.6; font-size: 13px; line-height: 1; }
  .ms-tag-rm:hover { opacity: 1; }
  .ms-bare {
    background: transparent; border: none; outline: none;
    color: var(--text-normal); font-size: 12px;
    flex: 1; min-width: 80px; font-family: var(--font-interface);
  }
`;
