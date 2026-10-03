import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Radio,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import { publicContact } from "@/lib/publicContact";
import "./engagement.css";

export default function Contact() {
  const [mapLoaded, setMapLoaded] = useState(false);
  useEffect(() => {
    const previous = document.title;
    document.title = "Contact | CallCare BPO";
    return () => {
      document.title = previous;
    };
  }, []);
  return (
    <div className="engagement-page contact-page">
      <a href="#contact-content" className="cc-skip">
        Skip to content
      </a>
      <PublicHeader current="/contact" />
      <main id="contact-content">
        <section className="cc-section contact-hero">
          <div className="cc-container">
            <p className="cc-kicker">Contact CallCare</p>
            <h1>
              Let’s <em>Talk.</em>
            </h1>
            <h2>We’re here when you need us.</h2>
            <p>
              Whether you have a question, want to learn more about CallCare, or
              simply want to say hello, you can reach us here.
            </p>
          </div>
        </section>
        <section className="cc-section location-section">
          <div className="cc-container location-grid">
            <div>
              <p className="cc-kicker">Our home base</p>
              <h2>
                Based in Kenya.
                <br />
                <em>Built to Work Beyond Borders.</em>
              </h2>
              <p className="cc-intro">
                Supporting businesses remotely from Kenya, with operations
                designed to work across different markets and time zones.
              </p>
              <div className="location-caption">
                <MapPin size={20} />
                <div>
                  <strong>Nairobi, Kenya</strong>
                  <span>Kenya-based operations. Remote delivery.</span>
                </div>
              </div>
            </div>
            <div className="nairobi-map">
              {mapLoaded ? (
                <iframe
                  title="Map centered on Nairobi, Kenya — city location, not an office address"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=36.754%2C-1.335%2C36.89%2C-1.24&layer=mapnik&marker=-1.2875%2C36.822"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="map-preview"
                  aria-label="Illustrative city map preview"
                >
                  <div className="map-road map-road-one" />
                  <div className="map-road map-road-two" />
                  <div className="map-road map-road-three" />
                  <span className="map-place map-place-top">Kenya</span>
                  <span className="map-place map-place-bottom">
                    City location
                  </span>
                </div>
              )}
              <div
                className={mapLoaded ? "map-brand" : "map-marker"}
                aria-hidden="true"
              >
                <img src="/brand/callcare-symbol-exact.svg" alt="" />
                <span>Nairobi</span>
              </div>
              {!mapLoaded && (
                <div className="map-load">
                  <button
                    type="button"
                    className="cc-button"
                    onClick={() => setMapLoaded(true)}
                  >
                    View Nairobi Map <ArrowUpRight size={16} />
                  </button>
                  <span>Loads OpenStreetMap. Marker indicates the city.</span>
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="cc-section contact-details">
          <div className="cc-container">
            <p className="cc-kicker">Reach us directly</p>
            <h2>A simple way to connect.</h2>
            <div className="contact-card-grid">
              <article>
                <Mail />
                <h3>Email</h3>
                <a href={`mailto:${publicContact.email}`}>
                  {publicContact.email} <ArrowUpRight size={16} />
                </a>
              </article>
              <article>
                <Phone />
                <h3>Phone</h3>
                {publicContact.phones.map(phone => (
                  <a key={phone.href} href={phone.href}>
                    {phone.label} <ArrowUpRight size={16} />
                  </a>
                ))}
              </article>
              <article>
                <MapPin />
                <h3>Location</h3>
                <p>Nairobi, Kenya</p>
              </article>
              <article>
                <Radio />
                <h3>Delivery Model</h3>
                <p>Remote / Distributed Operations</p>
              </article>
            </div>
          </div>
        </section>
        <section className="delivery-section">
          <div className="cc-container delivery-flow">
            <div>
              <MapPin />
              <span>Nairobi, Kenya</span>
            </div>
            <ArrowRight className="delivery-arrow" aria-hidden="true" />
            <div>
              <Radio />
              <span>Remote Operations</span>
            </div>
            <ArrowRight className="delivery-arrow" aria-hidden="true" />
            <div>
              <Globe2 />
              <span>Clients Around the World</span>
            </div>
          </div>
        </section>
        <section className="cc-section contact-final">
          <div className="cc-container">
            <p className="cc-kicker">Have a business need?</p>
            <h2>Looking to work with CallCare?</h2>
            <p>Let’s figure out the right team for you.</p>
            <a href="/work-with-us" className="cc-button">
              Let’s Work Together <ArrowRight size={18} />
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
