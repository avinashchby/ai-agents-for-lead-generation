# AI Agents for Lead Generation — Finder & Comparator

**Runs on [Apify](https://apify.com)**

Find and compare the best AI agents for lead generation by scraping G2, Capterra, and Product Hunt in a single run. Built for sales ops managers, growth marketers, and founders assembling B2B outbound pipelines who need a fast, structured view of the AI SDR and prospecting tool landscape — without manually trawling three different review sites.

---

## What it does

- Scrapes **G2** (`/categories/ai-lead-generation`), **Capterra** (`/lead-generation-software/`), and **Product Hunt** for AI-powered sales automation agents and prospecting tools
- Filters results by minimum rating, pricing model, and required CRM integrations (e.g. Salesforce, HubSpot)
- Returns **structured JSON** with pricing, ratings, review counts, integrations, and source URLs for every tool
- **Deduplicates** by tool name across sources so you don't get the same product listed three times
- Caps output at `maxResults` so you control dataset size and run cost

---

## Input

| Field | Type | Default | Description |
|---|---|---|---|
| `maxResults` | integer | `20` | Maximum number of tools to return across all sources (1–200) |
| `minRating` | number | `0` | Minimum G2/Capterra star rating to include (0–5). Tools below this threshold are excluded |
| `pricingModel` | string | `"all"` | Filter by pricing tier: `all`, `free`, `freemium`, or `paid` |
| `integrations` | array of strings | `[]` | Return only tools that list at least one of these integrations (e.g. `["salesforce", "hubspot", "pipedrive"]`). Leave empty to skip this filter |
| `sources` | array of strings | `["g2", "capterra", "producthunt"]` | Which directories to scrape. Any subset of `g2`, `capterra`, `producthunt` |

---

## Output

Each item pushed to the Apify dataset follows this shape:

```json
{
  "name": "Apollo.io",
  "description": "AI-powered prospecting and outbound platform with contact enrichment and sequencing.",
  "category": "lead-generation",
  "pricing_model": "freemium",
  "starting_price_usd": 49,
  "rating": 4.5,
  "review_count": 6821,
  "integrations": ["salesforce", "hubspot", "outreach"],
  "source": "g2",
  "url": "https://www.g2.com/products/apollo-io/reviews",
  "scraped_at": "2025-04-23T14:00:00.000Z"
}
```

The `OUTPUT` key-value store entry also contains a `metadata` object:

```json
{
  "metadata": {
    "total_results": 42,
    "run_duration_seconds": 8.3,
    "sources_scraped": ["g2", "capterra", "producthunt"],
    "filters_applied": {
      "minRating": 4.0,
      "pricingModel": "all",
      "integrations": ["salesforce"]
    }
  }
}
```

---

## Example use cases

- **AI SDR tool shortlist**: Pull all b2b lead generation AI tools from G2 with a rating above 4.0 that integrate with Salesforce — feed the results straight into a comparison spreadsheet
- **Pricing research**: Filter by `pricingModel: "freemium"` across all three sources to identify ai prospecting software your team can trial before committing budget
- **Market mapping**: Run with no filters and `maxResults: 200` to get a broad snapshot of the automated lead generation space, then cluster by integrations or pricing tier in your own pipeline

---

## How to run

**From the Apify Console**: open the actor page, fill in the input form, and hit Start. Results appear in the dataset tab when the run finishes.

**Via the Apify API**:

```http
POST https://api.apify.com/v2/acts/<actor-id>/runs
Authorization: Bearer <your-api-token>
Content-Type: application/json

{
  "maxResults": 50,
  "minRating": 4.0,
  "pricingModel": "all",
  "integrations": ["salesforce", "hubspot"],
  "sources": ["g2", "capterra", "producthunt"]
}
```

Retrieve results from the run's default dataset once the run status is `SUCCEEDED`.

---

## About

This is an open-source Apify actor maintained at [github.com/avinashchby/ai-agents-for-lead-generation](https://github.com/avinashchby/ai-agents-for-lead-generation). Contributions, issue reports, and selector fixes are welcome — review site markup changes frequently and PRs that update scraper selectors are especially appreciated.
