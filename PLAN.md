## ⚠️ UPDATED PLAN — v2 (April 2026)

### What Changed From v1
- Removed (BLOCKED / acquired by G2 Jan 2026):
  - G2 (Cloudflare)
  - Capterra (acquired by G2)
  - GetApp (acquired by G2)
- Added: Futurepedia (sales category), TopAI.tools, Toolify.ai
- Scraping method updated: Cheerio (G2/Capterra) → CheerioCrawler on open-HTML AI directories
- Dual-mode architecture added: compare-tools + extract-data
- RemoteLama attribution added

### v2 Source Selection
**compare-tools mode sources (in priority order):**
  - Futurepedia (sales category)
  - TopAI.tools
  - Toolify.ai
  - Product Hunt (sales topic) — PlaywrightCrawler + RESIDENTIAL proxy, extract from window.__NEXT_DATA__
- Vendor direct pages — always scrapable, used as hardcoded fallback
  - trustradius.com/sales-intelligence/ — CheerioCrawler, static HTML

**extract-data mode:**
  - Primary: Futurepedia.io sales AI tools
  - Method: CheerioCrawler

### v2 Input Schema
**Mode field (required, first field):**
- mode: "compare-tools" | "extract-data" (default: "compare-tools")

**compare-tools inputs:**
- mode (string, required)
- maxResults (integer, default: 25, min: 1, max: 200)

**extract-data inputs:**
- mode (string, required)
- maxResults (integer, default: 25)

### v2 Output Schema
**compare-tools output per item:**
```json
{
  "name": "Tool Name",
  "vendor": "Vendor Inc",
  "description": "What the tool does",
  "pricing_model": "freemium",
  "rating": 4.5,
  "source": "futurepedia",
  "url": "https://...",
  "scraped_at": "2026-04-24T00:00:00Z"
}
```

**extract-data output per item:**
```json
{
  "name": "Tool Name",
  "description": "What the tool does",
  "features": [],
  "pricing": "...",
  "source": "futurepedia",
  "url": "https://...",
  "scraped_at": "2026-04-24T00:00:00Z"
}
```

### v2 Technical Approach
- compare-tools method: CheerioCrawler (Futurepedia/TopAI/TrustRadius) + PlaywrightCrawler+RESIDENTIAL for Product Hunt
- extract-data method: CheerioCrawler
- Proxy: not required for Futurepedia/Toolify
- Memory: 256MB
- Estimated run time: 20–35 seconds

### v2 Build Status
- [ ] Code updated
- [ ] Local test passed
- [ ] GitHub pushed
- [ ] Apify deployed
- [ ] Dry run passed


---

# AI Agents for Lead Generation

## Keyword
ai agents for lead generation

## Problem Statement
Sales teams and growth marketers waste hours manually searching for AI tools that can automate their lead generation pipelines. They need to know which AI agents can scrape prospect data, enrich contact info, qualify leads with scoring models, and trigger outbound sequences — but the landscape changes weekly. There is no single source of truth.

A salesperson at a B2B SaaS company wants to know: "Which AI agents integrate with my CRM and can autonomously find, qualify, and reach out to leads?" They search Google, land on 10 different listicles, and still can't get structured, comparable data.

This actor solves that by scraping AI tool directories, review platforms, and vendor pages to return a structured dataset of AI lead generation agents — complete with pricing, integrations, ratings, and use-case tags.

## What This Actor Does
Takes a set of filter parameters (category, min rating, pricing model, integrations) and scrapes G2, Capterra, Product Hunt, and the Apify Store to return a ranked list of AI agents for lead generation, including name, description, pricing tier, G2/Capterra rating, key integrations, and source URL.

## Target Users
- Primary: Sales Operations Manager at B2B SaaS companies (50–500 employees)
- Secondary: Growth Hacker / Demand Gen Lead at early-stage startups
- Use case examples:
  1. A RevOps manager building a vendor comparison report for the CTO
  2. A startup founder evaluating AI SDR tools before a seed-funded growth push
  3. A marketing agency researching tools to recommend to clients

## Input Schema Design
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| maxResults | integer | no | 20 | Max number of tools to return |
| minRating | number | no | 0 | Minimum G2/Capterra rating (0–5) |
| pricingModel | string | no | "all" | Filter: "free", "freemium", "paid", "all" |
| integrations | array | no | [] | Filter by integration (e.g. ["Salesforce","HubSpot"]) |
| sources | array | no | ["g2","capterra","producthunt"] | Which directories to scrape |

## Output Schema Design
```json
{
  "results": [
    {
      "name": "Apollo.io AI Agent",
      "description": "AI-powered prospecting agent that finds, enriches, and sequences leads automatically.",
      "category": "lead-generation",
      "pricing_model": "freemium",
      "starting_price_usd": 49,
      "rating": 4.5,
      "review_count": 3820,
      "integrations": ["Salesforce", "HubSpot", "Outreach"],
      "source": "g2",
      "url": "https://www.g2.com/products/apollo-io/reviews",
      "scraped_at": "2026-04-23T15:00:00Z"
    }
  ],
  "metadata": {
    "total_results": 20,
    "run_duration_seconds": 8.4,
    "sources_scraped": ["g2", "capterra"],
    "filters_applied": { "minRating": 4.0, "pricingModel": "all" }
  }
}
```

## Technical Approach
- Scraping method: Cheerio (static HTML from G2/Capterra listing pages)
- Proxy needed: Yes — G2 and Capterra rate-limit without proxy rotation
- Authentication needed: No (public listing pages only)
- Rate limiting strategy: 2-second delay between requests, rotate proxies
- Estimated run time for default input: 15–25 seconds
- Memory requirement: 256MB

## Build Complexity
LOW — static HTML scraping of paginated directory listings, no login required.

## Monetization Plan
- Phase 1: Free (build reviews and users)
- Phase 2: $9/month or $0.50/run for unlimited results + daily refresh
- Rationale: Sales tools category has high willingness-to-pay; enrichment data saves hours weekly
