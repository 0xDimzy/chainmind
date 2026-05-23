# ChainMind — AI Portfolio Advisor

> Professional DeFi portfolio analytics dashboard powered by an autonomous AI agent built on Claude.

**[→ Live Demo](https://chainmind.vercel.app)**

![ChainMind Dashboard](https://i.imgur.com/placeholder.png)

---

## What it does

ChainMind is a 3-panel DeFi dashboard where an AI agent autonomously analyzes your crypto portfolio. It's not a chatbot with finance answers — it's a proper agent with portfolio context, multi-turn memory, and specialized analysis modes.

### Agent capabilities

| Agent Mode | What it does |
|---|---|
| **Risk scan** | Concentration scoring, Sharpe ratio, beta vs BTC, overweight detection |
| **Opportunity scan** | RSI signals, funding rates, momentum analysis, whale wallet patterns |
| **Rebalance advisor** | MPT-based target allocations with gas cost estimates |
| **Market brief** | Fear & Greed digest, BTC dominance, sentiment, portfolio impact |
| **Free-form chat** | Full conversation memory + portfolio context injected per call |

---

## Tech stack

- **React 18** + Vite
- **Chart.js** — performance chart (7D/30D/90D/1Y), sparklines per asset
- **Claude API** (`claude-sonnet-4-20250514`) — agent reasoning engine
- **Vercel** — deployment

---

## Run locally

```bash
git clone https://github.com/YOUR_USERNAME/chainmind
cd chainmind
npm install
npm run dev
```

The Claude API key is handled by Vercel's proxy in production. For local dev, set:

```
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

And update the fetch URL in `App.jsx` to use it:
```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
  "anthropic-version": "2023-06-01",
  "anthropic-dangerous-direct-browser-access": "true",
}
```

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

---

## Agent architecture

```
User query / quick action
        ↓
Context builder (portfolio snapshot + system prompt)
        ↓
Conversation history (last 10 turns)
        ↓
Claude API → claude-sonnet-4-20250514
        ↓
Markdown → HTML formatting
        ↓
Streaming-style display in chat panel
```

---

## Roadmap

- [ ] Live price feeds via CoinGecko API
- [ ] On-chain wallet import (EVM + Solana)
- [ ] Automated daily agent digest via cron
- [ ] Price alert webhooks
- [ ] Multi-wallet support

---

## License

MIT
