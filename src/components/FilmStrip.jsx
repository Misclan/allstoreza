export default function FilmStrip({ outfits, onLoad }) {
  if (!outfits.length) return null;

  return (
    <div className="filmstrip-wrap">
      <span className="filmstrip-label">Saved fits</span>
      <div className="filmstrip-scroll">
        {outfits.map((outfit) => (
          <button
            key={outfit.id}
            className="filmstrip-thumb"
            onClick={() => onLoad(outfit)}
            title={outfit.label}
            type="button"
          >
            <img src={outfit.url} alt={outfit.label} />
            <span className="filmstrip-fit-label">{outfit.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
