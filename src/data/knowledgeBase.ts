export interface QuickFact {
  keywords: string[];
  title: string;
  answer: string;
  pointers: string[];
  category: string;
}

export const PAKISTAN_GK_KNOWLEDGE_BASE: QuickFact[] = [
  {
    keywords: ['pm', 'prime minister', 'current prime minister', 'wazir e azam', 'wazireazam', 'who is pm'],
    title: 'Prime Minister of Pakistan (Current & Historic)',
    answer: 'The current Prime Minister of Pakistan is **Mian Muhammad Shehbaz Sharif** (took oath as the 24th Prime Minister on March 4, 2024). The first Prime Minister of Pakistan was **Nawabzada Liaquat Ali Khan** (1947–1951).',
    pointers: [
      'Current PM: Shehbaz Sharif (PML-N) - 24th Prime Minister',
      'First PM: Nawabzada Liaquat Ali Khan (assassinated 16 Oct 1951)',
      'Longest serving civilian PM: Yousaf Raza Gillani (4 years, 86 days)',
      'Shortest tenure PM: Nurul Amin (served for 13 days in Dec 1971)'
    ],
    category: 'Pakistan Affairs'
  },
  {
    keywords: ['president', 'sadar', 'current president', 'who is president', 'head of state'],
    title: 'President of Pakistan',
    answer: 'The current President of Pakistan is **Asif Ali Zardari**, who took oath on March 10, 2024 as the 14th President of Pakistan (serving his 2nd non-consecutive term). The first President was **Major General Iskander Mirza** (1956).',
    pointers: [
      'Current President: Asif Ali Zardari (14th President, PPP)',
      'First President: Major General Iskander Mirza (March 1956)',
      'First Governor-General: Quaid-e-Azam Muhammad Ali Jinnah (1947–1948)'
    ],
    category: 'Pakistan Affairs'
  },
  {
    keywords: ['cjp', 'chief justice', 'current chief justice', 'supreme court', 'yahya afridi'],
    title: 'Chief Justice of Pakistan (Supreme Court)',
    answer: 'The current Chief Justice of Pakistan (CJP) is **Justice Yahya Afridi**, who took oath as the 30th Chief Justice on October 26, 2024 under the 26th Constitutional Amendment.',
    pointers: [
      'Current CJP: Justice Yahya Afridi (30th Chief Justice)',
      'First CJP of Pakistan: Justice Sir Mian Abdul Rashid (1949)',
      'Supreme Court Headquarters: Constitution Avenue, Islamabad'
    ],
    category: 'Current Affairs'
  },
  {
    keywords: ['coas', 'army chief', 'chief of army staff', 'asim munir', 'general asim'],
    title: 'Chief of Army Staff (COAS)',
    answer: 'The current Chief of Army Staff (COAS) of the Pakistan Army is **General Asim Munir** (took charge on November 29, 2022).',
    pointers: [
      'Current COAS: General Syed Asim Munir, NI(M)',
      'Chairman Joint Chiefs of Staff Committee (CJCSC): General Sahir Shamshad Mirza',
      'First Commander-in-Chief of Pakistan Army: General Sir Frank Messervy'
    ],
    category: 'Army, Navy & Air Force'
  },
  {
    keywords: ['capital', 'islamabad', 'federal capital', 'capital of pakistan', 'karachi'],
    title: 'Capital of Pakistan',
    answer: '**Islamabad** is the federal capital of Pakistan. It replaced Karachi as the permanent capital in 1967 (with Rawalpindi serving as an interim capital during construction).',
    pointers: [
      'Current Federal Capital: Islamabad (planned by Greek architect Constantinos Doxiadis)',
      'First Capital of Pakistan: Karachi (1947–1959)',
      'Interim Capital: Rawalpindi (1959–1967)'
    ],
    category: 'General Knowledge'
  },
  {
    keywords: ['constitution', '1973', '1956', '1962', 'constitution of pakistan'],
    title: 'Constitutions of Pakistan',
    answer: 'Pakistan has had three formal constitutions: **1956**, **1962**, and the current **1973 Constitution** passed unanimously under Zulfikar Ali Bhutto on April 10, 1973 and enforced on August 14, 1973.',
    pointers: [
      'First Constitution: 23 March 1956 (Parliamentary system)',
      'Second Constitution: 8 June 1962 (Presidential system under Ayub Khan)',
      'Current Constitution: 14 August 1973 (Bicameral Parliament: National Assembly + Senate)'
    ],
    category: 'Pakistan Affairs'
  },
  {
    keywords: ['k2', 'godwin austen', 'highest mountain', 'second highest peak', 'mountains of pakistan'],
    title: 'Highest Peaks & Mountain Ranges',
    answer: '**K2** (Mount Godwin-Austen) at **8,611 meters (28,251 ft)** is the highest mountain peak in Pakistan and the 2nd highest in the world, located in the Karakoram range of Gilgit-Baltistan.',
    pointers: [
      'K2 (Chhogori): 8,611m - Karakoram Range',
      'Nanga Parbat ("Killer Mountain"): 8,126m - Western Himalayas',
      'Five of the world’s 14 "Eight-thousanders" are in Pakistan'
    ],
    category: 'General Knowledge'
  },
  {
    keywords: ['national poet', 'allama iqbal', 'mufakkir e pakistan', 'shair e mashriq'],
    title: 'National Poet of Pakistan',
    answer: '**Dr. Allama Muhammad Iqbal** (9 November 1877 – 21 April 1938) is the National Poet of Pakistan (*Mufakkir-e-Pakistan* and *Shair-e-Mashriq*), who presented the historic Allahabad Address in 1930.',
    pointers: [
      'Born: 9 November 1877 in Sialkot',
      'Historic Address: Allahabad Address (December 1930) proposing a separate Muslim state',
      'Famous Works: Bang-e-Dra, Asrar-e-Khudi, Bal-e-Jibril, Zarb-e-Kaleem'
    ],
    category: 'Pakistan Affairs'
  },
  {
    keywords: ['governor', 'punjab', 'sindh', 'kpk', 'balochistan', 'chief minister', 'cm punjab', 'maryam nawaz'],
    title: 'Provincial Leadership (Chief Ministers & Governors)',
    answer: 'Key provincial chief executives: **Maryam Nawaz Sharif** (Chief Minister of Punjab - 1st female CM in Pakistan history), **Syed Murad Ali Shah** (CM Sindh), **Ali Amin Gandapur** (CM Khyber Pakhtunkhwa), and **Mir Sarfraz Bugti** (CM Balochistan).',
    pointers: [
      'CM Punjab: Maryam Nawaz Sharif (First female Chief Minister)',
      'CM Sindh: Syed Murad Ali Shah',
      'CM KP: Ali Amin Khan Gandapur',
      'CM Balochistan: Mir Sarfraz Bugti'
    ],
    category: 'Current Affairs'
  },
  {
    keywords: ['first pm', 'liaquat ali khan', 'nawabzada liaquat', 'first prime minister'],
    title: 'First Prime Minister of Pakistan',
    answer: '**Nawabzada Liaquat Ali Khan** was Pakistan’s first Prime Minister (15 August 1947 to 16 October 1951). Known as *Shaheed-e-Millat*, he moved the historic Objectives Resolution in March 1949.',
    pointers: [
      'Assassinated: 16 October 1951 in Company Bagh (now Liaquat Bagh), Rawalpindi',
      'Title: Shaheed-e-Millat (Martyr of the Nation)',
      'Finance Minister in Interim Government: 1946–1947 ("Poor Man\'s Budget")'
    ],
    category: 'Pakistan Affairs'
  }
];

export function findQuickFact(searchQuery: string): QuickFact | null {
  const clean = searchQuery.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();
  if (!clean) return null;

  // Direct keyword matching
  for (const fact of PAKISTAN_GK_KNOWLEDGE_BASE) {
    if (fact.keywords.some(k => clean.includes(k) || k.includes(clean))) {
      return fact;
    }
  }

  // Token / stem matching
  const tokens = clean.split(/\s+/).filter(w => w.length > 2);
  let bestFact: QuickFact | null = null;
  let bestScore = 0;

  for (const fact of PAKISTAN_GK_KNOWLEDGE_BASE) {
    let score = 0;
    for (const token of tokens) {
      if (fact.keywords.some(k => k.includes(token))) score += 3;
      if (fact.title.toLowerCase().includes(token)) score += 2;
      if (fact.answer.toLowerCase().includes(token)) score += 1;
    }
    if (score > bestScore && score >= 3) {
      bestScore = score;
      bestFact = fact;
    }
  }

  return bestFact;
}
