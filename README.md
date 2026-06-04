# Letters

> Social Media. Elevated.

Letters is a new kind of social media built for deep engagement and elevated discourse. Read the news, write your response, join the conversation.

**tryletters.tech**

---

## Getting Started

### Install dependencies
```bash
npm install
```

### Run locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for production
```bash
npm run build
```

---

## Project Structure

```
letters-app/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx        # Main app with all pages and routing
│   ├── main.jsx       # React entry point
│   └── index.css      # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## Pages

| Route | Description |
|-------|-------------|
| `home` | Homepage with editorial feed and modal |
| `how-it-works` | Dear Reader — How Letters Works |
| `invite` | Request an Early Invitation form |
| `investor` | Investor contact form + private brief |

## Deployment

This project is configured for deployment on [Vercel](https://vercel.com).

1. Push this repo to GitHub
2. Import the repo in Vercel
3. Vercel auto-detects Vite — no config needed
4. Add your custom domain (`tryletters.tech`) in Vercel project settings

---

## Design System

- **Fonts:** Playfair Display (headings), EB Garamond (body), DM Mono (labels), DM Sans (UI)
- **Gold accent:** `#C8A96E`
- **Background:** `#F9F6F0` (warm cream), `#111` (dark)
- **Border:** `#C8BFA8`

---

*Read · Write · Respond*
