// Existing public details. Confirm any WhatsApp number before adding WhatsApp links.
export const publicContact = {
  email: "info@callcarebpo.com",
  phones: [
    { label: "+254 706 011 034", href: "tel:+254706011034" },
    { label: "+254 746 501 416", href: "tel:+254746501416" },
  ],
};

// Only use an approved HTTPS scheduling URL; otherwise offer to arrange a call by email.
const configuredBooking = import.meta.env.VITE_CALL_BOOKING_URL?.trim();
export const bookingUrl = configuredBooking?.startsWith("https://")
  ? configuredBooking
  : undefined;
export const callLink =
  bookingUrl ||
  `mailto:${publicContact.email}?subject=Arrange%20a%20CallCare%20call`;
export const callLabel = bookingUrl ? "Book a Call" : "Arrange a Call";
