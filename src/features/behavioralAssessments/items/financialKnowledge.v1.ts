export interface AssessmentItem {
  id: string;
  version: string;
  category: string;
  prompt: string;
  choices: string[];
  correctChoice: string;
  explanation: string;
}

export const financialKnowledgeV1: AssessmentItem[] = [
  {
    id: 'fk_v1_001',
    version: '1.0',
    category: 'diversification',
    prompt: 'Buying a single company\'s stock usually provides a safer return than a stock mutual fund.',
    choices: ['True', 'False'],
    correctChoice: 'False',
    explanation: 'A mutual fund typically holds a diversified basket of stocks, which spreads risk compared to holding a single stock.'
  },
  {
    id: 'fk_v1_002',
    version: '1.0',
    category: 'inflation',
    prompt: 'Imagine that the interest rate on your savings account was 1% per year and inflation was 2% per year. After 1 year, how much would you be able to buy with the money in this account?',
    choices: ['More than today', 'Exactly the same', 'Less than today'],
    correctChoice: 'Less than today',
    explanation: 'Because the inflation rate (2%) is higher than the interest rate (1%), your purchasing power decreases over time.'
  },
  {
    id: 'fk_v1_003',
    version: '1.0',
    category: 'compound interest',
    prompt: 'Suppose you have $100 in a savings account and the interest rate is 2% per year. After 5 years, how much do you think you will have in the account if you left the money to grow?',
    choices: ['More than $102', 'Exactly $102', 'Less than $102'],
    correctChoice: 'More than $102',
    explanation: 'With compound interest, you earn interest on both your initial principal and the accumulated interest. After 5 years, you would have about $110.41.'
  },
  {
    id: 'fk_v1_004',
    version: '1.0',
    category: 'bond prices',
    prompt: 'If interest rates rise, what will typically happen to bond prices?',
    choices: ['They will rise', 'They will fall', 'They will stay the same', 'There is no relationship'],
    correctChoice: 'They will fall',
    explanation: 'When newly issued bonds offer higher interest rates, existing bonds with lower rates become less attractive, causing their prices to fall.'
  },
  {
    id: 'fk_v1_005',
    version: '1.0',
    category: 'risk/return',
    prompt: 'Higher returns generally require taking higher risks.',
    choices: ['True', 'False'],
    correctChoice: 'True',
    explanation: 'In finance, the potential for higher returns is almost always coupled with a higher degree of risk.'
  },
  {
    id: 'fk_v1_006',
    version: '1.0',
    category: 'volatility',
    prompt: 'Over long periods, which asset class has historically exhibited the highest volatility (price fluctuations)?',
    choices: ['Savings accounts', 'Government bonds', 'Equities (Stocks)'],
    correctChoice: 'Equities (Stocks)',
    explanation: 'Stocks are generally more volatile than bonds or savings accounts, meaning their prices fluctuate more widely over time.'
  },
  {
    id: 'fk_v1_007',
    version: '1.0',
    category: 'compound interest',
    prompt: 'A 15-year mortgage typically requires higher monthly payments than a 30-year mortgage, but the total interest paid over the life of the loan will be less.',
    choices: ['True', 'False'],
    correctChoice: 'True',
    explanation: 'A shorter loan term means you pay off the principal faster, saving significantly on total interest, though the monthly payments are higher.'
  }
];
