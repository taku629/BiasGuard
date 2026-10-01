export interface Evidence {
  id: string;
  direction: 'bullish' | 'bearish';
  headline: string;
  summary: string;
}

export interface SelectiveExposureItem {
  id: string;
  version: string;
  companyName: string;
  scenario: string;
  evidence: Evidence[]; // exactly 4 items, 2 bullish, 2 bearish
}

export const selectiveExposureV1: SelectiveExposureItem[] = [
  {
    id: 'se_v1_001',
    version: '1.0',
    companyName: 'ZephyrTech',
    scenario: 'ZephyrTech just announced a revolutionary battery technology that claims to double EV range. However, their R&D costs have skyrocketed.',
    evidence: [
      { id: 'ev_1_bull', direction: 'bullish', headline: 'Analysts predict 300% growth in EV battery market', summary: 'Major market expansion expected to heavily favor early innovators.' },
      { id: 'ev_2_bull', direction: 'bullish', headline: 'ZephyrTech secures major OEM partnership', summary: 'A top automaker has signed a preliminary agreement to use the new batteries.' },
      { id: 'ev_1_bear', direction: 'bearish', headline: 'Prototype failures leaked to press', summary: 'Internal documents suggest the battery struggles with overheating in cold weather.' },
      { id: 'ev_2_bear', direction: 'bearish', headline: 'Competitor files patent infringement lawsuit', summary: 'A rival firm claims ZephyrTech stole key chemical processes.' }
    ]
  },
  {
    id: 'se_v1_002',
    version: '1.0',
    companyName: 'AquaFarms',
    scenario: 'AquaFarms is pioneering offshore kelp farming for biofuel. They just received a massive government grant.',
    evidence: [
      { id: 'ev_1_bull', direction: 'bullish', headline: 'Government mandates 10% biofuel blend', summary: 'New legislation will force refineries to buy biofuel at premium prices.' },
      { id: 'ev_2_bull', direction: 'bullish', headline: 'Yields exceed initial projections by 40%', summary: 'The latest harvest was significantly larger than anticipated.' },
      { id: 'ev_1_bear', direction: 'bearish', headline: 'Environmental groups protest ocean disruption', summary: 'Activists are lobbying to revoke the farming permits.' },
      { id: 'ev_2_bear', direction: 'bearish', headline: 'Processing costs remain prohibitively high', summary: 'Turning kelp into fuel is currently costing more than oil.' }
    ]
  },
  {
    id: 'se_v1_003',
    version: '1.0',
    companyName: 'OmniHealth',
    scenario: 'OmniHealth launched an AI-driven diagnostic app. User adoption is growing rapidly, but regulatory scrutiny is increasing.',
    evidence: [
      { id: 'ev_1_bull', direction: 'bullish', headline: 'User retention hits all-time high', summary: 'Patients are using the app daily for health tracking.' },
      { id: 'ev_2_bull', direction: 'bullish', headline: 'Study shows 95% diagnostic accuracy', summary: 'A preliminary study indicates the AI performs on par with human doctors.' },
      { id: 'ev_1_bear', direction: 'bearish', headline: 'FDA threatens to suspend app distribution', summary: 'Regulators cite concerns over unverified medical advice.' },
      { id: 'ev_2_bear', direction: 'bearish', headline: 'Data privacy breach exposes user records', summary: 'Hackers accessed thousands of sensitive patient profiles.' }
    ]
  },
  {
    id: 'se_v1_004',
    version: '1.0',
    companyName: 'LunarMining Corp',
    scenario: 'LunarMining Corp plans to extract rare earth metals from asteroids. They just successfully launched their first scout probe.',
    evidence: [
      { id: 'ev_1_bull', direction: 'bullish', headline: 'Probe confirms massive platinum deposits', summary: 'Initial scans show incredible resource density on the target asteroid.' },
      { id: 'ev_2_bull', direction: 'bullish', headline: 'Billionaire investor injects $500M into project', summary: 'Fresh capital ensures operations can continue for the next 5 years.' },
      { id: 'ev_1_bear', direction: 'bearish', headline: 'Key engineers leave for rival aerospace firm', summary: 'Brain drain could severely delay the extraction timeline.' },
      { id: 'ev_2_bear', direction: 'bearish', headline: 'Cost of return vehicle exceeds estimates by 3x', summary: 'Bringing the materials back to Earth may not be economically viable.' }
    ]
  },
  {
    id: 'se_v1_005',
    version: '1.0',
    companyName: 'NeuroLink Games',
    scenario: 'NeuroLink Games released a direct-to-brain VR headset. Sales are booming, but some users report severe headaches.',
    evidence: [
      { id: 'ev_1_bull', direction: 'bullish', headline: 'Pre-orders for Gen 2 headset sell out in minutes', summary: 'Consumer demand vastly outstrips current supply capabilities.' },
      { id: 'ev_2_bull', direction: 'bullish', headline: 'Major AAA studio announces exclusive game', summary: 'The biggest game of the year will only be playable on NeuroLink.' },
      { id: 'ev_1_bear', direction: 'bearish', headline: 'Class action lawsuit filed over neurological side effects', summary: 'Thousands of users claim the device causes chronic migraines.' },
      { id: 'ev_2_bear', direction: 'bearish', headline: 'Retailers halt sales pending safety review', summary: 'Several major electronics chains have pulled the product from shelves.' }
    ]
  }
];
