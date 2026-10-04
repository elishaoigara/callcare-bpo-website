import { useState } from "react";
import { ArrowUpRight } from "lucide-react";

// Nairobi city center, never an office address. OSM's documented Web Mercator formula:
// https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames
const latitude = -1.2875;
const longitude = 36.822;
const zoom = 12;
const count = 2 ** zoom;
const radians = (latitude * Math.PI) / 180;
const x = ((longitude + 180) / 360) * count;
const y =
  ((1 - Math.log(Math.tan(radians) + 1 / Math.cos(radians)) / Math.PI) / 2) *
  count;
const tiles = [-1, 0, 1].flatMap(row =>
  [-1, 0, 1].map(column => ({
    url: `https://tile.openstreetmap.org/${zoom}/${Math.floor(x) + column}/${Math.floor(y) + row}.png`,
    left: (column + 1) * 256,
    top: (row + 1) * 256,
  }))
);

export default function NairobiMap() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="nairobi-map">
      {loaded && !failed ? (
        <>
          <div
            className="map-tiles"
            role="img"
            aria-label="Map centered on Nairobi, Kenya — city location, not an office address"
            style={{
              marginLeft: -(256 + (x % 1) * 256),
              marginTop: -(256 + (y % 1) * 256),
            }}
          >
            {tiles.map(tile => (
              <img
                key={tile.url}
                src={tile.url}
                alt=""
                width={256}
                height={256}
                style={{ left: tile.left, top: tile.top }}
                referrerPolicy="strict-origin-when-cross-origin"
                onError={() => setFailed(true)}
              />
            ))}
          </div>
          <a
            className="map-attribution"
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
          >
            © OpenStreetMap contributors
          </a>
        </>
      ) : (
        <div className="map-preview" aria-label="Illustrative city map preview">
          <div className="map-road map-road-one" />
          <div className="map-road map-road-two" />
          <div className="map-road map-road-three" />
          <span className="map-place map-place-top">Kenya</span>
          <span className="map-place map-place-bottom">City location</span>
        </div>
      )}
      <div className="map-marker" aria-hidden="true">
        <img src="/brand/callcare-symbol-exact.svg" alt="" />
        <span>Nairobi</span>
      </div>
      {!loaded ? (
        <div className="map-load">
          <button
            type="button"
            className="cc-button"
            onClick={() => setLoaded(true)}
          >
            View Nairobi Map <ArrowUpRight size={16} />
          </button>
          <span>Loads OpenStreetMap. Marker indicates the city.</span>
        </div>
      ) : (
        <div className="map-open">
          {failed && <span role="status">The map couldn’t load here.</span>}
          <a
            href="https://www.openstreetmap.org/?mlat=-1.2875&mlon=36.822#map=12/-1.2875/36.822"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open full map <ArrowUpRight size={14} />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </div>
      )}
    </div>
  );
}
