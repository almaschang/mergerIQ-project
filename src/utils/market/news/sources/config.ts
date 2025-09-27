export const NEWS_SOURCES = {
  rss: {
    general: [
      {
        name: 'Reuters',
        url: 'https://www.reutersagency.com/feed/',
        category: 'general'
      },
      {
        name: 'Associated Press',
        url: 'https://feeds.apnews.com/rss/business',
        category: 'general'
      },
      {
        name: 'The Guardian',
        url: 'https://www.theguardian.com/business/rss',
        category: 'general'
      },
      {
        name: 'BBC News',
        url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
        category: 'general'
      }
    ],
    technology: [
      {
        name: 'TechCrunch',
        url: 'https://techcrunch.com/feed/',
        category: 'technology'
      },
      {
        name: 'Wired',
        url: 'https://www.wired.com/feed/rss',
        category: 'technology'
      },
      {
        name: 'The Verge',
        url: 'https://www.theverge.com/rss/index.xml',
        category: 'technology'
      }
    ],
    finance: [
      {
        name: 'CNBC',
        url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html',
        category: 'finance'
      },
      {
        name: 'Financial Times',
        url: 'https://www.ft.com/rss/markets',
        category: 'finance'
      }
    ],
    science: [
      {
        name: 'Nature',
        url: 'http://feeds.nature.com/nature/rss/current',
        category: 'science'
      },
      {
        name: 'Scientific American',
        url: 'http://rss.sciam.com/ScientificAmerican-Global',
        category: 'science'
      }
    ],
    policy: [
      {
        name: 'Politico',
        url: 'https://www.politico.com/rss/economy.xml',
        category: 'policy'
      },
      {
        name: 'The Hill',
        url: 'https://thehill.com/homenews/feed/',
        category: 'policy'
      }
    ]
  },
  api: {
    newsApi: {
      sources: [
        'reuters',
        'associated-press',
        'bbc-news',
        'the-guardian-uk',
        'the-new-york-times',
        'the-washington-post',
        'bloomberg',
        'financial-times',
        'cnbc'
      ],
      apiKey: process.env.NEWS_API_KEY || ''
    },
    ft: {
      apiKey: process.env.FT_API_KEY || ''
    },
    bloomberg: {
      apiKey: process.env.BLOOMBERG_API_KEY || ''
    }
  }
};