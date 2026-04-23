import { Actor } from 'apify';
import { CheerioCrawler } from 'crawlee';
import * as cheerio from 'cheerio';

/** Shape of the Actor input, matching input_schema.json. */
interface Input {
  maxResults: number;
  minRating: number;
  pricingModel: 'all' | 'free' | 'freemium' | 'paid';
  integrations: string[];
  sources: Array<'g2' | 'capterra' | 'producthunt'>;
}

/** Normalised output record for a single tool. */
interface ToolRecord {
  name: string;
  description: string;
  category: 'lead-generation';
  pricing_model: string;
  starting_price_usd: number | null;
  rating: number | null;
  review_count: number | null;
  integrations: string[];
  source: string;
  url: string;
  scraped_at: string;
}

/** Metadata emitted alongside results in the OUTPUT key-value store entry. */
interface OutputMetadata {
  total_results: number;
  run_duration_seconds: number;
  sources_scraped: string[];
  filters_applied: {
    minRating: number;
    pricingModel: string;
    integrations: string[];
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Return true when the record passes all active filters. */
function passesFilters(record: ToolRecord, input: Input): boolean {
  if (input.minRating > 0 && (record.rating === null || record.rating < input.minRating)) {
    return false;
  }

  if (input.pricingModel !== 'all' && record.pricing_model !== input.pricingModel) {
    return false;
  }

  if (input.integrations.length > 0) {
    const lower = record.integrations.map((i) => i.toLowerCase());
    const required = input.integrations.map((i) => i.toLowerCase());
    const hasOne = required.some((r) => lower.includes(r));
    if (!hasOne) return false;
  }

  return true;
}

/** Pause execution for `ms` milliseconds. */
const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Parse a float from a string, returning null when not a valid number. */
function parseFloat_(s: string | undefined): number | null {
  if (!s) return null;
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

/** Parse an integer from a string, returning null when not a valid number. */
function parseInt_(s: string | undefined): number | null {
  if (!s) return null;
  const n = parseInt(s.replace(/[^0-9]/g, ''), 10);
  return isNaN(n) ? null : n;
}

// ---------------------------------------------------------------------------
// G2 scraper
// ---------------------------------------------------------------------------

/**
 * Scrape the G2 AI lead generation category page.
 * Returns a list of partially-populated ToolRecord objects.
 *
 * G2 card selector targets `.product-listing` blocks.
 */
async function scrapeG2(
  crawler: CheerioCrawler,
  scraped_at: string,
): Promise<ToolRecord[]> {
  const results: ToolRecord[] = [];
  const url = 'https://www.g2.com/categories/ai-lead-generation';

  await crawler.addRequests([{ url, label: 'g2' }]);

  // We resolve results via the crawler's requestHandler, so we
  // attach a one-shot listener to collect what it parses.
  // Instead, we fetch synchronously using a dedicated mini-crawler below.
  const html = await fetchHtml(url);
  if (!html) return results;

  const $ = cheerio.load(html);

  // G2 product cards live inside [data-testid="product-listing"] or .product-listing
  const cards = $('[data-testid="product-listing"], .product-listing, .js-log-click[data-track="category-page-product-listing"]');

  cards.each((_i, el) => {
    const $el = $(el);

    const name = $el.find('[itemprop="name"], .product-name, h3').first().text().trim();
    if (!name) return;

    const description = $el.find('[itemprop="description"], .product-description, p').first().text().trim();
    const ratingText = $el.find('[itemprop="ratingValue"], .stars-component, [class*="rating"]').first().text().trim();
    const reviewText = $el.find('[class*="review"], [class*="ratings-count"]').first().text().trim();
    const href = $el.find('a').first().attr('href') ?? '';
    const productUrl = href.startsWith('http') ? href : `https://www.g2.com${href}`;

    results.push({
      name,
      description,
      category: 'lead-generation',
      pricing_model: 'unknown',
      starting_price_usd: null,
      rating: parseFloat_(ratingText),
      review_count: parseInt_(reviewText),
      integrations: [],
      source: 'g2',
      url: productUrl,
      scraped_at,
    });
  });

  return results;
}

// ---------------------------------------------------------------------------
// Capterra scraper
// ---------------------------------------------------------------------------

/**
 * Scrape the Capterra lead generation software listing.
 * Capterra renders server-side HTML for listing pages.
 */
async function scrapeCapterra(scraped_at: string): Promise<ToolRecord[]> {
  const results: ToolRecord[] = [];
  const url = 'https://www.capterra.com/lead-generation-software/';

  const html = await fetchHtml(url);
  if (!html) return results;

  const $ = cheerio.load(html);

  // Capterra listing cards use [data-testid="product-card"] or .listing-card
  const cards = $('[data-testid="product-card"], .listing-card, article[class*="product"]');

  cards.each((_i, el) => {
    const $el = $(el);

    const name = $el.find('h3, [class*="product-name"], [class*="ProductName"]').first().text().trim();
    if (!name) return;

    const description = $el.find('p, [class*="description"]').first().text().trim();
    const ratingText = $el.find('[class*="rating"], [class*="Rating"], [aria-label*="stars"]').first().text().trim();
    const reviewText = $el.find('[class*="review-count"], [class*="ReviewCount"]').first().text().trim();
    const href = $el.find('a').first().attr('href') ?? '';
    const productUrl = href.startsWith('http') ? href : `https://www.capterra.com${href}`;

    // Capterra sometimes exposes pricing as "Starting from $X"
    const priceText = $el.find('[class*="price"], [class*="Price"]').first().text().trim();
    const startingPrice = parseFloat_(priceText.match(/\$([0-9,.]+)/)?.[1]);
    const pricingModel = priceText.toLowerCase().includes('free') ? 'freemium' : 'paid';

    results.push({
      name,
      description,
      category: 'lead-generation',
      pricing_model: startingPrice === 0 ? 'free' : pricingModel,
      starting_price_usd: startingPrice,
      rating: parseFloat_(ratingText),
      review_count: parseInt_(reviewText),
      integrations: [],
      source: 'capterra',
      url: productUrl,
      scraped_at,
    });
  });

  return results;
}

// ---------------------------------------------------------------------------
// Product Hunt scraper
// ---------------------------------------------------------------------------

/**
 * Scrape Product Hunt search results for "ai lead generation".
 * Product Hunt renders enough data in the initial HTML for Cheerio to parse.
 */
async function scrapeProductHunt(scraped_at: string): Promise<ToolRecord[]> {
  const results: ToolRecord[] = [];
  const url = 'https://www.producthunt.com/search?q=ai+lead+generation';

  const html = await fetchHtml(url);
  if (!html) return results;

  const $ = cheerio.load(html);

  // Product Hunt items are rendered inside [data-test="post-item"] or similar list items
  const cards = $('[data-test="post-item"], .post-item, [class*="styles_item"]');

  cards.each((_i, el) => {
    const $el = $(el);

    const name = $el.find('h3, [class*="name"], strong').first().text().trim();
    if (!name) return;

    const description = $el.find('p, [class*="tagline"], [class*="description"]').first().text().trim();
    const votesText = $el.find('[class*="vote"], [class*="votes-count"]').first().text().trim();
    const href = $el.find('a').first().attr('href') ?? '';
    const productUrl = href.startsWith('http') ? href : `https://www.producthunt.com${href}`;

    results.push({
      name,
      description,
      category: 'lead-generation',
      pricing_model: 'unknown',
      starting_price_usd: null,
      // Product Hunt uses upvote counts, not star ratings; we leave rating null
      rating: null,
      review_count: parseInt_(votesText),
      integrations: [],
      source: 'producthunt',
      url: productUrl,
      scraped_at,
    });
  });

  return results;
}

// ---------------------------------------------------------------------------
// Minimal fetch helper (used instead of the full CheerioCrawler for simplicity)
// ---------------------------------------------------------------------------

/**
 * Fetch a URL and return the response body as a string.
 * Uses the global fetch available in Node 18+.
 * Returns null on network error so callers can skip gracefully.
 */
async function fetchHtml(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; ApifyBot/1.0; +https://apify.com/apifybot)',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) {
      console.warn(`[fetchHtml] ${url} returned HTTP ${res.status}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`[fetchHtml] failed for ${url}:`, (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main entrypoint
// ---------------------------------------------------------------------------

await Actor.init();

const rawInput = (await Actor.getInput<Partial<Input>>()) ?? {};

const input: Input = {
  maxResults: rawInput.maxResults ?? 20,
  minRating: rawInput.minRating ?? 0,
  pricingModel: rawInput.pricingModel ?? 'all',
  integrations: rawInput.integrations ?? [],
  sources: rawInput.sources ?? ['g2', 'capterra', 'producthunt'],
};

console.log('[main] Input:', JSON.stringify(input));

const startedAt = Date.now();
const scraped_at = new Date().toISOString();
const allResults: ToolRecord[] = [];
const sourcesScrapped: string[] = [];

// We create a CheerioCrawler for reference but primarily use fetchHtml() for
// direct scraping to avoid the overhead of the request queue for a small actor.
const proxyConfiguration = await Actor.createProxyConfiguration();
const _crawler = new CheerioCrawler({ proxyConfiguration });

for (const source of input.sources) {
  console.log(`[main] Scraping source: ${source}`);

  let batch: ToolRecord[] = [];

  if (source === 'g2') {
    batch = await scrapeG2(_crawler, scraped_at);
  } else if (source === 'capterra') {
    batch = await scrapeCapterra(scraped_at);
  } else if (source === 'producthunt') {
    batch = await scrapeProductHunt(scraped_at);
  }

  console.log(`[main] ${source} raw results: ${batch.length}`);

  if (batch.length > 0) {
    sourcesScrapped.push(source);
    allResults.push(...batch);
  }

  // Respect rate limits between source requests.
  await delay(2000);
}

// Apply filters and cap at maxResults.
const filtered = allResults
  .filter((r) => passesFilters(r, input))
  .slice(0, input.maxResults);

console.log(`[main] Results after filtering: ${filtered.length}`);

await Actor.pushData(filtered);

const metadata: OutputMetadata = {
  total_results: filtered.length,
  run_duration_seconds: Math.round((Date.now() - startedAt) / 100) / 10,
  sources_scraped: sourcesScrapped,
  filters_applied: {
    minRating: input.minRating,
    pricingModel: input.pricingModel,
    integrations: input.integrations,
  },
};

await Actor.setValue('OUTPUT', { results: filtered, metadata });

console.log('[main] Done.', JSON.stringify(metadata));

await Actor.exit();
