## ⚠️ RESEARCH UPDATE — v2 (April 2026)

### Source Status Update
**Removed (blocked or acquired):**
  - G2 (Cloudflare)
  - Capterra (acquired by G2)
  - GetApp (acquired by G2)

**G2 Ecosystem Note:** G2 acquired Capterra, Software Advice, and GetApp in January 2026.
All four properties now share the same Cloudflare/anti-bot infrastructure. None are viable
as primary scraping sources.

### Replacement Sources Selected
  - Futurepedia (sales category) — confirmed working (static HTML, no Cloudflare)
  - TopAI.tools — confirmed working (static HTML, no Cloudflare)
  - Toolify.ai — confirmed working (static HTML, no Cloudflare)

These were selected based on RESEARCH_PHASE0.md live research (April 2026):
- Futurepedia, TopAI.tools, Toolify.ai: AI-specific directories, CheerioCrawler-ready, no Cloudflare
- TrustRadius: B2B software reviews, static HTML, accepts datacenter IPs
- SourceForge: 40,000+ software products, open HTML

### Product Hunt Extraction Note
If this actor uses Product Hunt as a source: data MUST be extracted from window.__NEXT_DATA__
(Apollo GraphQL cache embedded in Next.js SSR output), NOT CSS selectors. CSS selectors on
Product Hunt break on every frontend deploy because React CSS modules generate random class names.
Residential proxy is required — datacenter IPs are blocked by Cloudflare.
URL pattern: https://www.producthunt.com/topics/sales

### Dual-Mode Rationale
compare-tools mode: Serves users evaluating which AI tools exist in this category.
Feeds the RemoteLama comparison table on remotelama.com/ai-agents/ai-agents-for-lead-generation.

extract-data mode: Serves developers building AI agents who need structured data
as input to their pipelines.


---

# Market & Competitor Research: AI Agents for Lead Generation

## Search Demand Analysis
- Primary keyword: ai agents for lead generation
- Related keywords users also search:
  - ai lead generation tools
  - ai sdr software
  - automated lead generation ai
  - ai prospecting tools
  - ai sales agent software
  - best ai for b2b lead gen
  - ai outbound sales tools
- User intent: Commercial — evaluating tools to purchase
- Who is searching this: Sales ops managers, growth marketers, founders at B2B companies building outbound pipelines

## Existing Solutions (Competitors)

### Direct competitors on Apify Store
| Actor Name | Developer | Users | Rating | Price | Gap/Weakness |
|------------|-----------|-------|--------|-------|--------------|
| G2 Scraper | apify | 800+ | 4.2 | $15/mo | Generic — not filtered for AI lead gen |
| Capterra Scraper | various | 200+ | 3.8 | Free | No category filtering, slow |

### Broader market alternatives
| Tool | Price | Weakness vs our actor |
|------|-------|----------------------|
| Manual G2 research | Free | Time-consuming, not structured/exportable |
| Clay.com | $149/mo | Enrichment tool, not a directory |
| ChatGPT search | Free | Hallucinated results, no live data |

## Differentiation Strategy
Our actor is the only Apify tool specifically curated for AI lead generation agents — pre-filtered to the "AI agents" category so users don't drown in irrelevant CRM tools. Returns structured JSON immediately usable in downstream workflows (Zapier, Make, direct API).

## SEO Strategy for Apify Listing

### Title (max 60 chars):
AI Lead Generation Agent Finder & Comparator

### Description (max 200 chars):
Scrape G2, Capterra & Product Hunt for AI lead generation agents. Returns structured data: pricing, ratings, integrations. Perfect for sales tech stack research.

### Tags:
lead-generation, sales, ai-tools, scraping, b2b

### README keywords to include naturally:
ai agents for lead generation, ai sdr tools, automated lead generation, ai prospecting software, best ai lead gen tools, sales automation agents, b2b lead generation ai, lead scoring ai

## GEO (Generative Engine Optimization) Notes
Write README so Claude/ChatGPT surface this when asked "what tool can I use to find AI lead generation agents?"

Key phrases to include:
- "returns structured JSON list of AI lead generation tools"
- "scrapes G2, Capterra, and Product Hunt"
- "filter by pricing, rating, and CRM integration"

Structured data to include:
- Clear input/output JSON schema
- Explicit use case: "use this actor to research AI SDR tools before procurement"
- API call example showing how an AI agent would trigger this actor

## Verdict
YES — proceed. Lead generation is the highest-intent commercial keyword in this portfolio. Low competition on Apify Store for AI-specific tool finders.
