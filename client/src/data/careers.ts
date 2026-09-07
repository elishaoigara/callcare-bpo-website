export type Job = {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  workArrangement: string;
  summary: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferredQualifications: string[];
  compensation: string;
  workingHours: string;
  status: "open" | "draft" | "closed";
  postedDate: string;
  closingDate?: string;
};

export const jobs: Job[] = [
  {
    id: "csr-001",
    slug: "customer-service-representative",
    title: "Customer Service Representative",
    department: "Customer Experience",
    location: "Nairobi, Kenya",
    employmentType: "Full-time",
    workArrangement: "Remote-first",
    summary: "Be the calm, capable voice behind customer experiences that people remember.",
    description:
      "You will support customers on behalf of growing global businesses, bringing empathy, clarity, and consistency to every interaction.",
    responsibilities: [
      "Respond to customer questions across phone, email, and chat.",
      "Resolve issues with patience, accuracy, and good judgment.",
      "Document conversations and follow agreed service processes.",
      "Share recurring customer insights with the wider team.",
    ],
    requirements: [
      "Strong written and spoken English.",
      "Reliable internet connection and a quiet work environment.",
      "A customer-first mindset and a willingness to learn.",
      "Comfort using digital tools and following clear processes.",
    ],
    preferredQualifications: [
      "Previous customer support or contact-centre experience.",
      "Experience with helpdesk, CRM, or live-chat tools.",
    ],
    compensation: "Discussed during the hiring process",
    workingHours: "Aligned to client coverage requirements",
    status: "open",
    postedDate: "2026-09-07",
  },
  {
    id: "sas-002",
    slug: "sales-appointment-setter",
    title: "Sales Appointment Setter",
    department: "Administrative Growth",
    location: "Kenya",
    employmentType: "Full-time",
    workArrangement: "Remote-first",
    summary: "Help ambitious businesses turn promising conversations into qualified opportunities.",
    description:
      "You will help our clients build a healthier pipeline through thoughtful outreach, careful qualification, and consistent follow-through.",
    responsibilities: [
      "Research prospects and prepare for outreach.",
      "Start professional conversations by phone, email, and social channels.",
      "Qualify opportunities against agreed criteria.",
      "Keep CRM records accurate and ready for the next conversation.",
    ],
    requirements: [
      "Confident communication and professional follow-up.",
      "Resilience, accountability, and comfort with targets.",
      "Organized approach to notes, tasks, and pipeline details.",
      "A genuine interest in helping businesses grow.",
    ],
    preferredQualifications: [
      "Sales, lead-generation, or appointment-setting experience.",
      "Familiarity with CRMs and outbound sales workflows.",
    ],
    compensation: "Discussed during the hiring process",
    workingHours: "Aligned to client coverage requirements",
    status: "open",
    postedDate: "2026-09-07",
  },
];

export const openJobs = jobs.filter((job) => job.status === "open");

export function getJobBySlug(slug: string) {
  return jobs.find((job) => job.slug === slug);
}
