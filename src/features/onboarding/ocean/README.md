# ascii-sharks

Vendored from https://github.com/stackedlol/ascii-sharks at commit a0074c1 (MIT, Copyright (c) 2026 drewdi).

Local changes:

- `OceanEngine` emits shark head snapshots for the speech overlay.
- `World` lets sharks roam the whole stage, including behind the header, and flips speech bubbles when there is no room above the head.
- The renderer is theme-aware, transparent, and monochrome plus the OpenCore red, so the ocean sits on the app's dot grid instead of a dark panel.
- Pointer splashes ignore clicks outside the canvas.
- The unused React wrapper was left out.
