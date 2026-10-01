export interface ReferencePriceItem {
  id: string;
  version: string;
  scenario: string;
  financialFacts: string;
  referencePrice: number;
  normativeEstimate: number;
  anchorType: 'high' | 'low';
}

export const referencePriceV1: ReferencePriceItem[] = [
  {
    id: 'rp_v1_001_low',
    version: '1.0',
    scenario: 'You are evaluating a mature retail company. They just sold a minor subsidiary.',
    financialFacts: 'The company generates $50 per share in revenue. Industry average price-to-revenue ratio is 2.0x. Therefore, fair value is typically $100.',
    referencePrice: 40, // low anchor
    normativeEstimate: 100,
    anchorType: 'low'
  },
  {
    id: 'rp_v1_002_high',
    version: '1.0',
    scenario: 'You are valuing a new tech startup entering the cloud storage market.',
    financialFacts: 'Based on discounted cash flow projections, the objective present value of their future earnings is $20 per share.',
    referencePrice: 80, // high anchor
    normativeEstimate: 20,
    anchorType: 'high'
  },
  {
    id: 'rp_v1_003_low',
    version: '1.0',
    scenario: 'You are estimating the fair price of a rare vintage watch at auction.',
    financialFacts: 'Recent appraisals and similar auction results consistently place the watch\'s value at exactly $15,000.',
    referencePrice: 5000, // low anchor
    normativeEstimate: 15000,
    anchorType: 'low'
  },
  {
    id: 'rp_v1_004_high',
    version: '1.0',
    scenario: 'You are assessing the replacement cost of a specialized manufacturing machine.',
    financialFacts: 'The manufacturer sells this exact model brand new, including installation and warranty, for $250,000.',
    referencePrice: 500000, // high anchor
    normativeEstimate: 250000,
    anchorType: 'high'
  },
  {
    id: 'rp_v1_005_low',
    version: '1.0',
    scenario: 'You are predicting the opening price of an IPO for a logistics firm.',
    financialFacts: 'The firm has 10 million shares outstanding and an independently audited enterprise value of $300 million. Thus, fair value is $30 per share.',
    referencePrice: 10, // low anchor
    normativeEstimate: 30,
    anchorType: 'low'
  },
  {
    id: 'rp_v1_006_high',
    version: '1.0',
    scenario: 'You are estimating the intrinsic value of a pharmaceutical company.',
    financialFacts: 'Their only drug patent expires next year. Objective net asset value per share is $15.',
    referencePrice: 45, // high anchor
    normativeEstimate: 15,
    anchorType: 'high'
  }
];
