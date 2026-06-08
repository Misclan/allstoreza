export default function WardrobeTray({ items, onSelect, selectedItems }) {
  if (items.length === 0) {
    return <p className="footer-note">No wardrobe items found. Upload a photo to save new fits.</p>;
  }

  return (
    <div className="wardrobe-grid">
      {items.map((item) => {
        const isActive = selectedItems?.some((s) => s.id === item.id);
        return (
          <div key={item.id} className={`item-card wardrobe-card ${isActive ? 'item-card-active' : ''}`}>
            <div className="item-row">
              <img className="wardrobe-thumb" src={item.processedImageUrl} alt={item.title} />
              <div>
                <h3>{item.title}</h3>
                <p>{item.layerType.replace('_', ' ')}</p>
              </div>
            </div>
            <button className="button" type="button" onClick={() => onSelect(item)}>
              {isActive ? '✓ Applied' : 'Apply layer'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
