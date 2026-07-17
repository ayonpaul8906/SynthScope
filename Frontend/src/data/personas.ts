export type Persona = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  personality: string[];
  goals: string[];
  frustrations: string[];
  tech: string;
  interests: string[];
  avatar: string;
  location: string;
  sentiment: "positive" | "neutral" | "negative";
};

const g = (seed: string) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6d28d9,3b82f6,d946ef`;

export const personas: Persona[] = [
  {
    id: "p1",
    name: "Aarav Mehta",
    age: 28,
    occupation: "Product Manager",
    personality: ["Analytical", "Ambitious", "Curious"],
    goals: ["Ship features fast", "Reduce user churn"],
    frustrations: ["Slow research cycles", "Vague user feedback"],
    tech: "Power user — Notion, Linear, Figma",
    interests: ["Startups", "Chess", "F1"],
    avatar: g("aarav"),
    location: "Bengaluru, IN",
    sentiment: "positive",
  },
  {
    id: "p2",
    name: "Sophia Nguyen",
    age: 34,
    occupation: "UX Researcher",
    personality: ["Empathetic", "Detail-oriented", "Patient"],
    goals: ["Deep behavioral insights", "Validate hypotheses"],
    frustrations: ["Recruiting participants", "Bias in samples"],
    tech: "Expert — Dovetail, Miro, Figma",
    interests: ["Photography", "Cooking", "Ceramics"],
    avatar: g("sophia"),
    location: "Toronto, CA",
    sentiment: "positive",
  },
  {
    id: "p3",
    name: "Diego Alvarez",
    age: 41,
    occupation: "SMB Owner",
    personality: ["Practical", "Skeptical", "Time-starved"],
    goals: ["Grow revenue", "Automate operations"],
    frustrations: ["Complex onboarding", "Hidden pricing"],
    tech: "Casual — WhatsApp, Excel, Instagram",
    interests: ["Football", "Family", "Local food"],
    avatar: g("diego"),
    location: "Madrid, ES",
    sentiment: "neutral",
  },
  {
    id: "p4",
    name: "Priya Sharma",
    age: 24,
    occupation: "Grad Student",
    personality: ["Creative", "Idealistic", "Social"],
    goals: ["Learn quickly", "Build portfolio"],
    frustrations: ["Expensive tools", "Steep learning curves"],
    tech: "Digital native — TikTok, Notion, ChatGPT",
    interests: ["AI art", "K-pop", "Sustainability"],
    avatar: g("priya"),
    location: "Mumbai, IN",
    sentiment: "positive",
  },
  {
    id: "p5",
    name: "Marcus Johnson",
    age: 52,
    occupation: "Enterprise Architect",
    personality: ["Cautious", "Systematic", "Experienced"],
    goals: ["Security & compliance", "Long-term stability"],
    frustrations: ["Immature vendors", "Frequent UI changes"],
    tech: "Enterprise — Jira, Confluence, Splunk",
    interests: ["Golf", "History", "Bourbon"],
    avatar: g("marcus"),
    location: "Austin, US",
    sentiment: "negative",
  },
  {
    id: "p6",
    name: "Yuki Tanaka",
    age: 31,
    occupation: "Indie Developer",
    personality: ["Independent", "Focused", "Playful"],
    goals: ["Build in public", "Reach ramen profitability"],
    frustrations: ["Marketing overhead", "Context switching"],
    tech: "Expert — VS Code, Vercel, Twitter/X",
    interests: ["Anime", "Bouldering", "Espresso"],
    avatar: g("yuki"),
    location: "Tokyo, JP",
    sentiment: "positive",
  },
  {
    id: "p7",
    name: "Amara Okafor",
    age: 29,
    occupation: "Growth Marketer",
    personality: ["Data-driven", "Persuasive", "Trend-savvy"],
    goals: ["Lower CAC", "Scale funnels"],
    frustrations: ["Attribution gaps", "Ad fatigue"],
    tech: "Advanced — HubSpot, Segment, Mixpanel",
    interests: ["Afrobeats", "Running", "Fashion"],
    avatar: g("amara"),
    location: "Lagos, NG",
    sentiment: "neutral",
  },
  {
    id: "p8",
    name: "Elena Rossi",
    age: 38,
    occupation: "Design Director",
    personality: ["Visionary", "Perfectionist", "Diplomatic"],
    goals: ["Elevate brand", "Mentor team"],
    frustrations: ["Design debt", "Slow stakeholders"],
    tech: "Expert — Figma, Framer, Rive",
    interests: ["Architecture", "Wine", "Travel"],
    avatar: g("elena"),
    location: "Milan, IT",
    sentiment: "positive",
  },
];

export const industries = [
  "SaaS",
  "Fintech",
  "Healthcare",
  "E-commerce",
  "EdTech",
  "Gaming",
  "Media",
  "Enterprise",
];
export const goals = [
  "Product validation",
  "Feature discovery",
  "Pricing research",
  "Onboarding audit",
  "Positioning",
  "Brand perception",
];
