/* =============================================================================
   BWiGA Assistant — premium chat widget with logo branding
   =============================================================================
   - Floating chat button (bottom-right) with logo + animated pulse rings
   - Premium expandable panel with brand logo header and gradient accent
   - Smart knowledge base trained on site content
   - Keyword + similarity matching with confidence threshold
   - Multiple-match suggestions and follow-up prompts
   - Email fallback to mail@lead-volume.com
   - Optional: plug in real AI by setting CHAT_CONFIG.apiEndpoint
   ========================================================================== */

(function () {
  'use strict';

  /* -------------------- Config -------------------- */
  const CHAT_CONFIG = {
    // To upgrade to real AI later, set this to a Vercel serverless function URL.
    // e.g. '/api/chat'   The function should accept POST { message, history }
    // and return { reply: string, sources?: [{title, url}] }
    apiEndpoint: null,

    supportEmail: 'mail@lead-volume.com',
    botName: 'BWiGA Assistant',
    botStatus: 'Online · Knowledge base',
    logoSrc: 'assets/logo.png',
  };

  /* -------------------- Knowledge base -------------------- */
  const KB = {
    greetings: [
      'hi', 'hello', 'hey', 'sup', 'good morning', 'good afternoon',
      'good evening', 'good day', 'greetings', 'hola', 'howdy', 'yo'
    ],
    farewells: [
      'bye', 'goodbye', 'see you', 'see ya', 'thanks', 'thank you', 'thx',
      'ty', 'cheers', 'later', 'cya'
    ],
    humanRequests: [
      'human', 'real person', 'agent', 'support', 'team', 'someone',
      'speak to', 'talk to a person', 'representative'
    ],

    topics: [
      {
        id: 'about',
        title: 'What is BWiGA Accelerator?',
        keywords: ['what', 'is', 'bwiga', 'accelerator', 'about', 'mission', 'overview', 'company', 'who', 'are', 'you'],
        answer: 'BWiGA Accelerator is a market activation accelerator for AI-native, Web3, fintech, RWA and DePIN founders. It helps selected founders move from concept to fundraising, launch, listing, protected trading, liquidity activation, media visibility and investor access — through one protocol-driven ecosystem.',
        link: { url: 'index.html#what-is-accelerator', text: 'Read the full overview' },
        followUps: ['How is BWiGA different?', 'Who can apply?', 'What do founders get?']
      },
      {
        id: 'difference',
        title: 'How is BWiGA Accelerator different from other accelerators?',
        keywords: ['different', 'difference', 'unique', 'why', 'choose', 'compared', 'vs', 'others'],
        answer: 'Most accelerators prepare founders. BWiGA helps founders <strong>enter the market</strong>. The accelerator combines four pillars: <strong>Strategy</strong> (launch planning, tokenomics), <strong>Infrastructure</strong> (Launchpad, CDEX, SbSe Shield), <strong>Visibility</strong> (media, events, Demo Day), and <strong>Capital Access</strong> (investor introductions). It is not just advisory — it is market entry infrastructure.',
        link: { url: 'index.html#what-is-accelerator', text: 'See the four pillars' },
        followUps: ['What is protected market entry?', 'What is CDEX?', 'How does SbSe Shield work?']
      },
      {
        id: 'apply',
        title: 'How do I apply?',
        keywords: ['apply', 'application', 'submit', 'how', 'join', 'sign up', 'register', 'enroll'],
        answer: 'Submit your project through our application form. You will provide your project name, category, current stage, pitch materials, token status, traction and market-entry goals. The team reviews every application personally — typical response time is 5–10 business days.',
        link: { url: 'apply.html', text: 'Open the application form' },
        followUps: ['What documents are required?', 'Who can apply?', 'What stage should my project be?']
      },
      {
        id: 'who-can-apply',
        title: 'Who can apply?',
        keywords: ['who', 'can', 'apply', 'eligible', 'eligibility', 'qualify', 'qualification', 'projects', 'founders'],
        answer: 'Founders building in or around <strong>AI, Web3, fintech, RWA, DePIN, payments, security, identity, liquidity, tokenization or market infrastructure</strong>. Your project does not need to be fully Web3-native from day one — what matters is a logical connection to Web3, tokenization, settlement, liquidity or decentralized market systems.',
        link: { url: 'index.html#selection-criteria', text: 'See selection criteria' },
        followUps: ['Do I need a token?', 'Do I need an MVP?', 'What stage is ideal?']
      },
      {
        id: 'ai-fintech-rwa',
        title: 'Can AI / fintech / RWA / DePIN projects apply?',
        keywords: ['ai', 'fintech', 'rwa', 'depin', 'real world assets', 'category', 'categories', 'sector'],
        answer: 'Yes. BWiGA Accelerator is open to <strong>AI, fintech, RWA, DePIN, payment, security, identity, infrastructure and market automation</strong> projects. The focus is on projects that can connect to the future of AI × Web3 market infrastructure, tokenization, liquidity and decentralized finance.',
        link: { url: 'for-founders.html#who-we-look-for', text: 'See ideal project categories' },
        followUps: ['What is BWiGA Accelerator?', 'How do I apply?', 'What is CDEX?']
      },
      {
        id: 'token',
        title: 'Do I need a token to apply?',
        keywords: ['token', 'tokens', 'tokenize', 'tokenomics', 'launch', 'need', 'require'],
        answer: 'No, a token is not required. In many cases it is <strong>better to apply before token launch</strong>, because the accelerator can support tokenomics thinking, launch structure, fundraising preparation, liquidity strategy and market-entry direction before going public. BWiGA is not designed to build everything from zero — the ideal project already has a serious concept, technical direction, MVP or strong execution plan.',
        link: { url: 'for-founders.html#automated-fundraising', text: 'How fundraising works' },
        followUps: ['Do I need an MVP?', 'What stage is ideal?', 'How does fundraising work?']
      },
      {
        id: 'mvp',
        title: 'Do I need an MVP?',
        keywords: ['mvp', 'product', 'prototype', 'demo', 'build', 'finished'],
        answer: 'A finished product is not required, but serious preparation is expected. The ideal project has an MVP, prototype, technical documentation, working demo, early user feedback or a clear development roadmap. A strong idea with a strong team can apply, but the accelerator is most effective for teams beyond the pure idea stage.',
        link: { url: 'index.html#selection-criteria', text: 'Selection criteria' },
        followUps: ['What stage is ideal?', 'How do I apply?', 'Do I need a token?']
      },
      {
        id: 'stage',
        title: 'What stage should my project be?',
        keywords: ['stage', 'phase', 'when', 'ready', 'time', 'early', 'late', 'pre'],
        answer: 'The ideal project is beyond the idea stage but still before full market entry, token launch, fundraising, listing or liquidity activation. Strong fits include <strong>MVP-stage projects, pre-token projects, pre-fundraising teams, early traction projects, AI / fintech projects exploring Web3 integration</strong>, and teams preparing for public market entry.',
        link: { url: 'index.html#selection-criteria', text: 'Selection criteria' },
        followUps: ['How do I apply?', 'Do I need a token?', 'What documents are required?']
      },
      {
        id: 'cost',
        title: 'Is there a fee or cost?',
        keywords: ['cost', 'fee', 'price', 'pay', 'payment', 'paid', 'free', 'expensive', 'money', 'much'],
        answer: 'Participation and collaboration terms depend on the project stage, required support, accelerator track and partnership structure. The BWiGA Accelerator team will clarify the exact terms after the initial project review and consultation.',
        link: { url: 'mailto:mail@lead-volume.com', text: 'Contact us for details' },
        followUps: ['How do I apply?', 'What do founders get?']
      },
      {
        id: 'duration',
        title: 'How long does the program take?',
        keywords: ['long', 'duration', 'time', 'weeks', 'months', 'period', 'timeline', 'how'],
        answer: 'Program duration depends on your project stage, goals and required preparation. Some projects need a shorter launch-readiness sprint; others go through a deeper process covering fundraising, tokenomics, market preparation, media visibility and investor readiness. The structured journey typically spans <strong>2–4 weeks application, 1–2 weeks onboarding, 4–8 weeks build, 4–6 weeks validation, 2–4 weeks launch, then ongoing growth</strong>.',
        link: { url: 'for-founders.html#structured-acceleration', text: 'See full journey' },
        followUps: ['Is the program online or in-person?', 'How do I apply?']
      },
      {
        id: 'format',
        title: 'Is the program online, in-person or hybrid?',
        keywords: ['online', 'remote', 'in person', 'offline', 'hybrid', 'location', 'where', 'place'],
        answer: 'BWiGA Accelerator operates as a <strong>hybrid program</strong>. Strategic work, advisory, pitch preparation and consultations happen digitally. Selected projects may also access offline opportunities — events, founder showcases, investor meetings, panel discussions, Demo Day formats and private networking environments.',
        followUps: ['What is Demo Day?', 'How do I apply?']
      },
      {
        id: 'documents',
        title: 'What documents are required?',
        keywords: ['documents', 'paperwork', 'materials', 'requirements', 'pitch deck', 'prepare', 'submit', 'need'],
        answer: 'At minimum: project name, short description, website / landing page, pitch deck (10–15 slides), roadmap, current stage, product or demo link if available, category, fundraising goals if relevant, social links, founder contact details and core team info. <strong>LinkedIn profiles for main team members are required</strong> — core team transparency matters.',
        link: { url: 'for-founders.html#application', text: 'See full application checklist' },
        followUps: ['How do I apply?', 'What stage should my project be?']
      },
      {
        id: 'benefits',
        title: 'What do founders get?',
        keywords: ['get', 'benefits', 'receive', 'offer', 'provide', 'support', 'help', 'value', 'access'],
        answer: 'Selected founders may receive support across <strong>launch strategy, tokenomics review, automated fundraising preparation, access to INFI MultiChain partner infrastructure (Launchpad, CDEX listing path, protected market entry, liquidity strategy, SbSe Shield logic) where relevant, pitch deck support, investor readiness, go-to-market strategy, community growth, media visibility, event opportunities, founder showcases and curated investor introductions</strong>.',
        link: { url: 'for-founders.html#founder-benefits', text: 'See all 8 founder benefits' },
        followUps: ['What is Demo Day?', 'How does fundraising work?', 'What is protected market entry?']
      },
      {
        id: 'fundraising',
        title: 'How does fundraising work?',
        keywords: ['fundraising', 'raise', 'capital', 'money', 'investment', 'funding', 'launchpad', 'launch'],
        answer: 'INFI MultiChain Launchpad — provided by our Technology &amp; Market Rails Partner — helps selected projects prepare structured fundraising campaigns with automated execution logic. Founders define key parameters — <strong>price, timeline, soft cap, hard cap, contribution rules and launch model</strong> — before entering the market. The protocol then executes the campaign with automated logic and transparency. Two raise models: Single-Stage (one price, one timeline) or Multi-Stage (staged allocations).',
        link: { url: 'for-founders.html#automated-fundraising', text: 'Read about Automated Fundraising' },
        followUps: ['What is CDEX?', 'What is protected market entry?', 'Will I list on CDEX?']
      },
      {
        id: 'cdex',
        title: 'What is CDEX?',
        keywords: ['cdex', 'listing', 'list', 'exchange', 'trading', 'trade'],
        answer: 'CDEX is the INFI MultiChain (Technology Partner) exchange where selected projects may list after launch. It is built around protected trading: minimum liquidity floor, 3-month liquidity lock at protocol level, SbSe Shield anti-manipulation logic, progressive protection fees and a compensation mechanism for affected users. Being accepted into BWiGA Accelerator does not automatically guarantee listing, but projects that complete the required launch logic may move toward the CDEX listing path.',
        link: { url: 'for-founders.html#protected-market-entry', text: 'Learn about protected market entry' },
        followUps: ['What is SbSe Shield?', 'How does the liquidity lock work?', 'What is protected market entry?']
      },
      {
        id: 'protection',
        title: 'What is protected market entry?',
        keywords: ['protect', 'protected', 'protection', 'safe', 'safety', 'secure', 'security', 'shield', 'risk'],
        answer: 'Protected market entry means the project does not enter a fully exposed and easily manipulated trading environment. Through CDEX and SbSe Shield logic, the system reduces harmful early-market manipulation, high-impact sells, liquidity drain and destructive post-launch behavior. <strong>Five protection layers:</strong> Liquidity Floor, Minimum 3-month Liquidity Lock, SbSe Shield anti-manipulation, Compensation Logic and DAO-Controlled Unlock. It does not remove all market risk — it reduces specific structural weaknesses.',
        link: { url: 'for-founders.html#protected-market-entry', text: 'See all 5 protection layers' },
        followUps: ['What is SbSe Shield?', 'Are returns guaranteed?', 'What is CDEX?']
      },
      {
        id: 'sbse',
        title: 'What is SbSe Shield?',
        keywords: ['sbse', 'shield', 'manipulation', 'sell', 'dump', 'pump'],
        answer: 'SbSe Shield is INFI MultiChain\'s protocol-level anti-manipulation logic (Technology Partner infrastructure). When a sell creates strong liquidity impact, the system applies <strong>progressive protection fees</strong>. These fees can support a compensation mechanism for affected users. The goal is not to stop normal market activity — it is to make destructive market impact pay for stability.',
        link: { url: 'for-founders.html#protected-market-entry', text: 'Read about Protected Market Entry' },
        followUps: ['What is CDEX?', 'What is protected market entry?', 'Are returns guaranteed?']
      },
      {
        id: 'demo-day',
        title: 'What is Demo Day?',
        keywords: ['demo day', 'demo', 'pitch', 'present', 'investor', 'event'],
        answer: 'Demo Day is a curated visibility format that gives selected projects a structured opportunity to present their business model, market thesis, product, token strategy, traction, roadmap and launch plan to relevant investors and ecosystem participants. It is not a show — it is a bridge between selected founders and serious market participants.',
        link: { url: 'index.html#demo-day', text: 'Read about Demo Day' },
        followUps: ['How does investor access work?', 'What is BWiGA Accelerator?']
      },
      {
        id: 'investors',
        title: 'How can investors join?',
        keywords: ['investor', 'investors', 'vc', 'angel', 'invest', 'capital', 'fund'],
        answer: 'Investors can join through a dedicated investor application form. The process includes a Calendly booking, an introductory call with the BWiGA Accelerator team, profile review, focus area discussion and alignment around deal flow, Demo Day or private introduction opportunities. Investors may receive <strong>early access</strong> to selected projects through Demo Day, private pitch sessions, curated deal flow, founder introductions and pre-launch reviews.',
        link: { url: 'investors.html', text: 'Investors & Partners' },
        followUps: ['Are returns guaranteed?', 'What is Demo Day?', 'How does the accelerator help projects?']
      },
      {
        id: 'guarantees',
        title: 'Are returns or fundraising guaranteed?',
        keywords: ['guarantee', 'guaranteed', 'returns', 'profit', 'return', 'safe', 'risk free', 'sure'],
        answer: 'No. BWiGA does not guarantee returns, profit, fundraising, listing, investor introductions or risk-free outcomes. What BWiGA provides is a <strong>protocol-level market structure</strong> designed to reduce specific early-market weaknesses: harmful manipulation, high liquidity impact, sudden liquidity drain and destructive post-launch behavior. Real demand, strong execution and good products still drive outcomes.',
        followUps: ['What risks remain?', 'What is protected market entry?', 'Is BWiGA financial advice?']
      },
      {
        id: 'risks',
        title: 'What risks remain?',
        keywords: ['risk', 'risks', 'danger', 'lose', 'losing', 'failure', 'fail'],
        answer: 'Projects and investors still face normal early-stage and Web3 risks: weak demand, low user adoption, technology failures, smart contract risk, market volatility, liquidity risk, regulatory uncertainty, execution risk, poor tokenomics, weak community, founder risk, and macro conditions. INFI MultiChain technology infrastructure can support a more structured launch and protected trading — <strong>but it cannot replace real demand, strong execution or a good product.</strong>',
        link: { url: 'index.html#faq', text: 'See full Risk & Legal FAQ' },
        followUps: ['Is BWiGA financial advice?', 'Are returns guaranteed?']
      },
      {
        id: 'financial-advice',
        title: 'Is BWiGA Accelerator financial advice?',
        keywords: ['financial', 'advice', 'investment', 'advisor', 'legal', 'regulated'],
        answer: 'No. BWiGA Accelerator does <strong>not</strong> provide financial advice. The accelerator provides strategic, technological, launch, market-entry, media, ecosystem and investor-readiness support for selected projects. BWiGA does not provide personalized investment advice, guarantee returns or take responsibility for individual investment decisions.',
        followUps: ['What risks remain?', 'Are returns guaranteed?']
      },
      {
        id: 'partners',
        title: 'How can I become an ecosystem partner?',
        keywords: ['partner', 'partners', 'partnership', 'mentor', 'advisor', 'media', 'collaborate'],
        answer: 'Ecosystem partners can include media companies, event organizers, VCs, angel investors, family offices, market makers, security partners, legal experts, tokenomics advisors, go-to-market specialists, community growth experts, AI / RWA / DePIN experts, exchanges and fintech infrastructure partners. <strong>A strong partner provides access, knowledge, visibility, trust, infrastructure or market opportunities</strong> — not just a logo.',
        link: { url: 'mailto:mail@lead-volume.com', text: 'Contact us about partnerships' },
        followUps: ['What is BWiGA Accelerator?', 'How do I apply as a founder?']
      },
      {
        id: 'media',
        title: 'What about media and event visibility?',
        keywords: ['media', 'events', 'visibility', 'pr', 'press', 'marketing', 'showcase', 'panel'],
        answer: 'Through LeadVolume media expertise and selected Web3 / iGaming event ecosystems, high-potential founders may access <strong>founder showcases, interviews, pitch sessions, panels, investor networking, and event ecosystem access</strong>. Visibility is not only marketing — for early-stage projects, the right room can change the entire trajectory.',
        link: { url: 'for-founders.html#media-events', text: 'Media & Event Visibility' },
        followUps: ['What is Demo Day?', 'How does investor access work?']
      },
      {
        id: 'investor-access',
        title: 'How does investor access work?',
        keywords: ['investor access', 'capital access', 'connect', 'introduction', 'network'],
        answer: 'BWiGA Accelerator helps selected founders prepare for investor conversations and connect with <strong>angels, VCs, strategic partners and ecosystem participants</strong> through curated formats: Demo Day, Private Investor Calls, Strategic Partner Introductions, Investor Narrative Support and access to VC & Angel Networks. Capital access is stronger when the project is prepared, positioned and market-ready.',
        link: { url: 'for-founders.html#investor-access', text: 'Investor & VC Access' },
        followUps: ['What is Demo Day?', 'Are returns guaranteed?', 'How can investors join?']
      },
      {
        id: 'go-to-market',
        title: 'What about go-to-market and growth?',
        keywords: ['go to market', 'gtm', 'growth', 'community', 'marketing', 'positioning', 'audience', 'launch'],
        answer: 'Great projects need great reach. BWiGA helps founders build visibility, grow communities and execute go-to-market strategies that drive real traction — across <strong>positioning & messaging, community building, launch support, partnership access and growth analytics</strong>. From visibility to adoption. From community to ecosystem.',
        link: { url: 'for-founders.html#go-to-market', text: 'Go-to-Market & Community Growth' },
        followUps: ['What is Demo Day?', 'How does investor access work?']
      },
      {
        id: 'who-we-look-for',
        title: 'What kind of founders are you looking for?',
        keywords: ['look for', 'looking', 'fit', 'right', 'profile', 'founder', 'background', 'team'],
        answer: 'We back founders with <strong>long-term vision, strong teams, real problems to solve, execution focus, and AI × Web3 native thinking</strong>. We look for full-time commitment, technical depth, complementary co-founders, MVP or strong prototype, large addressable market, sustainable token model, and early users or revenue. If your project pushes boundaries, we want to hear from you — even if it doesn\'t fit every box.',
        link: { url: 'for-founders.html#who-we-look-for', text: 'See full criteria' },
        followUps: ['How do I apply?', 'What stage should my project be?']
      },
      {
        id: 'market-rails',
        title: 'What is the BWiGA Market Rails (Technology Partner) layer?',
        keywords: ['market rails', 'rails', 'infrastructure', 'launch listing trading liquidity', 'protocol'],
        answer: 'BWiGA Market Rails — provided by Technology &amp; Market Rails Partner INFI MultiChain (a fully decentralized ecosystem) — are the rules, systems and protocol logic that connect <strong>launch, listing, protected trading and liquidity activation</strong> into one structured infrastructure flow. Rather than treating these as separate problems, INFI MultiChain connects them: Launchpad for fundraising, CDEX for listing, SbSe Shield for protected trading, and InvertX for future cross-chain settlement.',
        link: { url: 'market-rails.html', text: 'Explore Market Rails' },
        followUps: ['What is the Launchpad?', 'What is CDEX?', 'What is InvertX?', 'What is Synthetic RWA?']
      },
      {
        id: 'invertx',
        title: 'What is InvertX?',
        keywords: ['invertx', 'stable', 'settlement', 'cross-chain', 'liquidity coordination'],
        answer: 'InvertX is being developed as a <strong>Stable Digital Protocol Unit Asset</strong> inside the BWiGA ecosystem. Its purpose is to support future cross-chain settlement, liquidity coordination and market activity — without relying on classic stablecoin mechanics, centralized issuer logic or fragmented liquidity across chains. Together with the future Liquidity Lending layer, the goal is to help projects access starting liquidity and grow through real user activity.',
        link: { url: 'market-rails.html#invertx-liquidity', text: 'Read about InvertX & Liquidity Layer' },
        followUps: ['What are Market Rails?', 'What is liquidity lending?', 'What is CDEX?']
      },
      {
        id: 'synthetic-rwa',
        title: 'What is Synthetic RWA?',
        keywords: ['synthetic rwa', 'tokenized', 'real world assets', 'gold', 'real estate', 'equity'],
        answer: 'Synthetic RWA is a future direction inside the INFI MultiChain technology partner stack. The goal is not only to create digital representations of real-world assets, but to build the <strong>protected market, liquidity and settlement infrastructure</strong> around them. This future layer can support tokenized representations of assets such as gold, real estate indexes, equity baskets or other real-world value exposures.',
        link: { url: 'market-rails.html#synthetic-rwa', text: 'Read about Synthetic RWA Direction' },
        followUps: ['What is InvertX?', 'What are Market Rails?', 'What is protected market entry?']
      },
            {
        id: 'contact',
        title: 'How do I contact BWiGA Accelerator?',
        keywords: ['contact', 'email', 'reach', 'message', 'phone', 'call', 'support', 'help'],
        answer: `You can reach the BWiGA Accelerator team at <a href="mailto:${CHAT_CONFIG.supportEmail}">${CHAT_CONFIG.supportEmail}</a>. For applications, use the <a href="apply.html">application form</a>. For partnership and investor inquiries, mention your area of interest in the email subject.`,
        followUps: ['How do I apply?', 'How can investors join?', 'How do I become a partner?']
      }
    ]
  };

  /* -------------------- Tokenization & matching -------------------- */
  const STOP_WORDS = new Set([
    'a','an','the','is','are','was','were','be','been','being','have','has','had',
    'do','does','did','will','would','should','could','may','might','must','can',
    'this','that','these','those','i','me','my','mine','we','us','our','you','your',
    'of','to','in','on','at','for','with','by','from','about','as','it','its',
    'and','or','but','if','then','than','so','too','very','just','also','some',
    'any','no','not','only','own','same','here','there','where','when','why','how',
    'what','which','who','whom','whose','one','two','am','please','thanks'
  ]);

  function tokenize(text) {
    return new Set(
      String(text).toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(w => w.length > 1 && !STOP_WORDS.has(w))
    );
  }

  function findMatches(query) {
    const queryWords = tokenize(query);
    if (queryWords.size === 0) return [];

    const scored = KB.topics.map(topic => {
      let score = 0;
      const titleLower = topic.title.toLowerCase();
      const queryLower = query.toLowerCase().trim();

      if (titleLower.includes(queryLower) && queryLower.length > 4) score += 12;

      const kwSet = new Set();
      topic.keywords.forEach(kw => tokenize(kw).forEach(w => kwSet.add(w)));
      queryWords.forEach(qw => { if (kwSet.has(qw)) score += 3; });

      tokenize(topic.title).forEach(tw => { if (queryWords.has(tw)) score += 2; });

      let answerScore = 0;
      const answerText = topic.answer.replace(/<[^>]+>/g, ' ');
      tokenize(answerText).forEach(aw => { if (queryWords.has(aw)) answerScore += 0.4; });
      score += Math.min(answerScore, 4);

      return { topic, score };
    });

    scored.sort((a, b) => b.score - a.score);

    const threshold = Math.max(2.5, queryWords.size * 0.6);
    return scored.filter(s => s.score >= threshold).slice(0, 3).map(s => s.topic);
  }

  function isGreeting(query) {
    const q = query.toLowerCase().trim().replace(/[!?.]/g, '');
    return KB.greetings.some(g => q === g || q.startsWith(g + ' ') || q.endsWith(' ' + g));
  }
  function isFarewell(query) {
    const q = query.toLowerCase().trim().replace(/[!?.]/g, '');
    return KB.farewells.some(f => q === f || q.startsWith(f + ' ') || q.endsWith(' ' + f) || q.includes(f));
  }
  function isHumanRequest(query) {
    const q = query.toLowerCase();
    return KB.humanRequests.some(h => q.includes(h));
  }

  /* -------------------- Response generation -------------------- */
  function buildResponse(query) {
    if (isGreeting(query)) {
      return {
        text: `Hi there! 👋 I'm the <strong>${CHAT_CONFIG.botName}</strong>. I can help with questions about the accelerator, applications, fundraising, protected market entry, investor access and more. What would you like to know?`,
        suggestions: ['How do I apply?', 'What is BWiGA Accelerator?', 'Who can apply?', 'What is protected market entry?']
      };
    }

    if (isFarewell(query)) {
      return {
        text: `Thanks for stopping by. If you'd like to follow up with the team, reach out at <a href="mailto:${CHAT_CONFIG.supportEmail}">${CHAT_CONFIG.supportEmail}</a>. Good luck with your project! 🚀`,
        suggestions: []
      };
    }

    if (isHumanRequest(query)) {
      return {
        text: `Of course — for direct human support, please email the team at <a href="mailto:${CHAT_CONFIG.supportEmail}">${CHAT_CONFIG.supportEmail}</a>. Mention your project, stage, and what you'd like to discuss. The team typically responds within 5–10 business days.`,
        suggestions: ['How do I apply?', 'What is BWiGA Accelerator?']
      };
    }

    const matches = findMatches(query);

    if (matches.length === 0) {
      return {
        text: `I couldn't find a direct answer for that. Here are common topics I can help with — pick one or rephrase your question. For anything specific, email <a href="mailto:${CHAT_CONFIG.supportEmail}">${CHAT_CONFIG.supportEmail}</a>.`,
        suggestions: ['What is BWiGA Accelerator?', 'How do I apply?', 'What is protected market entry?', 'How does fundraising work?', 'Who can apply?']
      };
    }

    const primary = matches[0];
    let text = '';
    if (primary.answer) text += `<p>${primary.answer}</p>`;
    if (primary.link) {
      text += `<p style="margin-top:8px;"><a href="${primary.link.url}">${primary.link.text} →</a></p>`;
    }

    if (matches.length > 1) {
      const others = matches.slice(1, 3).map(m => m.title);
      return {
        text,
        suggestions: [...(primary.followUps || []).slice(0, 2), ...others].slice(0, 4)
      };
    }

    return {
      text,
      suggestions: primary.followUps || []
    };
  }

  async function fetchAIResponse(message, history) {
    if (!CHAT_CONFIG.apiEndpoint) return null;
    try {
      const resp = await fetch(CHAT_CONFIG.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history })
      });
      if (!resp.ok) return null;
      return await resp.json();
    } catch (e) {
      console.warn('[chat] AI endpoint failed, falling back:', e);
      return null;
    }
  }

  /* -------------------- UI rendering -------------------- */
  function createWidget() {
    const widget = document.createElement('div');
    widget.className = 'chat-widget';
    widget.innerHTML = `
      <button class="chat-fab" id="chat-fab" aria-label="Open BWiGA Assistant" aria-expanded="false">
        <span class="chat-fab-pulse" aria-hidden="true"></span>
        <span class="chat-fab-pulse chat-fab-pulse-2" aria-hidden="true"></span>
        <span class="chat-badge" aria-hidden="true"></span>
        <span class="chat-fab-icon-wrap" id="chat-fab-icon-wrap">
          <img src="${CHAT_CONFIG.logoSrc}" alt="" class="chat-fab-logo" id="chat-fab-logo" />
          <svg class="chat-fab-close" id="chat-fab-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </span>
      </button>

      <div class="chat-panel" id="chat-panel" role="dialog" aria-label="BWiGA Assistant" aria-modal="false">
        <div class="chat-panel-aurora" aria-hidden="true"></div>

        <div class="chat-header">
          <div class="chat-title">
            <div class="chat-avatar">
              <img src="${CHAT_CONFIG.logoSrc}" alt="BWiGA" class="chat-avatar-logo" />
            </div>
            <div class="chat-title-text">
              <strong>${CHAT_CONFIG.botName}</strong>
              <small><span class="chat-status-dot"></span>${CHAT_CONFIG.botStatus}</small>
            </div>
          </div>
          <button class="chat-close" id="chat-close" aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="chat-messages" id="chat-messages" aria-live="polite"></div>

        <div class="chat-input-area">
          <textarea class="chat-input" id="chat-input" placeholder="Ask anything about BWiGA Accelerator..." rows="1" maxlength="500"></textarea>
          <button class="chat-send" id="chat-send" aria-label="Send message" disabled>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>

        <div class="chat-footer">
          Powered by BWiGA · <a href="mailto:${CHAT_CONFIG.supportEmail}">${CHAT_CONFIG.supportEmail}</a>
        </div>
      </div>
    `;
    document.body.appendChild(widget);
    return widget;
  }

  /* -------------------- Wire up -------------------- */
  function init() {
    if (document.querySelector('.chat-widget')) return;
    createWidget();

    const fab = document.getElementById('chat-fab');
    const panel = document.getElementById('chat-panel');
    const closeBtn = document.getElementById('chat-close');
    const input = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send');
    const messages = document.getElementById('chat-messages');

    let conversation = [];

    function appendUser(text) {
      const el = document.createElement('div');
      el.className = 'chat-msg user';
      el.textContent = text;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
    }

    function appendBot(html, suggestions) {
      // Bot row with mini-avatar
      const row = document.createElement('div');
      row.className = 'chat-msg-row bot';
      row.innerHTML = `
        <div class="chat-msg-avatar"><img src="${CHAT_CONFIG.logoSrc}" alt="" /></div>
        <div class="chat-msg bot">${html}</div>
      `;
      messages.appendChild(row);

      if (suggestions && suggestions.length) {
        const wrap = document.createElement('div');
        wrap.className = 'chat-suggestions';
        suggestions.forEach(s => {
          const chip = document.createElement('button');
          chip.className = 'chat-chip';
          chip.type = 'button';
          chip.textContent = s;
          chip.addEventListener('click', () => handleUserMessage(s));
          wrap.appendChild(chip);
        });
        messages.appendChild(wrap);
      }

      messages.scrollTop = messages.scrollHeight;
    }

    function showTyping() {
      const row = document.createElement('div');
      row.className = 'chat-msg-row bot';
      row.id = 'chat-typing-row';
      row.innerHTML = `
        <div class="chat-msg-avatar"><img src="${CHAT_CONFIG.logoSrc}" alt="" /></div>
        <div class="chat-typing"><span></span><span></span><span></span></div>
      `;
      messages.appendChild(row);
      messages.scrollTop = messages.scrollHeight;
    }
    function hideTyping() {
      const t = document.getElementById('chat-typing-row');
      if (t) t.remove();
    }

    function showWelcome() {
      if (messages.children.length) return;
      const welcome = `Welcome to <strong>BWiGA Accelerator</strong>. I can help with questions about the program, fundraising, protected market entry, investor access and more. What would you like to know?`;
      appendBot(welcome, [
        'What is BWiGA Accelerator?',
        'How do I apply?',
        'What is protected market entry?',
        'How does fundraising work?'
      ]);
    }

    async function handleUserMessage(text) {
      const trimmed = text.trim();
      if (!trimmed) return;

      appendUser(trimmed);
      conversation.push({ role: 'user', content: trimmed });
      input.value = '';
      autoSize();
      sendBtn.disabled = true;
      showTyping();

      const delay = 600 + Math.random() * 600;

      let resp = null;
      if (CHAT_CONFIG.apiEndpoint) {
        resp = await fetchAIResponse(trimmed, conversation);
      }
      if (!resp) {
        resp = buildResponse(trimmed);
      }

      setTimeout(() => {
        hideTyping();
        appendBot(resp.text, resp.suggestions || []);
        conversation.push({ role: 'assistant', content: resp.text });
      }, delay);
    }

    function openPanel() {
      panel.classList.add('open');
      fab.classList.add('open');
      fab.setAttribute('aria-expanded', 'true');
      showWelcome();
      setTimeout(() => input.focus(), 250);
    }
    function closePanel() {
      panel.classList.remove('open');
      fab.classList.remove('open');
      fab.setAttribute('aria-expanded', 'false');
    }
    function autoSize() {
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 100) + 'px';
      sendBtn.disabled = !input.value.trim();
    }

    fab.addEventListener('click', () => {
      if (panel.classList.contains('open')) closePanel();
      else openPanel();
    });
    closeBtn.addEventListener('click', closePanel);

    input.addEventListener('input', autoSize);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (input.value.trim()) handleUserMessage(input.value);
      }
    });
    sendBtn.addEventListener('click', () => {
      if (input.value.trim()) handleUserMessage(input.value);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && panel.classList.contains('open')) closePanel();
    });
  }

  /* -------------------- Magnetic button effect -------------------- */
  function initMagneticButtons() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (reduced || isTouch) return;

    const buttons = document.querySelectorAll('.btn-primary, .apply-btn');
    buttons.forEach(btn => {
      let raf = null;
      btn.addEventListener('mousemove', (e) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.18}px, ${y * 0.25}px)`;
          raf = null;
        });
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* -------------------- Boot -------------------- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      initMagneticButtons();
    });
  } else {
    init();
    initMagneticButtons();
  }
})();
