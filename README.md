# Remove Plugin Dependencies (InDesign)

An Adobe InDesign ExtendScript (`.jsx`) that automates the removal of third-party plugin dependencies from `.indd` files. 

When you open an InDesign file that uses a plugin you do not have installed, InDesign typically displays a "Missing Plugins" warning. This script bypasses those warnings, silently exports the document to IDML format (which strips out unknown plugin data), and then immediately re-imports and saves it as a clean `.indd` file.

## Features
- **ScriptUI Dialog:** Includes a clean UI to select or paste a target folder path.
- **Recursive Scanning:** Automatically scans the selected folder and all of its subfolders for `.indd` files.
- **Silent Processing:** Bypasses "Missing Plugin" and "Missing Font" alerts to allow for fast, bulk processing.
- **In-Place Saving:** Saves the cleaned `.indd` files next to the originals.
- **Auto-Renaming:** Appends `_RemovedPluginDependencies.indd` to the processed files.
- **Safety Checks:** Ignores already processed files to prevent infinite loops and gracefully handles locked or corrupted files without crashing.

## Usage
1. Open Adobe InDesign.
2. Open the Scripts panel (`Window` > `Utilities` > `Scripts`).
3. Right-click on the `User` folder in the Scripts panel and select "Reveal in Explorer" (Windows) or "Reveal in Finder" (Mac).
4. Copy `RemovePluginDependencies.jsx` into that `Scripts Panel` folder.
5. Back in InDesign, double-click the script in the Scripts panel to run it.
6. Paste or browse for a folder containing your `.indd` files and click OK.

## Author
**Roger Jemterud** (GitHub: [RzrZrx](https://github.com/RzrZrx))

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
