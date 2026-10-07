import { jobs } from "./careers";

export const siteOrigin = "https://www.callcarebpo.com";
export type PageDetails = {
  title: string;
  description: string;
  noindex?: boolean;
};
export const pageDetails: Record<string, PageDetails> = {
  "/billing": {
    title: "Orders & Billing | CallCare BPO",
    description: "Restricted CallCare billing workspace.",
    noindex: true,
  },
  "/orders": {
    title: "Your Order | CallCare BPO",
    description:
      "Review your agreed CallCare scope and payment details using your private order link.",
    noindex: true,
  },
  "/": {
    title: "CallCare BPO — Operational support that helps you scale",
    description:
      "CallCare BPO provides remote customer support, virtual assistance, sales and administrative support from Kenya, built around your business.",
  },
  "/operations": {
    title: "Our Operations | CallCare BPO",
    description:
      "See how CallCare prepares teams, runs workflows, monitors quality and reports on the work behind your outsourced operation.",
  },
  "/work-with-us": {
    title: "Let’s Work Together | CallCare BPO",
    description:
      "Tell CallCare about your workload, project or operational needs. Start a conversation about the people and support your business needs.",
  },
  "/contact": {
    title: "Contact | CallCare BPO",
    description:
      "Reach CallCare BPO by email or phone. Based in Nairobi, Kenya, with remote operations supporting businesses across markets.",
  },
  "/careers": {
    title: "Careers & Talent Pool | CallCare BPO",
    description:
      "Explore CallCare’s remote talent pools and share your experience for future customer support, sales, administration and specialist opportunities.",
  },
  "/privacy": {
    title: "Privacy Policy | CallCare BPO",
    description:
      "Learn how CallCare handles website inquiries, recruitment applications and personal information.",
  },
  "/terms": {
    title: "Terms & Conditions | CallCare BPO",
    description:
      "Read the terms for using CallCare’s website, service information and talent-pool application features.",
  },
  "/recruitment-preview": {
    title: "Recruitment Sign In | CallCare BPO",
    description: "Secure access for authorized CallCare recruitment staff.",
    noindex: true,
  },
  ...Object.fromEntries(
    jobs
      .filter(job => job.status === "open")
      .map(job => [
        `/careers/jobs/${job.slug}`,
        {
          title: `${job.title} Talent Pool | CallCare BPO`,
          description: job.summary,
        },
      ])
  ),
};
export const missingPage: PageDetails = {
  title: "Page Not Found | CallCare BPO",
  description:
    "This page could not be found. Explore CallCare’s services, operations or contact the team.",
  noindex: true,
};
export function getPageDetails(path: string) {
  return pageDetails[path.replace(/\/$/, "") || "/"] || missingPage;
}
