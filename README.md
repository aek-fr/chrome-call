# chrome-call

A minimal Chrome extension that turns any selected phone number into a click-to-call
action: highlight a number on a page, right-click, and pick **Appeler** to dial it.

No options page, no content scripts, no tracking — one small service worker and a single
context-menu item.

## What it does

Selecting a number and choosing **Appeler** opens its `tel:` URI, which hands the call off
to whatever your system uses for telephony (Skype, Teams, a softphone, a paired phone…).

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

The extension isn't on the Chrome Web Store; load it from source:

1. Clone or download this repository.
2. Open `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the repository folder.

Requires Chrome 88 or later (or any equivalent Chromium-based browser — Edge, Brave,
Vivaldi…), which is where Manifest V3 service workers became available.

## Usage

Select a phone number on any page, right-click, then choose **Appeler** — the menu entry
shows the number you selected.

If nothing happens after clicking, your system has no application registered to handle
`tel:` links. That handler is what actually places the call; the extension only forwards
the number to it.

## Permissions

Only `contextMenus`, to add the single right-click entry. The extension requests no host
permissions, so it cannot read page content — it only ever receives the text you
explicitly selected. `chrome.tabs.create()` is used to open the `tel:` link and needs no
permission of its own.

## Customising the menu label

The menu entry is French by default. To change it, edit the `title` in `main.js`; `%s` is
substituted with the selected text:

```js
title: "Appeler %s",
```

## Files

| File            | Purpose                                                    |
| --------------- | ---------------------------------------------------------- |
| `manifest.json` | Manifest V3 declaration                                    |
| `main.js`       | Service worker: registers the menu, cleans up and dials    |
| `icons8-*.png`  | Extension icons (16/32/50/64 px)                           |

## Credits

Icons by [Icons8](https://icons8.com).

## License

[GNU General Public License v3.0](LICENSE).
