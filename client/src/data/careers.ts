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
  talentPool: boolean;
  standoutQualities: string[];
  portfolioRequired?: boolean;
};

const shared = {
  location: "Kenya",
  employmentType: "Full-time / Contract opportunities",
  workArrangement: "Remote",
  compensation: "Discussed when a suitable client opportunity opens",
  workingHours: "May align with international client time zones",
  status: "open" as const,
  postedDate: "2026-09-09",
  talentPool: true,
};

export const jobs: Job[] = [
  {
    ...shared,
    id: "ea-001",
    slug: "executive-assistant",
    title: "Executive Assistant",
    department: "Administrative & Executive Support",
    summary: "Bring structure, foresight, and dependable support to the work behind ambitious leaders.",
    description: "CallCare is building a talent pool of highly organized, proactive, and dependable Executive Assistants to support executives, founders, and growing businesses across industries and time zones.",
    responsibilities: [
      "Manage calendars, meetings, appointments, and schedules across time zones.",
      "Manage inboxes, correspondence, action items, tasks, deadlines, and follow-ups.",
      "Conduct research and prepare reports, presentations, documents, and business materials.",
      "Coordinate travel, reservations, clients, teams, and external stakeholders.",
      "Maintain CRM and project-management systems while handling confidential information professionally.",
      "Identify problems proactively and provide general administrative and operational support.",
    ],
    requirements: [
      "Previous experience as an Executive Assistant, Virtual Assistant, Administrative Assistant, or similar.",
      "Excellent written and verbal communication, organization, and time management.",
      "Strong attention to detail, problem-solving ability, and confidence managing multiple priorities.",
      "Ability to work independently, learn software and processes quickly, and communicate professionally.",
      "Reliable computer and internet connection with flexibility for international clients and time zones.",
    ],
    preferredQualifications: [
      "Proactive, organized, reliable, resourceful, discreet, and detail-oriented.",
    ],
    standoutQualities: ["Proactive", "Organized", "Reliable", "Resourceful", "Discreet", "Detail-oriented"],
  },
  {
    ...shared,
    id: "csr-001",
    slug: "customer-service-representative",
    title: "Customer Service Representative",
    department: "Customer Experience",
    summary: "Be the calm, capable voice behind customer experiences that make people feel heard and valued.",
    description: "CallCare is building a talent pool of customer service professionals who understand that excellent service goes beyond answering questions. Our representatives help customers feel supported while representing clients with professionalism.",
    responsibilities: [
      "Handle inbound and outbound customer interactions across phone, email, chat, and other channels.",
      "Respond to questions, resolve issues, provide accurate information, and handle complaints professionally.",
      "Document interactions accurately, update CRM and customer records, and follow client processes.",
      "Escalate complex issues appropriately and meet quality, productivity, and satisfaction targets.",
    ],
    requirements: [
      "Previous customer service or call-center experience is preferred.",
      "Excellent spoken and written English with strong communication and listening skills.",
      "Patience, empathy, problem-solving ability, and the ability to remain calm under pressure.",
      "Comfort using computers, CRM systems, customer-support tools, and structured processes.",
      "Reliable computer and internet connection with flexibility for client shifts.",
    ],
    preferredQualifications: [
      "Empathetic, patient, professional, clear, resilient, and solution-oriented.",
    ],
    standoutQualities: ["Empathetic", "Patient", "Professional", "Clear", "Resilient", "Solution-oriented"],
  },
  {
    ...shared,
    id: "csm-001",
    slug: "customer-success-manager",
    title: "Customer Success Manager",
    department: "Customer Success & Account Management",
    summary: "Help businesses build lasting customer relationships, improve retention, and find room to grow.",
    description: "CallCare is building a talent pool of Customer Success professionals who understand customer needs, improve the experience, reduce churn, and identify opportunities for sustainable growth.",
    responsibilities: [
      "Manage customer relationships and serve as a primary point of contact for assigned accounts.",
      "Monitor satisfaction, engagement, account health, customer activity, and performance.",
      "Conduct customer check-ins and business reviews while identifying opportunities to add value.",
      "Identify retention risks, resolve escalated concerns, and coordinate with sales, support, and operations.",
      "Analyze feedback, prepare reports, and develop strategies to improve retention and satisfaction.",
      "Identify appropriate upselling and cross-selling opportunities.",
    ],
    requirements: [
      "Previous experience in Customer Success, Account Management, Client Services, or a related role.",
      "Strong relationship-management, communication, organization, and problem-solving skills.",
      "Customer-focused mindset, commercial awareness, and ability to manage multiple priorities.",
      "Comfort working with CRM and reporting tools and independently supporting international clients.",
    ],
    preferredQualifications: [
      "Relationship-driven, strategic, proactive, commercially aware, customer-focused, and analytical.",
      "Experience working with international clients is an advantage.",
    ],
    standoutQualities: ["Relationship-driven", "Strategic", "Proactive", "Commercially aware", "Customer-focused", "Analytical"],
  },
  {
    ...shared,
    id: "design-001",
    slug: "web-graphic-designer",
    title: "Web & Graphic Designer",
    department: "Creative & Digital",
    summary: "Turn brands, products, and ideas into compelling digital experiences and visual content.",
    description: "CallCare is building a creative talent pool of Web and Graphic Designers. We are interested in both specialists and versatile creatives who can work across web, branding, marketing, and digital design.",
    responsibilities: [
      "Design responsive websites, landing pages, UI/UX experiences, and digital interfaces.",
      "Maintain and update websites and create e-commerce experiences where required.",
      "Create brand identities, social graphics, digital advertisements, presentations, and marketing materials.",
      "Design brochures, flyers, email assets, and other visual content while maintaining brand consistency.",
      "Collaborate with developers and marketing teams, interpret creative briefs, and implement feedback.",
    ],
    requirements: [
      "Proven experience in web design, graphic design, or a related field.",
      "Strong portfolio demonstrating your work, with a good understanding of design principles.",
      "Strong visual thinking, attention to detail, deadline management, and communication skills.",
      "Ability to work independently, collaborate well, and receive and implement feedback.",
    ],
    preferredQualifications: [
      "Experience with Figma, Adobe Creative Suite, Photoshop, Illustrator, Canva, Webflow, WordPress, HTML/CSS, JavaScript, or React.",
      "Web professionals should understand responsive design, UX/UI principles, and different screen sizes.",
    ],
    standoutQualities: ["Creative", "Detail-oriented", "Adaptable", "Curious", "Innovative", "Deadline-driven"],
    portfolioRequired: true,
  },
  {
    ...shared,
    id: "sdr-001",
    slug: "sales-development-representative",
    title: "Sales Development Representative",
    department: "Sales & Business Development",
    summary: "Create meaningful sales opportunities by reaching the right prospects, qualifying genuine needs, and booking quality meetings.",
    description: "CallCare is building a talent pool of motivated Sales Development Representatives who can help businesses identify, engage, and qualify potential customers. SDRs will support clients through outbound prospecting, relationship-building, and qualified meeting generation for sales teams.",
    responsibilities: [
      "Research and identify potential prospects through client-approved channels.",
      "Conduct outbound calls and send personalized email and LinkedIn outreach.",
      "Qualify leads using client-defined criteria and identify customer needs, pain points, and buying signals.",
      "Schedule qualified appointments and sales meetings and follow up consistently with prospects.",
      "Maintain accurate lead, activity, and prospect records in CRM systems.",
      "Meet daily and weekly activity targets while tracking outreach and appointment-setting performance.",
      "Work closely with Account Executives and sales teams while following client scripts, processes, and messaging.",
      "Handle objections professionally and confidently.",
    ],
    requirements: [
      "Previous experience in SDR, BDR, appointment setting, inside sales, or outbound sales is preferred.",
      "Excellent spoken and written English with strong communication and interpersonal skills.",
      "Comfort making outbound calls and confidence speaking with decision-makers and prospects.",
      "Strong listening, questioning, research, prospecting, organization, and follow-up skills.",
      "Ability to handle rejection, remain persistent, work independently, and stay target-driven.",
      "Good CRM and computer skills with a reliable computer and internet connection.",
      "Flexibility to work with international clients and time zones.",
    ],
    preferredQualifications: [
      "Experience with HubSpot, Salesforce, Pipedrive, LinkedIn Sales Navigator, Apollo, ZoomInfo, Google Workspace, Slack, dialers, or client-specific sales platforms.",
      "Confident, persistent, curious, persuasive, resilient, and results-driven.",
      "Success means consistently reaching the right prospects, having meaningful conversations, qualifying genuine opportunities, booking quality meetings, maintaining accurate CRM records, and meeting or exceeding performance targets.",
    ],
    standoutQualities: ["Confident", "Persistent", "Curious", "Persuasive", "Resilient", "Results-driven"],
  },
  {
    ...shared,
    id: "data-001",
    slug: "data-analytics-professional",
    title: "Data & Analytics Professional",
    department: "Data & Analytics",
    summary: "Turn accurate records and meaningful analysis into better business decisions.",
    description: "CallCare is building a talent pool of detail-oriented data professionals across data entry, processing, cleaning, validation, research, analysis, reporting, business intelligence, visualization, and operations analytics.",
    responsibilities: [
      "Enter, maintain, clean, organize, validate, and quality-check data.",
      "Conduct data research and collection while maintaining spreadsheets and databases.",
      "Create reports and dashboards, analyze trends, and prepare regular operational updates.",
      "Extract insights from datasets and support business decision-making through data.",
      "Document processes and findings and work with teams to improve accuracy and reporting.",
    ],
    requirements: [
      "Strong attention to detail, organization, analytical thinking, and problem-solving ability.",
      "Good Excel and/or Google Sheets skills with strong numerical and logical reasoning.",
      "Ability to work with large amounts of information, identify inconsistencies, and meet deadlines.",
      "Good written communication and ability to work independently.",
    ],
    preferredQualifications: [
      "Experience with Excel, Google Sheets, SQL, Power BI, Tableau, Looker Studio, Python, or client databases.",
      "Accurate, analytical, curious, methodical, detail-oriented, and data-driven.",
    ],
    standoutQualities: ["Accurate", "Analytical", "Curious", "Methodical", "Detail-oriented", "Data-driven"],
  },
];

export const openJobs = jobs.filter((job) => job.status === "open");

export function getJobBySlug(slug: string) {
  return jobs.find((job) => job.slug === slug);
}
