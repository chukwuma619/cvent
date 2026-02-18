export type DummyCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
  /** Hex or CSS color (e.g. #3b82f6). */
  color: string;
};

export const DUMMY_CATEGORIES: DummyCategory[] = [
  {
    id: "meetup",
    name: "Meetup",
    description: "Community gatherings and networking events.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    color: "#6366f1",
  },
  {
    id: "workshop",
    name: "Workshop",
    description: "Hands-on sessions and skill-building events.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    color: "#f59e0b",
  },
  {
    id: "conference",
    name: "Conference",
    description: "Multi-track summits and industry conferences.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h20"/><path d="M5 20V8l7-4 7 4v12"/><path d="M5 12h14"/></svg>',
    color: "#0ea5e9",
  },
  {
    id: "demo",
    name: "Demo",
    description: "Product demos and showcase events.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    color: "#10b981",
  },
  {
    id: "talks",
    name: "Talks",
    description: "Talks, panels, and technical deep-dives.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    color: "#8b5cf6",
  },
  {
    id: "party",
    name: "Party",
    description: "Launch parties, socials, and celebrations.",
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3 2 22l10.7-3.79"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg>',
    color: "#ec4899",
  },
];

export function getCategoryById(id: string): DummyCategory | undefined {
  return DUMMY_CATEGORIES.find((c) => c.id === id);
}

/** Dummy user (host). Matches schema: event.hostedBy references user.id. */
export type DummyUser = {
  id: string;
  name: string;
};

export const DUMMY_USERS: DummyUser[] = [
  { id: "user-nervos", name: "Nervos Foundation" },
  { id: "user-ckb-dev", name: "CKB Dev Guild" },
  { id: "user-ecosystem-summit", name: "CKB Ecosystem Summit" },
  { id: "user-cvent", name: "cvent" },
  { id: "user-scaling-labs", name: "Scaling Labs" },
  { id: "user-berlin", name: "Berlin CKB Community" },
  { id: "user-devhub", name: "DevHub London" },
  { id: "user-asia-conf", name: "Asia Crypto Conference" },
  { id: "user-web3house", name: "Web3 House Lagos" },
  { id: "user-toronto", name: "Toronto CKB Meetup" },
  { id: "user-miami", name: "Miami Ecosystem" },
];

export function getHostById(id: string): DummyUser | undefined {
  return DUMMY_USERS.find((u) => u.id === id);
}

/** Dummy event attendee. Matches schema: event_attendee (eventId, userId). */
export type DummyEventAttendee = {
  eventId: string;
  userId: string;
};

/** Attendee counts per event id (used to build DUMMY_EVENT_ATTENDEES). */
const DUMMY_ATTENDEE_COUNTS: Record<string, number> = {
  "1": 42,
  "2": 28,
  "3": 156,
  "4": 19,
  "5": 34,
  "6": 87,
  "7": 22,
  "8": 31,
  "9": 412,
  "10": 15,
  "11": 26,
  "12": 64,
};

let _attendeeId = 0;
export const DUMMY_EVENT_ATTENDEES: DummyEventAttendee[] = Object.entries(
  DUMMY_ATTENDEE_COUNTS
).flatMap(([eventId, count]) =>
  Array.from({ length: count }, () => ({
    eventId,
    userId: `user-attendee-${++_attendeeId}`,
  }))
);

export function getAttendeesCountByEventId(eventId: string): number {
  return DUMMY_EVENT_ATTENDEES.filter((a) => a.eventId === eventId).length;
}

export type DummyEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  address: string;
  imageUrl: string;
  categoryId: string;
  city: string;
  continent: string;
  description: string;
  priceCents: number;
  currency: string;
  /** Host user id (references user.id in schema). */
  hostedBy: string;
};

