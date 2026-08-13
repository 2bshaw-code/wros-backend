const DOCS = {
  'press-release': {
    name: 'press-release',
    label: 'Press Release',
    filename: 'wros-press-release',
    title: 'WROS Press Release',
    sections: [
      'WROS Launches to Turn WhatsApp into a Retail Growth Engine',
      'WROS brings AI, automation, catalog tools, and analytics into one modern operating system for WhatsApp commerce.',
      'Retail teams need a system that ties together customer conversations, catalog accuracy, automation, and performance insight.',
      'WROS is built to help businesses sell smarter, respond faster, and operate more efficiently around WhatsApp.',
      'With BOB AI Assistant, automation workflows, catalog management, analytics dashboards, and multi-device access, WROS helps retailers scale without adding operational friction.'
    ]
  },
  'partner-program': {
    name: 'partner-program',
    label: 'Partner Program',
    filename: 'wros-partner-program',
    title: 'WROS Partner Program',
    sections: [
      'The WROS Partner Program helps agencies, consultants, and growth partners help retail teams unlock WhatsApp commerce.',
      'Partners receive referrals, revenue opportunities, onboarding support, product training, and co-marketing access.',
      'Tiered partner levels align with customer maturity, growth potential, and strategic support requirements.',
      'The program is built for speed, enablement, and long-term ecosystem growth.'
    ]
  },
  'reseller-kit': {
    name: 'reseller-kit',
    label: 'Reseller Kit',
    filename: 'wros-reseller-kit',
    title: 'WROS Reseller Kit',
    sections: [
      'The WROS reseller kit gives sales teams the tools to position WROS as a strategic growth layer for WhatsApp commerce.',
      'It includes product positioning, objection handling, pricing guidance, sales scripts, and onboarding support.',
      'Resellers earn performance-based compensation and gain access to launch assets and product support.'
    ]
  },
  'onboarding-email-sequence': {
    name: 'onboarding-email-sequence',
    label: 'Onboarding Email Sequence',
    filename: 'wros-onboarding-email-sequence',
    title: 'WROS Onboarding Email Sequence',
    sections: [
      'Welcome to WROS and your new retail workspace.',
      'Set up your tenant, brand, catalog, team, and first automation flow.',
      'Learn how to use AI, analytics, automation, and support to get value quickly from WROS.'
    ]
  },
  'product-demo-script': {
    name: 'product-demo-script',
    label: 'Product Demo Script',
    filename: 'wros-product-demo-script',
    title: 'WROS Product Demo Script',
    sections: [
      'Welcome to WROS — Your Retail OS for WhatsApp Commerce.',
      'Showcase dashboard visibility, BOB AI assistance, product catalog management, automation workflows, and analytics.',
      'Demonstrate the mobile and desktop experience to show WROS supports real retail workflows from anywhere.'
    ]
  },
  'investor-faq': {
    name: 'investor-faq',
    label: 'Investor FAQ',
    filename: 'wros-investor-faq',
    title: 'WROS Investor FAQ',
    sections: [
      'WROS addresses a large market opportunity at the intersection of retail, messaging, AI, and commerce.',
      'The product simplifies fragmented retail operations by unifying communication, AI, automation, and analytics.',
      'The company is positioned to grow rapidly as WhatsApp commerce becomes more strategic for retail teams.'
    ]
  },
  'website-copy-pack': {
    name: 'website-copy-pack',
    label: 'Website Copy Pack',
    filename: 'wros-website-copy-pack',
    title: 'WROS Website Copy Pack',
    sections: [
      'Homepage, features, pricing, about, and contact messaging designed to convert modern retail teams.',
      'WROS brings AI, automation, and analytics together to create a clearer retail operating layer.',
      'The messaging is built to be modern, clear, conversion-focused, and practical for SaaS buyers.'
    ]
  },
  'social-launch-kit': {
    name: 'social-launch-kit',
    label: 'Social Launch Kit',
    filename: 'wros-social-launch-kit',
    title: 'WROS Social Launch Kit',
    sections: [
      'Launch kits for Twitter/X, LinkedIn, Instagram, Facebook, and WhatsApp broadcast content.',
      'Includes launch posts, feature highlights, founder messaging, hashtags, and CTA variations.',
      'The content is designed to support a strong awareness and product launch push.'
    ]
  },
  'brand-book': {
    name: 'brand-book',
    label: 'Brand Book',
    filename: 'wros-brand-book',
    title: 'WROS Brand Book',
    sections: [
      'WROS brand identity includes the Green W logo, Inter typography, and the signature retail operating system positioning.',
      'Core palette: #0FA958, #F1F1F1, #FFFFFF, #1A1A1A.',
      'The brand voice is warm, clear, confident, helpful, and modern.'
    ]
  },
  'support-customer-success': {
    name: 'support-customer-success',
    label: 'Support & Customer Success',
    filename: 'wros-support-customer-success',
    title: 'WROS Support & Customer Success Pack',
    sections: [
      'Customer success playbooks, onboarding checklists, support scripts, escalation flow, SLA guidance, and help center content.',
      'The pack enables teams to onboard faster and support customers with clarity and consistency.',
      'It establishes a repeatable service model for a modern retail SaaS lifecycle.'
    ]
  },
  'sales-messaging-pack': {
    name: 'sales-messaging-pack',
    label: 'Sales & Messaging Pack',
    filename: 'wros-sales-messaging-pack',
    title: 'WROS Sales & Messaging Pack',
    sections: [
      'This pack includes the sales deck, one-pager, elevator pitch, value proposition, messaging framework, and brand story.',
      'It gives sales, marketing, and leadership a clear and consistent story to tell.',
      'The narrative centres on converting WhatsApp conversations into measurable retail growth.'
    ]
  },
  'training-docs': {
    name: 'training-docs',
    label: 'Training & Internal Documentation',
    filename: 'wros-training-docs',
    title: 'WROS Training & Internal Documentation',
    sections: [
      'Internal training guidance for operators, admins, and customer success teams.',
      'Includes AI usage guidelines, security best practices, data handling rules, and internal FAQ content.',
      'The documentation helps WROS teams operate consistently and safely at scale.'
    ]
  },
  'pre-testing-readiness': {
    name: 'pre-testing-readiness',
    label: 'Pre-Testing Readiness',
    filename: 'wros-pre-testing-readiness',
    title: 'WROS Pre-Testing Readiness Pack',
    sections: [
      'QA test plan, functional scripts, end-to-end scenarios, bug reporting, and launch-readiness checklist.',
      'The pack ensures the product is validated before full release testing and go-live.',
      'It focuses on product readiness, quality, and launch confidence.'
    ]
  }
};

