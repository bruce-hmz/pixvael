import type { MetadataRoute } from 'next';

// 显式放行 AI 爬虫。基线规则是 `*` 全站允许，但明确分组是给 AI 引擎的
// 正向信号：训练类 + 搜索/实时引用类。各分组规则与通配组一致（全站允许）。
const AI_TRAINING_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
  'meta-externalagent',
  'Amazonbot',
];

const AI_SEARCH_BOTS = [
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/' },
      { userAgent: AI_TRAINING_BOTS, allow: '/' },
      { userAgent: AI_SEARCH_BOTS, allow: '/' },
    ],
    sitemap: 'https://pixvael.com/sitemap.xml',
  };
}
