# CIA POS Lite

Mobile-first POS for small businesses in Armenia.

## v0.1 frontend

The first cashier workflow is implemented:

- responsive phone / tablet / desktop layout;
- product catalog with category filters and search;
- shopping cart with quantity controls;
- automatic totals in AMD;
- payment sheet for cash, card and IDRAM / QR;
- HDM online status placeholder;
- mobile bottom navigation;
- receipt, products, reports and settings navigation placeholders.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Current architecture direction

```text
CIA POS Web / PWA
        |
        v
CIA API / local bridge
        |
        v
CIA HDM Agent
        |
        v
HDM / fiscal device
```

The frontend currently uses demo products and local React state. Fiscalization, persistence, authentication and real HDM communication are intentionally not connected yet.
