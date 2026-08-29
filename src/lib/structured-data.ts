export type Faq = { question: string; answer: string };

export type HowToStepData = { name: string; text: string };
export type HowTo = { name: string; steps: HowToStepData[] };

export function buildFaqSchema(faqs: Faq[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function buildWebAppSchema(options?: {
  name?: string;
  description?: string;
  url?: string;
  featureList?: string[];
  image?: string;
}) {
  const url = options?.url ?? 'https://pixvael.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: options?.name ?? 'Pixvael',
    description:
      options?.description ?? 'Free online image to pixel art converter.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any',
    url,
    ...(options?.image ? { image: options.image } : {}),
    ...(options?.featureList
      ? { featureList: options.featureList.join(', ') }
      : {}),
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      url,
    },
  };
}

export function buildHowToSchema(howTo: HowTo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    step: howTo.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}

export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function buildOrganizationSchema(options?: {
  url?: string;
  logo?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Pixvael',
    url: options?.url ?? 'https://pixvael.com',
    logo: options?.logo ?? 'https://pixvael.com/logo.jpg',
  };
}
