# Publishing checklist

Maintainer notes for submitting this extension to the browser stores. Nothing here is
needed to *use* the extension — see [README.md](README.md) for that.

Ready-to-paste answers for the store forms are in [Store form answers](#store-form-answers).

## Packaging

Build the upload ZIP with an explicit allowlist, so docs and listing assets never leak
into the package:

```sh
FILES="manifest.json main.js _locales icon-16.png icon-32.png icon-48.png icon-128.png LICENSE"

# Firefox / AMO — ships the manifest as-is
zip -r firefox-call.zip $FILES

# Chrome Web Store — same files, with the Firefox-only keys stripped
mkdir -p build/chrome && cp -r $FILES build/chrome/
jq 'del(.background.scripts, .browser_specific_settings)' manifest.json > build/chrome/manifest.json
(cd build/chrome && zip -r ../../chrome-call.zip .)
```

Deliberately excluded: `store/` (listing assets), `*.md`, `icon.svg` (build source),
`.git/`. `LICENSE` **is** included — the extension is GPL-3.0 and the license text should
travel with the distributed code.

**Why strip the keys for Chrome.** Chromium's *loader* provably accepts an MV3 manifest
containing `background.scripts` — there is a Chromium unit test asserting exactly this
shape loads, with the scripts ignored, precisely so one package can serve several browsers.
But the Web Store's *upload and review* validator is a separate, undocumented code path,
and Google documents the tolerance nowhere. Stripping is two lines and removes the only
medium-severity submission risk left. Both zips still come from **one** `manifest.json`, so
there is no second manifest to keep in sync — that is the failure mode this avoids.

If you would rather keep it to a single command, `zip -r chrome-call.zip $FILES` uploaded to
both stores is very likely fine; the strip is insurance, not a requirement.

## Listing assets

All of these are committed under [`store/`](store/) and are already at the exact required
sizes. Chrome rejects screenshots that are not precisely 1280×800 or 640×400.

| Asset | Size | Required? | File |
| ----- | ---- | --------- | ---- |
| Store icon | 128×128 PNG | Yes — in the ZIP *and* uploaded in the dashboard | `store/icon-128.png`, `icon-128.png` |
| Screenshot | 1280×800 PNG | **Yes** — min 1, max 5, exact size, square corners, full bleed | `store/screenshot-1280x800.png` |
| Small promo tile | 440×280 | Yes | `store/promo-440x280.png` |
| Marquee promo tile | 1400×560 | Optional | not produced |

The in-browser icons (`icon-16/32/48/128.png`) are rendered from `icon.svg`. To regenerate
them, re-run the render step against that file — it is the single source of truth for the
artwork.

> Note on icon padding: Google's icon guidance asks for roughly 96×96 of artwork inside the
> 128×128 canvas (≈16px transparent padding). `icon-128.png` follows this. `store/icon-128.png`
> is instead a full-bleed rounded tile, which is what most listings use and is visible against
> dark backgrounds; swap in a padded version if a reviewer ever objects.

## Text fields

| Field | Limit | Value |
| ----- | ----- | ----- |
| Name | 75 chars | Comes from `_locales/*/messages.json` → `extName` |
| Short description | 132 chars | Comes from the manifest `description` (i.e. `extDescription`) |
| Detailed description | — | Adapt the README intro |
| Category | — | `Communication` (alternatives: `Tools`, `Workflow & Planning`) |
| Language | — | English, with French supplied via `_locales` |

Support URL, homepage URL and official URL are all optional.

⚠️ Manifest metadata is **frozen after the first upload** — the name and description you
ship first are what the listing keeps.

## Store form answers

The Chrome Web Store "Privacy practices" tab has five mandatory parts. Answers for this
extension:

**Single purpose**

> Place a telephone call to a phone number the user has selected on a web page, by opening
> that number as a `tel:` link so the operating system's telephony handler can dial it.

**Permission justification — `contextMenus`** (a written justification is required for
*every* declared permission, with no exemption for harmless ones)

> The `contextMenus` permission adds the single right-click entry that is the extension's
> entire user interface. The entry is registered for the `selection` context only, so it
> appears only when the user has selected text. Choosing it opens a `tel:` link built from
> that selection. The extension has no other UI and uses no other permission.

**Remote code**: No — the extension executes no remote code. All logic is in `main.js`.

**Data usage**: declare **no data collected**, and tick the three Limited Use
certifications. The extension reads `info.selectionText` for the selected text only at the
moment the menu item is clicked, uses it to build a `tel:` URL, and never stores,
transmits, or shares it. There is no network code, no storage permission, and no analytics.

> Judgement note: selected text arguably falls under Google's "website content" data
> category. Because nothing is retained or sent anywhere, "no data collected" is the
> accurate declaration — but be ready to explain the reasoning if a reviewer asks.

**Privacy policy URL**: not required, since no user data is handled. Google still nudges
publishers to link a short policy stating exactly that; note that tightened privacy-policy
enforcement took effect on **1 August 2026**, so expect this to be checked.

**EU trader status**: declare **non-trader** (published by an individual, not as a
business). This is an account-level declaration in the dashboard, not per-item. The
documented consequence is that EU consumers are told consumer-protection rights do not
apply to contracts with you; no public postal address or phone number is then required.
Declaring *trader* would instead require publishing your legal name, postal address,
SMS-verified phone number and contact email on the listing.

## Chrome Web Store

- **Fee**: a one-time developer registration fee per account. Widely reported as US$5,
  though Google's own docs no longer state the amount — check the dashboard at signup.
- **Publish limit**: as of 2026 a *new* publisher account defaults to **two** published
  extensions, with increases granted per-publisher based on quality and usage. The old
  "20 extensions" figure is out of date.
- **Review time**: usually a few days; Google's guidance allows for longer. There is no
  paid fast-track.

## Microsoft Edge Add-ons

The same ZIP works unmodified — no manifest or code changes. Microsoft's only blanket
manifest requirements are to omit `update_url` and to avoid "Chrome" in the name or
description; neither applies here.

- **Fee**: none. Publishing is free.
- **Review**: up to 7 business days, for new submissions and updates alike.
- Requires a Single Purpose Description (reuse the one above) and a logo of at least
  128×128 (300×300 recommended) — `store/icon-128.png` satisfies the minimum.
- A privacy policy URL is required only if the extension collects personal data.

Edge users *can* install straight from the Chrome Web Store via an "Allow extensions from
other stores" toggle, but a Chrome listing does not appear in Edge Add-ons search — a
separate submission is needed for discoverability there.

## Firefox / addons.mozilla.org

The manifest is already Firefox-ready in a single package: it declares **both**
`background.service_worker` (Chrome) and `background.scripts` (Firefox), which is
Mozilla's documented pattern for one cross-browser manifest. Each browser reads only the
key it implements, and `main.js` is shared unchanged.

Already in place:

- `browser_specific_settings.gecko.id` — **mandatory** for MV3; AMO will not assign an ID,
  so `web-ext sign` and submission both fail without it.
- `strict_min_version: "121.0"` — not 109 (when Firefox got MV3). Firefox 109–120 install
  the dual-key manifest cleanly but **silently never start the background script**, so the
  menu would never appear. 121 is the correct floor. Chrome's matching floor is 121 too:
  before Chrome 121, `background.scripts` in an MV3 manifest was refused outright.

Distribution: signing by Mozilla is **mandatory** and always goes through AMO, even for
self-hosted (unlisted) distribution. A Mozilla account is needed; there are no fees.
Release and Beta Firefox will not install unsigned extensions at all. Review is automated
validation on every submission plus possible human review, typically signed within 24
hours.

On AMO's linter, the dual-key manifest **passes**. Current `addons-linter` replaced the old
blanket `MANIFEST_FIELD_UNSUPPORTED` with two specific results:

| Manifest shape | `addons-linter` result |
| -------------- | ---------------------- |
| `service_worker` alone | **Error** `BACKGROUND_SERVICE_WORKER_NOFALLBACK` — blocks submission |
| `service_worker` + `scripts` ← what this repo ships | **Warning** `BACKGROUND_SERVICE_WORKER_IGNORED` — non-blocking |

Still worth running `web-ext lint` before submitting: which linter version AMO's server-side
validator pins could not be determined, so confirm the warning is not an error there.

## Other Chromium browsers

| Browser | Store | Changes needed |
| ------- | ----- | -------------- |
| Brave | None — installs from the Chrome Web Store | None |
| Vivaldi | None — installs from the Chrome Web Store | None. Depends on *Settings → Privacy and Security → Google Extensions → Web Store* being enabled (on by default) |
| Opera | Its own store, `addons.opera.com` | None. Only accepts Manifest V3 for new uploads, which suits this extension. Its rules forbid obfuscated *or minified* code, so upload `main.js` as-is |

Do **not** add `minimum_chrome_version` — no target browser needs it.

## Open risks

Things worth checking manually rather than trusting this document:

Two of these need a real machine and cannot be settled by reading docs:

1. **`tel:` hand-off, everywhere.** `tel:` is *not* on Chromium's external-protocol
   allowlist (only `mailto:` is special-cased), so the call goes through the external
   protocol confirmation dialog — expect a one-time "Open <phone app>?" prompt. Two
   unknowns worth testing: what happens with **no OS handler registered** (community
   reports say silently nothing, which matches the README's troubleshooting note), and
   whether `tabs.create` leaves a **stray `about:blank` tab** behind after hand-off. Test
   on Windows with and without a softphone, macOS (FaceTime usually claims `tel:`), and
   Linux (often no handler at all). If the stray tab is real, capture the tab id from
   `tabs.create` and close it, or navigate the current tab instead.
2. **`tel:` on Firefox** — same questions, less documented. `tabs.create()` excludes only
   `file:` and privileged `about:` URLs, and `tel` is a recognised external scheme, so the
   call should be accepted; the runtime hand-off and the leftover `about:blank` are
   unconfirmed. Smoke-test before submitting to AMO.

Lower priority:

3. **`web-ext lint` result** for the dual-key manifest — see the Firefox section.
4. **Chrome install warning.** The dual-key manifest produces exactly one non-fatal
   warning: `'background.scripts' requires manifest version of 2 or lower.` It does not
   block loading or submission, and stripping the key for the Chrome zip (see
   [Packaging](#packaging)) avoids it entirely. `browser_specific_settings` produces **no**
   warning — Chromium explicitly allowlists that key, so the older "Unrecognized manifest
   key" reports no longer apply. Neither could be measured here: the Chromium build used
   for testing does not expose install warnings via `chrome://extensions-internals`, so
   confirm on a normal Chrome at `chrome://extensions`.
5. **Brave service-worker regression** (`brave-browser` #45338, open) — extension service
   workers reportedly going inactive and staying dead after restart, first reported against
   an architecturally identical context-menu extension. Unverified on current Brave. Note
   the failure mode: menus created in `onInstalled` persist across worker termination, so
   the symptom would be a **visible menu entry that does nothing**, not a missing one.
6. **Opera's "must do more than link out" rule** — its criteria reject extensions that
   "just consist of a button linking to a website". Frame the listing around the
   sanitise-and-dial behaviour, and never minify `main.js` for Opera (it forbids minified
   code). Opera's own docs wrongly claim `tabs` permission is needed for `tabs.create`; do
   not add it.
7. **Safari**, if it ever becomes a target: `%s` interpolation in menu titles is
   undocumented there and may not exist, in which case the user would see a literal `%s`
   with no workaround — a Safari build would need a selection-free title. `menus.create` is
   also unsupported on Firefox for Android and Safari iOS, so there is no mobile story on
   those platforms, which is a pity given `tel:` matters most on a phone.

**Sourcing caveat.** The behavioural claims above (dual-key manifest, `%s` surviving i18n,
`fr-CH` → `fr` fallback, linter results, `tel:` not allowlisted) were established by reading
current Chromium, Firefox and `addons-linter` source plus Chromium's own unit tests, and are
solid. The **store-policy** claims are weaker — Google's docs repo that much of the wording
traces to was archived in March 2024 — so spot-check these in the live dashboard: the exact
fee amount, the data-usage checkbox strings, the detailed-description limit, and the trader
enforcement timeline.
