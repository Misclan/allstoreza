import { useRef } from 'react';

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

export default function AvatarStrip({
  defaultAvatarUrl,
  activeCanvasUrl,
  savedOutfits,
  onLoad,
  onDelete,
  onUpload,
  onReset,
  onSaveOutfit,
}) {
  const fileRef = useRef();
  const canAdd = savedOutfits.length < 5; // max 5 saved + 1 default = 6 total

  return (
    <div className="avatar-strip-wrap">
      <div className="avatar-strip-scroll">

        {/* Slot 0: default avatar — always present */}
        <button
          type="button"
          className={`avatar-slot ${activeCanvasUrl === defaultAvatarUrl ? 'avatar-slot-active' : ''}`}
          onClick={onReset}
          title="Reset to default avatar"
        >
          <img src={defaultAvatarUrl} alt="Default avatar" />
          <span className="avatar-slot-label">Default</span>
        </button>

        {/* Saved fits */}
        {savedOutfits.map((outfit) => (
          <div
            key={outfit.id}
            className={`avatar-slot avatar-slot-saved ${activeCanvasUrl === outfit.url ? 'avatar-slot-active' : ''}`}
          >
            <img
              src={outfit.url}
              alt={outfit.label}
              onClick={() => onLoad(outfit)}
              style={{ cursor: 'pointer' }}
            />
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

        {/* Add new slot */}
        {canAdd && (
          <button
            type="button"
            className="avatar-slot avatar-slot-add"
            onClick={() => {
              if (activeCanvasUrl !== defaultAvatarUrl) {
                onSaveOutfit();
              } else {
                fileRef.current?.click();
              }
            }}
            title={activeCanvasUrl !== defaultAvatarUrl ? 'Save current fit' : 'Upload a photo'}
          >
            <span className="avatar-slot-plus">+</span>
            <span className="avatar-slot-label">
              {activeCanvasUrl !== defaultAvatarUrl ? 'Save fit' : 'Add'}
            </span>
          </button>
        )}
      </div>

      {/* Hidden file input for upload via camera icon in canvas */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => onUpload(e.target.files?.[0])}
      />

      {/* Expose fileRef so parent (camera icon) can trigger it */}
      <button
        type="button"
        className="camera-upload-btn"
        onClick={() => fileRef.current?.click()}
        title="Upload your photo"
        aria-label="Upload photo"
      >
        <CameraIcon />
      </button>
    </div>
  );
}