const DOC_INDEX = Object.keys(DOCS).map((key) => ({
  id: DOCS[key].name,
  label: DOCS[key].label,
  filename: DOCS[key].filename,
  url: `/api/docs/${DOCS[key].name}/pdf`
}));

function escapePdfText(value = '') {
  return String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildPdfBuffer(doc) {
  const lines = [];
  lines.push(doc.title);
  if (Array.isArray(doc.sections)) {
    for (const section of doc.sections) {
      lines.push(section);
    }
  }

  let streamText = 'BT\n/F1 20 Tf\n72 760 Td\n(' + escapePdfText(lines[0]) + ') Tj\n0 -28 Td\n';
  streamText += '/F1 11 Tf\n';

  for (let i = 1; i < lines.length; i += 1) {
    const safeLine = escapePdfText(lines[i]);
    streamText += '(' + safeLine + ') Tj\n0 -18 Td\n';
  }

  streamText += 'ET';

  const contents = Buffer.from(streamText, 'latin1');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${contents.length} >>\nstream\n${streamText}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ];

  const pdfParts = [Buffer.from('%PDF-1.4\n', 'latin1')];
  const offsets = [0];

  objects.forEach((objectText, index) => {
    offsets.push(Buffer.byteLength(Buffer.concat(pdfParts), 'latin1'));
    pdfParts.push(Buffer.from(`${index + 1} 0 obj\n${objectText}\nendobj\n`, 'latin1'));
  });

  const xrefStart = Buffer.byteLength(Buffer.concat(pdfParts), 'latin1');
  const xrefLines = [Buffer.from('xref\n0 6\n0000000000 65535 f \n', 'latin1')];

  for (let i = 1; i < offsets.length; i += 1) {
    const offset = offsets[i];
    xrefLines.push(Buffer.from(`${String(offset).padStart(10, '0')} 00000 n \n`, 'latin1'));
  }

  pdfParts.push(Buffer.concat(xrefLines));
  pdfParts.push(Buffer.from(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`, 'latin1'));

  return Buffer.concat(pdfParts);
}

function resolveDoc(name) {
  const key = String(name || '').trim().toLowerCase();
  const direct = DOCS[key];
  if (direct) return direct;

  const aliasMap = {
    'press-release': 'press-release',
    'partner': 'partner-program',
    'partner-program': 'partner-program',
    'reseller': 'reseller-kit',
    'reseller-kit': 'reseller-kit',
    'onboarding': 'onboarding-email-sequence',
    'demo': 'product-demo-script',
    'investor': 'investor-faq',
    'website': 'website-copy-pack',
    'social': 'social-launch-kit',
    'brand': 'brand-book',
    'support': 'support-customer-success',
    'sales': 'sales-messaging-pack',
    'training': 'training-docs',
    'qa': 'pre-testing-readiness',
    'pre-testing': 'pre-testing-readiness',
    'pretesting': 'pre-testing-readiness'
  };

  return DOCS[aliasMap[key]] || null;
}

module.exports = {
  DOCS,
  DOC_INDEX,
  buildPdfBuffer,
  resolveDoc
};
