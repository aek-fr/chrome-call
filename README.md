# chrome-call

A minimal browser extension that turns any selected phone number into a click-to-call
action: highlight a number on a page, right-click, and pick **Call** to dial it.

No options page, no content scripts, no tracking — one small background script and a single
context-menu item. Works in Chrome, Edge, Firefox and other Chromium browsers from the same
package.

## What it does

Selecting a number and choosing **Call** opens its `tel:` URI, which hands the call off to
whatever your system uses for telephony (Skype, Teams, a softphone, a paired phone…).

Before dialling, the selection is cleaned up so numbers copied out of real web pages work
as-is — surrounding labels, spaces, dots, dashes and parentheses are all discarded:

| Selected text            | Dials              |
| ------------------------ | ------------------ |
| `+41 21 123 45 67`       | `tel:+41211234567` |
| `+41 (0)21 123 45 67`    | `tel:+41211234567` |
| `(0)21 123 45 67`        | `tel:0211234567`   |
| `Tél. 021 123 45 67`     | `tel:0211234567`   |
| `021 123 45 67 (bureau)` | `tel:0211234567`   |
| `+1 (555) 010-9999`      | `tel:+15550109999` |
| `no digits here`         | nothing happens    |

Two details worth knowing:

- **The trunk prefix `(0)` is dropped only when the number is international** (i.e. it
  contains a `+`), since `+41 (0)21` must be dialled as `+4121`. A domestic `(0)21` keeps
  its leading zero.
- **A selection with no digits is ignored**, so a stray right-click never opens an empty
  `tel:` tab.

## Install

The extension isn't published in any store yet; load it from source.

**Chrome, Edge, Brave, Vivaldi, Opera**

1. Clone or download this repository.
2. Open `chrome://extensions` (`edge://extensions`, etc.) and enable **Developer mode**.
3. Click **Load unpacked** and select the repository folder.

Requires Chrome 121 or later. (Manifest V3 itself works from Chrome 88, but this repo ships
a single cross-browser manifest, and Chrome only tolerates that shape from 121 — see
[PUBLISHING.md](PUBLISHING.md).)

**Firefox** — requires Firefox 121 or later.

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and pick `manifest.json`.

Note that a temporary add-on is removed when Firefox restarts; a permanent install has to be
signed by Mozilla.

## Usage

Select a phone number on any page, right-click, then choose **Call** — the menu entry shows
the number you selected.

If nothing happens after clicking, your system has no application registered to handle
`tel:` links. That handler is what actually places the call; the extension only forwards
the number to it. Note that Chromium does not treat `tel:` as a trusted protocol, so you may
also get a one-time confirmation prompt asking which application to open.

## Permissions

Only `contextMenus`, to add the single right-click entry. The extension requests no host
permissions, so it cannot read page content — it only ever receives the text you
explicitly selected, and only at the moment you click the menu entry. Nothing is stored or
sent anywhere; there is no network code. `chrome.tabs.create()` is used to open the `tel:`
link and needs no permission of its own.

Your browser will therefore report that this extension has **no access to site content**.
That is the intended design, not a broken install: the browser hands the selected text to
the extension with the click event, so there is nothing to read from the page. See
[ADR-001](ARCHITECTURE.md#adr-001--no-host-permissions).

## Translating

Interface strings live in [`_locales/`](_locales), and English and French ship today.
`default_locale` is `en`, so any browser language other than French falls back to English.
French covers every regional variant — a browser set to Swiss or Canadian French resolves to
`_locales/fr` — so there is no need for `fr_CH` or `fr_CA` folders.

To add a language, copy `_locales/en/messages.json` to `_locales/<code>/messages.json` and
translate the three `message` values. Use an underscore in regional codes (`pt_BR`, not
`pt-BR`) — a hyphenated folder passes validation but is silently never loaded.

Two rules for the `menuTitle` string:

- Keep **exactly one `%s`**. The browser replaces it with the selected text, and there is no
  way to escape it — so a translation containing `%s` as ordinary letters (any word where
  `s` follows a percent sign) would break.
- Write `&&` for a literal ampersand; a single `&` is treated as an access-key marker.

A key you leave out falls back to the English string silently, so a partial translation is
fine but a typo'd key name is easy to miss.

## Files

| File            | Purpose                                                        |
| --------------- | -------------------------------------------------------------- |
| `manifest.json` | Manifest V3 declaration, shared by Chrome and Firefox          |
| `main.js`       | Registers the menu, cleans up the selection, opens the `tel:` link |
| `_locales/`     | Interface strings (`en`, `fr`)                                 |
| `icon.svg`      | Icon source; the PNGs are rendered from it                     |
| `icon-*.png`    | Extension icons (16/32/48/128 px)                              |
| `store/`        | Store listing assets — not part of the extension               |

Further reading:

- [ARCHITECTURE.md](ARCHITECTURE.md) — the runtime model, the decision record explaining why
  the code looks the way it does, the privacy and threat model, known failure modes and the
  test strategy. **Read this before changing behaviour or adding a permission.**
- [PUBLISHING.md](PUBLISHING.md) — packaging and submitting to the Chrome Web Store, Edge
  Add-ons and addons.mozilla.org.

## Credits

Phone glyph based on [Feather Icons](https://feathericons.com) (MIT).

## License

[GNU General Public License v3.0](LICENSE).
