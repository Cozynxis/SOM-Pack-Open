# SOM Pack Opener

SOM Pack Opener integrates directly into Somtoday. It does not create a separate grade dashboard.

The extension detects grade values already rendered in the current Somtoday page and places an ONTHUL button directly over each detected grade. Clicking it runs the pack-opening animation as a full-screen overlay, then shows subject, weight and grade.

Reveal state is stored locally with chrome.storage.local. Grade data is not sent to a server.

## Install
1. Clone/download this repository.
2. Open Chrome or Edge extensions.
3. Enable Developer mode.
4. Select Load unpacked.
5. Select this repository folder.
6. Open Somtoday and go to Cijfers.

The detector uses generic DOM patterns because Somtoday can change its internal HTML/classes.