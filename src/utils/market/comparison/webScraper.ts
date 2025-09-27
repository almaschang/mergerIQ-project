import * as cheerio from 'cheerio';
import { CompanyProfile } from '../../../types/company';

interface ScrapedCompanyData {
  competitors: string[];
  industry: string;
  sector: string;
  description: string;
  marketCap?: number;
  revenue?: number;
  employees?: number;
}

export async function scrapeCompanyData(symbol: string): Promise<ScrapedCompanyData | null> {
  try {
    // Scrape from multiple sources concurrently for real-time data
    const [yahooData, marketWatchData, reutersData, bloombergData, seekingAlphaData] = await Promise.all([
      scrapeYahooFinance(symbol),
      scrapeMarketWatch(symbol),
      scrapeReuters(symbol),
      scrapeBloomberg(symbol),
      scrapeSeekingAlpha(symbol)
    ]);

    // Combine and deduplicate data
    const competitors = Array.from(new Set([
      ...(yahooData?.competitors || []),
      ...(marketWatchData?.competitors || []),
      ...(reutersData?.competitors || []),
      ...(bloombergData?.competitors || []),
      ...(seekingAlphaData?.competitors || [])
    ]));

    // Get the most recent market cap and revenue data
    const marketCap = yahooData?.marketCap || marketWatchData?.marketCap || bloombergData?.marketCap;
    const revenue = yahooData?.revenue || marketWatchData?.revenue || bloombergData?.revenue;
    const employees = yahooData?.employees || marketWatchData?.employees || reutersData?.employees;

    return {
      competitors,
      industry: yahooData?.industry || marketWatchData?.industry || reutersData?.industry || '',
      sector: yahooData?.sector || marketWatchData?.sector || reutersData?.sector || '',
      description: yahooData?.description || marketWatchData?.description || reutersData?.description || '',
      marketCap,
      revenue,
      employees
    };
  } catch (error) {
    console.error('Error scraping company data:', error);
    return null;
  }
}

async function scrapeYahooFinance(symbol: string): Promise<Partial<ScrapedCompanyData>> {
  try {
    const [profileResponse, statisticsResponse] = await Promise.all([
      fetch(`https://finance.yahoo.com/quote/${symbol}/profile`),
      fetch(`https://finance.yahoo.com/quote/${symbol}/key-statistics`)
    ]);

    const [profileHtml, statisticsHtml] = await Promise.all([
      profileResponse.text(),
      statisticsResponse.text()
    ]);

    const $profile = cheerio.load(profileHtml);
    const $stats = cheerio.load(statisticsHtml);

    const competitors: string[] = [];
    $profile('.Mt\\(15px\\) .Mb\\(10px\\) a').each((_, el) => {
      const symbol = $profile(el).text().trim();
      if (symbol) competitors.push(symbol);
    });

    // Extract real-time market cap and revenue
    const marketCap = parseFloat($stats('td:contains("Market Cap")').next().text().replace(/[^\d.]/g, ''));
    const revenue = parseFloat($stats('td:contains("Revenue")').next().text().replace(/[^\d.]/g, ''));
    const employees = parseInt($profile('span:contains("Full Time Employees")').next().text().replace(/,/g, ''), 10);

    return {
      competitors,
      industry: $profile('span:contains("Industry")').next().text().trim(),
      sector: $profile('span:contains("Sector")').next().text().trim(),
      description: $profile('.Mt\\(15px\\) p').first().text().trim(),
      marketCap,
      revenue,
      employees
    };
  } catch (error) {
    console.warn('Error scraping Yahoo Finance:', error);
    return {};
  }
}

