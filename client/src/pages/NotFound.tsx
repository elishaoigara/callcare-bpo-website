import { ArrowRight } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";

export default function NotFound() {
  return (
    <div className="engagement-page">
      <PublicHeader current="" />
      <main className="cc-section">
        <div className="cc-container py-16">
          <p className="cc-kicker">404 / Page not found</p>
          <h1 className="mt-6 max-w-3xl">
            Let’s get you <em>back on track.</em>
          </h1>
          <p className="cc-intro mt-7">
            This page may have moved, or the link may be incomplete. You can
            explore our services or get in touch with the team.
          </p>
          <div className="cc-actions">
            <a href="/" className="cc-button">
              Back to Home <ArrowRight size={18} />
            </a>
            <a href="/contact" className="cc-text-link">
              Contact CallCare <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
