export interface Event {
  id: string;
  name: string;
  host: string;
  startTime: string; // ISO UTC
  endTime: string;   // ISO UTC
  description: string;
  joinUrl: string;
  category: string;
}

export const events: Event[] = [
  {
    id: '1',
    name: 'Verse Research Call',
    host: 'Verse Core Team',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours from now
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 25).toISOString(),
    description: 'Deep dive into the latest Verse protocol updates and research findings.',
    joinUrl: 'https://verse.bitcoin.com',
    category: 'Research',
  },
  {
    id: '2',
    name: 'Bitcoin Community Debate',
    host: 'JT',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hours from now
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    description: 'A lively debate on the future of Bitcoin scaling and adoption.',
    joinUrl: 'https://verse.bitcoin.com',
    category: 'Community',
  },
  {
    id: '3',
    name: 'Vibe Coding with Verse',
    host: 'Verse Developers',
    startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // Started 30 mins ago
    endTime: new Date(Date.now() + 1000 * 60 * 90).toISOString(), // Ends in 90 mins
    description: 'Live coding session building on the Verse ecosystem. Come vibe and build!',
    joinUrl: 'https://verse.bitcoin.com',
    category: 'Development',
  },
  {
    id: '4',
    name: 'Ecosystem Governance Vote',
    host: 'Verse DAO',
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString(),
    description: 'Reviewing the latest governance proposals for the Verse ecosystem.',
    joinUrl: 'https://verse.bitcoin.com',
    category: 'Governance',
  },
  {
    id: '5',
    name: 'Verse Weekly Roundup',
    host: 'Verse Marketing',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
    endTime: new Date(Date.now() + 1000 * 60 * 60 * (24 * 3 + 1)).toISOString(),
    description: 'Catch up on everything that happened in the Verse ecosystem this week.',
    joinUrl: 'https://verse.bitcoin.com',
    category: 'Marketing',
  }
];
