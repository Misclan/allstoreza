import { useRef } from 'react';

const TrashIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

// hasActiveOutfit: true when something is dressed (items selected OR custom avatar)
export default function AvatarStrip({
  defaultAvatarUrl, activeCanvasUrl,
  savedOutfits, onLoad, onDelete,
  onUpload, onReset, onSaveOutfit,
  fileInputRef,
  hasActiveOutfit,
}) {
  const localRef = useRef();
  const inputRef = fileInputRef || localRef;
  const canAdd   = savedOutfits.length < 10;
  const isDefault = activeCanvasUrl === defaultAvatarUrl;

  return (
    <div className="avatar-strip-wrap">
      {/* Hidden file input — only triggered by camera button on canvas */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => onUpload(e.target.files?.[0])}
      />

      <div className="avatar-strip-scroll">
        {/* Default slot */}
        <button
          type="button"
          className={`avatar-slot ${isDefault ? 'avatar-slot-active' : ''}`}
          onClick={onReset}
          title="Reset to default avatar"
        >
          <img src={defaultAvatarUrl} alt="Default" />
          <span className="avatar-slot-label">Default</span>
        </button>

        {/* Saved looks */}
        {savedOutfits.map(outfit => (
          <div
            key={outfit.id}
            className={`avatar-slot avatar-slot-saved ${activeCanvasUrl === outfit.url ? 'avatar-slot-active' : ''}`}
          >
            <img src={outfit.url} alt={outfit.label} onClick={() => onLoad(outfit)} />
            <button
              type="button"
              className="avatar-slot-trash"
              onClick={() => onDelete(outfit.id)}
              aria-label={`Delete ${outfit.label}`}
            >
              <TrashIcon />
            </button>
            <span className="avatar-slot-label">{outfit.label}</span>
          </div>
        ))}

        {/* Save Look slot — only visible when there's something to save */}
        {canAdd && hasActiveOutfit && (
          <button
            type="button"
            className="avatar-slot avatar-slot-add"
            onClick={onSaveOutfit}
            title="Save this look to your wardrobe"
          >
            <span className="avatar-slot-plus">+</span>
            <span className="avatar-slot-label">Save look</span>
          </button>
        )}
      </div>
    </div>
  );
}
