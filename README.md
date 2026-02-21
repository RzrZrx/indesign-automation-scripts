# InDesign Automation Scripts

A collection of Adobe InDesign ExtendScripts (`.jsx`) for automating common layout and production tasks.

## 1. Remove Plugin Dependencies
`scripts/RemovePluginDependencies.jsx`

When you open an InDesign file that uses a plugin you do not have installed, InDesign typically displays a "Missing Plugins" warning. This script bypasses those warnings, silently exports the document to IDML format (which strips out unknown plugin data), and then immediately re-imports and saves it as a clean `.indd` file.

### Features
- **ScriptUI Dialog:** Includes a clean UI to select or paste a target folder path and configure settings.
- **Recursive Scanning:** Automatically scans the selected folder and all of its subfolders for `.indd` files.
- **Silent Processing:** Bypasses "Missing Plugin" and "Missing Font" alerts to allow for fast, bulk processing.
- **In-Place Saving:** Saves the cleaned `.indd` files next to the originals.
- **Overwrite Original (Destructive):** An optional destructive mode that completely overwrites the original `.indd` file instead of creating a new copy.
- **Keep IDML Option:** Optionally choose to keep the generated `.idml` files alongside the processed `.indd` files.
- **Auto-Renaming:** Appends `_RemovedPluginDependencies.indd` to the processed files.
- **Safety Checks:** Ignores already processed files to prevent infinite loops and gracefully handles locked or corrupted files without crashing.

---

## 2. Create Standard Layers
`scripts/CreateStandardLayers.jsx`

Automates the creation of a standard, organized set of layers in the active InDesign document. If a layer already exists, the script will color-code it and arrange it in the correct stacking order.

### Features
- **Auto-Creation:** Instantly builds a standard 7-layer structure (Thumbnail, kiss-cut, die-cut, Guides, Artwork, Placebox, Background).
- **Smart Properties:** Automatically locks utility layers (kiss-cut, die-cut, Guides, Background) and sets them to print/non-print as needed.
- **Color Coding:** Applies specific layer colors to keep your document visually organized.
- **Spot Color Generation:** Automatically checks for and creates `100% Cyan` ("kiss-cut") and `100% Magenta` ("die-cut") Spot Colors in your Swatches panel.
- **Stacking Order:** Ensures the layers are always ordered correctly from top to bottom, even if they already existed.

---

## Usage
1. Open Adobe InDesign.
2. Open the Scripts panel (`Window` > `Utilities` > `Scripts`).
3. Right-click on the `User` folder in the Scripts panel and select "Reveal in Explorer" (Windows) or "Reveal in Finder" (Mac).
4. Copy the `.jsx` scripts into that `Scripts Panel` folder.
5. Back in InDesign, double-click the script in the Scripts panel to run it.

## Author
**Roger Jemterud** (GitHub: [RzrZrx](https://github.com/RzrZrx))

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
