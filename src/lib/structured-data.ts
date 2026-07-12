export type Faq = { question: string; answer: string };

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
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: options?.name ?? 'Pixvael',
    description:
      options?.description ?? 'Free online image to pixel art converter.',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any',
    url: options?.url ?? 'https://pixvael.com',
    ...(options?.featureList
      ? { featureList: options.featureList.join(', ') }
      : {}),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