export const DUMMY_EVENTS: DummyEvent[] = [
  {
    id: "1",
    title: "Nervos Community Meetup",
    date: "2025-03-15",
    time: "6:00 PM – 9:00 PM",
    address: "123 Innovation Hub, San Francisco, CA",
    imageUrl: "https://picsum.photos/seed/event1/400/240",
    categoryId: "meetup",
    city: "San Francisco",
    continent: "North America",
    description:
      "Join the Nervos community for an evening of networking, lightning talks, and demos. Connect with builders and enthusiasts in the CKB ecosystem. We'll cover recent protocol updates, dApp showcases, and proof-of-attendance use cases. Food and drinks provided.",
    priceCents: 0,
    currency: "USD",
    hostedBy: "user-nervos",
  },
  {
    id: "2",
    title: "Web3 Builders Workshop",
    date: "2025-03-18",
    time: "2:00 PM – 5:00 PM",
    address: "45 Developer Space, Austin, TX",
    imageUrl: "https://picsum.photos/seed/event2/400/240",
    categoryId: "workshop",
    city: "Austin",
    continent: "North America",
    description:
      "Hands-on workshop for developers building on Nervos CKB. Learn to deploy smart contracts, integrate JoyID and wallet connectors, and issue proof-of-attendance NFTs. Bring your laptop; we'll code together. Prior experience with TypeScript or Rust is helpful but not required.",
    priceCents: 2500,
    currency: "USD",
    hostedBy: "user-ckb-dev",
  },
  {
    id: "3",
    title: "CKB Ecosystem Summit",
    date: "2025-03-22",
    time: "10:00 AM – 6:00 PM",
    address: "789 Conference Center, New York, NY",
    imageUrl: "https://picsum.photos/seed/event3/400/240",
    categoryId: "conference",
    city: "New York",
    continent: "North America",
    description:
      "Full-day summit bringing together projects, investors, and developers in the CKB ecosystem. Keynotes from core contributors, panel discussions on scaling and UX, and an expo hall with live demos. Proof of attendance will be issued on-chain for all attendees.",
    priceCents: 9900,
    currency: "USD",
    hostedBy: "user-ecosystem-summit",
  },
  {
    id: "4",
    title: "Proof of Attendance Demo Day",
    date: "2025-03-25",
    time: "4:00 PM – 7:00 PM",
    address: "321 Tech Park, Seattle, WA",
    imageUrl: "https://picsum.photos/seed/event4/400/240",
    categoryId: "demo",
    city: "Seattle",
    continent: "North America",
    description:
      "See the latest tools and platforms for issuing and verifying proof of attendance on CKB. Demos from cvent and other builders, Q&A with the teams, and a chance to try the flow yourself. Perfect for event organizers and devs exploring PoA.",
    priceCents: 0,
    currency: "USD",
    hostedBy: "user-cvent",
  },
  {
    id: "5",
    title: "Layer 2 & Scaling Talks",
    date: "2025-03-28",
    time: "1:00 PM – 4:00 PM",
    address: "567 Blockchain Labs, Denver, CO",
    imageUrl: "https://picsum.photos/seed/event5/400/240",
    categoryId: "talks",
    city: "Denver",
    continent: "North America",
    description:
      "Technical deep-dives on Layer 2 solutions and scaling approaches in the Nervos ecosystem. Talks on Godwoken, rollups, and state channels, followed by an open discussion. Geared toward developers and researchers.",
    priceCents: 1500,
    currency: "USD",
    hostedBy: "user-scaling-labs",
  },
  {
    id: "6",
    title: "cvent Launch Party",
    date: "2025-04-01",
    time: "7:00 PM – 11:00 PM",
    address: "100 Main Street, Brooklyn, NY",
    imageUrl: "https://picsum.photos/seed/event6/400/240",
    categoryId: "party",
    city: "Brooklyn",
    continent: "North America",
    description:
      "Celebrate the launch of cvent — the event platform with proof of attendance on CKB. Live music, drinks, and the chance to mint your first PoA NFT at the door. Meet the team, discover upcoming events, and connect with the community.",
    priceCents: 2000,
    currency: "USD",
    hostedBy: "user-cvent",
  },
  {
    id: "7",
    title: "Berlin CKB Meetup",
    date: "2025-03-20",
    time: "7:00 PM – 10:00 PM",
    address: "Kreuzberg Coworking, Berlin, Germany",
    imageUrl: "https://picsum.photos/seed/event7/400/240",
    categoryId: "meetup",
    city: "Berlin",
    continent: "Europe",
    description:
      "Monthly Nervos meetup in Berlin. Casual hangout with local builders, updates from the ecosystem, and pizza. All welcome.",
    priceCents: 0,
    currency: "EUR",
    hostedBy: "user-berlin",
  },
  {
    id: "8",
    title: "Smart Contract Workshop",
    date: "2025-03-26",
    time: "9:00 AM – 5:00 PM",
    address: "DevHub London, London, UK",
    imageUrl: "https://picsum.photos/seed/event8/400/240",
    categoryId: "workshop",
    city: "London",
    continent: "Europe",
    description:
      "Full-day workshop on writing and deploying CKB smart contracts. From basics to testing and mainnet. Laptop required.",
    priceCents: 7500,
    currency: "GBP",
    hostedBy: "user-devhub",
  },
  {
    id: "9",
    title: "Asia Crypto Conference",
    date: "2025-04-10",
    time: "9:00 AM – 6:00 PM",
    address: "Marina Bay Sands, Singapore",
    imageUrl: "https://picsum.photos/seed/event9/400/240",
    categoryId: "conference",
    city: "Singapore",
    continent: "Asia",
    description:
      "Premier crypto and blockchain conference in Asia. Nervos and CKB track with keynotes, panels, and networking. Proof of attendance NFTs for all attendees.",
    priceCents: 29900,
    currency: "USD",
    hostedBy: "user-asia-conf",
  },
  {
    id: "10",
    title: "JoyID Integration Demo",
    date: "2025-04-05",
    time: "3:00 PM – 5:00 PM",
    address: "Web3 House, Lagos, Nigeria",
    imageUrl: "https://picsum.photos/seed/event10/400/240",
    categoryId: "demo",
    city: "Lagos",
    continent: "Africa",
    description:
      "Live demo of integrating JoyID and passkey auth into your dApp. Q&A and hands-on support. Free to attend.",
    priceCents: 0,
    currency: "USD",
    hostedBy: "user-web3house",
  },
  {
    id: "11",
    title: "Scaling & UX Talks",
    date: "2025-04-08",
    time: "6:00 PM – 8:30 PM",
    address: "Tech Hub, Toronto, ON",
    imageUrl: "https://picsum.photos/seed/event11/400/240",
    categoryId: "talks",
    city: "Toronto",
    continent: "North America",
    description:
      "An evening of short talks on scaling CKB apps and improving UX. Three speakers, open mic, and networking.",
    priceCents: 1000,
    currency: "USD",
    hostedBy: "user-toronto",
  },
  {
    id: "12",
    title: "Ecosystem Night",
    date: "2025-04-12",
    time: "8:00 PM – 1:00 AM",
    address: "Rooftop Bar, Miami, FL",
    imageUrl: "https://picsum.photos/seed/event12/400/240",
    categoryId: "party",
    city: "Miami",
    continent: "North America",
    description:
      "Quarterly ecosystem party. Music, open bar, and the chance to meet teams from across the Nervos ecosystem. 21+.",
    priceCents: 3500,
    currency: "USD",
    hostedBy: "user-miami",
  },
];

export function getEventById(id: string): DummyEvent | undefined {
  return DUMMY_EVENTS.find((e) => e.id === id);
}
