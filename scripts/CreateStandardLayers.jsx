// CreateStandardLayers.jsx
// Automates the creation of a standard set of layers in the active InDesign document.
// If a layer already exists, it will color-code it and arrange it in the correct stacking order.
//
// Top to bottom layer structure:
// 1. Thumbnail
// 2. Dieline / Cut (Non-printing)
// 3. Guides (Non-printing)
// 4. Artwork
// 5. Placebox - Autoloading the one up file
// 6. Background / Paper

(function () {
    // Ensure a document is open
    if (app.documents.length === 0) {
        alert("Please open an InDesign document before running this script.");
        return;
    }

    var doc = app.activeDocument;

    // --- Add Dieline Spot Color ---
    var dielineColorName = "Dieline";
    var dielineColor = doc.colors.itemByName(dielineColorName);

    // Check if the color already exists
    if (!dielineColor.isValid) {
        // Create the new color
        dielineColor = doc.colors.add({
            name: dielineColorName,
            model: ColorModel.SPOT,
            space: ColorSpace.CMYK,
            colorValue: [100, 0, 0, 0] // 100% Cyan
        });
    }

    // Define the standard layers in order from TOP to BOTTOM
    // You can customize the name, color, and whether it prints or not
    var standardLayers = [
        { name: "Thumbnail", color: UIColors.YELLOW, printable: true, locked: false },
        { name: "Dieline / Cut", color: UIColors.RED, printable: true, locked: true },
        { name: "Guides", color: UIColors.CYAN, printable: false, locked: true },
        { name: "Artwork", color: UIColors.GREEN, printable: true, locked: false },
        { name: "Placebox - Autoloading the one up file", color: UIColors.MAGENTA, printable: true, locked: false },
        { name: "Background / Paper", color: UIColors.WHITE, printable: true, locked: true }
    ];

    // By looping backwards (from bottom to top) and moving each layer to the top of the stack,
    // we guarantee the final order exactly matches out array (top to bottom).
    for (var i = standardLayers.length - 1; i >= 0; i--) {
        var config = standardLayers[i];

        // 1. Check if layer already exists
        var layer = doc.layers.itemByName(config.name);

        // 2. If it does not exist, create it
        if (!layer.isValid) {
            layer = doc.layers.add({ name: config.name });
        }

        // 3. Update or set its properties
        // We unlock it first just in case it was already locked and we need to modify it
        layer.locked = false;
        layer.layerColor = config.color;
        layer.printable = config.printable;

        // 4. Move to the very top of the layer list
        // Since we are processing the bottom-most layer first, it gets pushed down as we loop.
        layer.move(LocationOptions.AT_BEGINNING);

        // 5. Appy final lock state after moving
        layer.locked = config.locked;
    }

    // Optional clean-up: Rename "Layer 1" if it's completely empty?
    // Often InDesign has a default "Layer 1". We can leave it or try to delete it if empty.
    var defaultLayer = doc.layers.itemByName("Layer 1");
    if (defaultLayer.isValid && defaultLayer.pageItems.length === 0) {
        try {
            defaultLayer.remove();
        } catch (e) {
            // Fails silently if "Layer 1" has items or is locked
        }
    }

    alert("Standard layers have been created and ordered successfully!");
})();