async function scrapeMarketWatch(symbol: string): Promise<Partial<ScrapedCompanyData>> {
  try {
    const [profileResponse, competitorsResponse] = await Promise.all([
      fetch(`https://www.marketwatch.com/investing/stock/${symbol}/company-profile`),
      fetch(`https://www.marketwatch.com/investing/stock/${symbol}/competitors`)
    ]);

    const [profileHtml, competitorsHtml] = await Promise.all([
      profileResponse.text(),
      competitorsResponse.text()
    ]);

    const $profile = cheerio.load(profileHtml);
    const $competitors = cheerio.load(competitorsHtml);

    const competitors: string[] = [];
    $competitors('.table__row').each((_, el) => {
      const symbol = $competitors(el).find('.symbol').text().trim();
      if (symbol) competitors.push(symbol);
    });

    const marketCap = parseFloat($profile('.market-cap').text().replace(/[^\d.]/g, ''));
    const revenue = parseFloat($profile('.revenue').text().replace(/[^\d.]/g, ''));
    const employees = parseInt($profile('.employees').text().replace(/,/g, ''), 10);

    return {
      competitors,
      industry: $profile('.industry').text().trim(),
      sector: $profile('.sector').text().trim(),
      description: $profile('.description').text().trim(),
      marketCap,
      revenue,
      employees
    };
  } catch (error) {
    console.warn('Error scraping MarketWatch:', error);
    return {};
  }
}

async function scrapeReuters(symbol: string): Promise<Partial<ScrapedCompanyData>> {
  try {
    const [profileResponse, peersResponse] = await Promise.all([
      fetch(`https://www.reuters.com/companies/${symbol}`),
      fetch(`https://www.reuters.com/companies/${symbol}/peers`)
    ]);

    const [profileHtml, peersHtml] = await Promise.all([
      profileResponse.text(),
      peersResponse.text()
    ]);

    const $profile = cheerio.load(profileHtml);
    const $peers = cheerio.load(peersHtml);

    const competitors: string[] = [];
    $peers('.peer-table tr').each((_, el) => {
      const symbol = $peers(el).find('.symbol').text().trim();
      if (symbol) competitors.push(symbol);
    });

    const employees = parseInt($profile('.employees-count').text().replace(/,/g, ''), 10);

    return {
      competitors,
      industry: $profile('.industry-label').text().trim(),
      sector: $profile('.sector-label').text().trim(),
      description: $profile('.company-description').text().trim(),
      employees
    };
  } catch (error) {
    console.warn('Error scraping Reuters:', error);
    return {};
  }
}

async function scrapeBloomberg(symbol: string): Promise<Partial<ScrapedCompanyData>> {
  try {
    const response = await fetch(`https://www.bloomberg.com/quote/${symbol}:US`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const competitors: string[] = [];
    $('.comparable-companies a').each((_, el) => {
      const symbol = $(el).text().trim();
      if (symbol) competitors.push(symbol);
    });

    const marketCap = parseFloat($('.market-cap').text().replace(/[^\d.]/g, ''));
    const revenue = parseFloat($('.revenue').text().replace(/[^\d.]/g, ''));

    return {
      competitors,
      marketCap,
      revenue
    };
  } catch (error) {
    console.warn('Error scraping Bloomberg:', error);
    return {};
  }
}

async function scrapeSeekingAlpha(symbol: string): Promise<Partial<ScrapedCompanyData>> {
  try {
    const response = await fetch(`https://seekingalpha.com/symbol/${symbol}/peers`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const competitors: string[] = [];
    $('.peer-table tr').each((_, el) => {
      const symbol = $(el).find('.ticker').text().trim();
      if (symbol) competitors.push(symbol);
    });

    return {
      competitors
    };
  } catch (error) {
    console.warn('Error scraping Seeking Alpha:', error);
    return {};
  }
}

export async function enrichCompanyProfile(profile: CompanyProfile): Promise<CompanyProfile> {
  try {
    const scrapedData = await scrapeCompanyData(profile.ticker);
    if (!scrapedData) return profile;

    return {
      ...profile,
      industry: profile.industry || scrapedData.industry,
      sector: scrapedData.sector,
      description: scrapedData.description,
      marketCapitalization: scrapedData.marketCap || profile.marketCapitalization,
      employees: scrapedData.employees || profile.employees
    };
  } catch (error) {
    console.warn('Error enriching company profile:', error);
    return profile;
  }
}