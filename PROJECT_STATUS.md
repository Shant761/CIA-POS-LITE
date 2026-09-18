# CIA POS — Project Status

**Snapshot:** 18 September 2026  
**Current priority:** stable MVP + Plug and Play Armenia Batch 4 application on 20 September 2026.

## Product vision

CIA POS is a mobile-first POS platform for small businesses. The goal is to combine sales, inventory, product identification, fiscal workflows and receipt printing on affordable Android/mobile hardware.

Brand line: **«Больше, чем просто касса» / “More than just a POS”.**

Long-term direction: one Android device can become POS + EAN/Data Matrix scanner + inventory terminal + fiscal/HDM client +, in a future update, bank SoftPOS/NFC terminal.

## Current MVP

Implemented / working in the current product or existing CIA integration stack:

- POS sale screen and cart.
- Product quantity changes and totals.
- Shop and restaurant modes.
- Restaurant tables, guests, open orders, precheck and service fee flow.
- Product catalog, categories and prices.
- Product create/edit flow.
- Lightweight product photos displayed in catalog and receipt/cart.
- Barcode/EAN scanning from smartphone camera.
- Existing EAN adds the product to the sale; repeated scans increase quantity.
- Unknown barcode can be routed to product creation/back office.
- Inventory/warehouse balances.
- Supplies/stock receipts and stock movements.
- POS stock availability display and prevention of overselling when negative stock is disabled.
- Optional setting to allow negative stock.
- Cashier/admin PIN login and POS lock/logout flow.
- Administrator PIN can be changed from Settings.
- Shift workflow.
- Payment UI for cash/card/QR and mixed payment where applicable.
- RU / EN / HY multilingual interface foundation.
- ESC/POS LAN printing foundation and precheck printing.
- CIA HDM Agent exists as the fiscal integration layer and is the basis for connecting CIA POS to Armenian fiscal hardware/workflows.

## Data Matrix — current design decision

Data Matrix is **not tied to EAN**.

EAN identifies/adds a product. Data Matrix identifies a **specific physical marked unit during the sale**.

Required checkout flow for a marked product:

`Product x3 -> DM 1/3 -> DM 2/3 -> DM 3/3 -> payment`

Rules:

- A marked product has a `markingRequired` flag.
- Quantity N requires N unique Data Matrix scans before checkout.
- The same Data Matrix cannot be accepted twice in one receipt.
- A previously sold Data Matrix must not be sold again.
- If required marking is incomplete, payment must remain blocked.
- Data Matrix scanning happens as part of the sale/checkout flow and does not require pre-linking every code to an EAN.

**Current priority:** finish and validate this complete flow in the real POS checkout.

## HDM / fiscalization

CIA already has experience and an existing HDM Agent/integration stack. For CIA POS, the critical production goal is to close the complete transaction chain:

`CIA POS -> payment/checkout -> HDM Agent -> fiscal confirmation -> sale closed -> stock movement`

A sale should not be treated as successfully finalized if the required fiscal operation fails.

## Future update — SoftPOS

SoftPOS/NFC card acceptance is intentionally **not a blocker for the current MVP**.

Future concept:

`CIA POS -> Card -> bank-certified SoftPOS -> customer taps card/phone on Android NFC device -> SUCCESS/transaction ID -> CIA POS -> fiscalization -> receipt`

CIA POS should not handle raw bank-card credentials. Integration should use an official bank-certified SoftPOS SDK, Intent/App-to-App API or ECR integration protocol.

This is especially attractive for small/remote merchants using mobile internet where deploying a separate physical payment terminal is expensive or inconvenient.

Potential strategic value: CIA POS can become a merchant acquisition/distribution channel for a partner bank while the bank avoids deploying a dedicated terminal for every compatible merchant scenario.

## Team and operating model

- **SHANT — Founder / Developer:** vision, product direction, Unity/software development, architecture, integrations, prototyping and implementation.
- **ANDO — Product Manager:** live team member; product/project coordination.
- **NOVA — AI product/development assistant.**
- **MARKO — AI marketing/CMO role.**
- **DOLARUS — AI finance role.**
- **JOY LAB STUDIO:** shared AI/project hub and source-of-truth workflow for projects and decisions.

Public/investor wording should be accurate: this is an **AI-assisted product and development workflow**, not a claim that AI roles are human employees.

Operating pipeline:

`IDEA -> VALIDATION -> PROTOTYPE -> TEST -> DECISION -> PRODUCTION -> RELEASE`

The AI-assisted workflow is an execution advantage, but the CIA POS pitch must remain focused on the POS product and merchant problem.

## Founder / market context

CIA POS is based on practical POS and fiscal-integration experience rather than a theoretical POS idea. Existing CIA work includes Poster POS integration, Armenian HDM/fiscal workflows, ESC/POS printing and merchant operational problems.

Important pitch rule: existing CIA SOFT/Poster customers must **not** be represented as CIA POS customers unless they actually pilot/use CIA POS. They can support founder-market experience, while CIA POS traction must be reported separately and honestly.

## Plug and Play Armenia — 20 September plan

**Internal submission date: 20 September 2026.**

The goal is not merely to seek a grant. The strategic goal is to use the program to validate CIA POS as a scalable business, reach mentors/partners/investors, prepare merchant pilots and potentially open conversations with banks/payment providers.

Before submission we need:

1. Stable mobile MVP demo.
2. Complete critical sale flow, especially Data Matrix and fiscal/HDM path as far as demo-ready.
3. Application text: problem, solution, customer, differentiation, stage, business model, market, team, roadmap and program goals.
4. 8–10 slide pitch deck.
5. Clear initial pricing hypothesis and basic unit economics.
6. Pilot target — initial working goal: first 10 merchant pilots.
7. 1–2 minute product demo video if useful/accepted.

## Pitch positioning

Do **not** position CIA POS merely as a cheaper Poster clone.

Preferred direction:

> CIA POS is a mobile-first point-of-sale platform that helps small businesses manage sales, inventory, product identification and fiscal operations from affordable Android devices.

Core message:

> **One device. One POS. Everything a small merchant needs.**

Roadmap message:

`Android -> CIA POS -> EAN/Data Matrix -> inventory -> HDM/fiscalization -> receipt printing -> future SoftPOS/NFC`

## Immediate priorities

Until the 20 September application, avoid expanding the MVP with large non-critical features.

Priority order:

1. Finish Data Matrix checkout enforcement.
2. Validate the complete sale and stock flow.
3. Validate/finish the HDM production path required for the demo.
4. Run a mobile/desktop stability and UX audit.
5. Prepare application, pitch, economics and demo.
6. Seek at least one real merchant willing to pilot CIA POS if possible.

After submission, continue with returns/marking restoration, employee roles/PINs, cloud/multi-device synchronization, security hardening, analytics and later SoftPOS partnerships.

---

This file is the current project snapshot. Update it when a major product, architecture, business or roadmap decision changes.
