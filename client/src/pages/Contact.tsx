import {
  ArrowRight,
  ArrowUpRight,
  Globe2,
  Mail,
  MapPin,
  Phone,
  Radio,
} from "lucide-react";
import NairobiMap from "@/components/NairobiMap";
import PublicHeader from "@/components/PublicHeader";
import { publicContact } from "@/lib/publicContact";
import "./engagement.css";

export default function Contact() {
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
            <NairobiMap />
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
