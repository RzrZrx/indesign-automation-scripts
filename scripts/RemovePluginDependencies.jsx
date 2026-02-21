// RemovePluginDependencies.jsx
// Automates the removal of third-party plugin dependencies from InDesign files.
// It works by exporting to IDML and immediately saving back as INDD.
// 
// Author: Roger Jemterud (https://github.com/RzrZrx)
// License: MIT

(function () {
    // 1. Prompt the user to select a source folder containing InDesign files using a custom dialog
    var promptResult = (function () {
        var dialog = new Window("dialog", "Remove Plugin Dependencies");
        dialog.orientation = "column";
        dialog.alignChildren = ["left", "top"];
        dialog.margins = 15;

        // Add descriptive text
        var infoGroup = dialog.add("group");
        infoGroup.orientation = "column";
        infoGroup.alignChildren = ["left", "top"];
        infoGroup.spacing = 5;

        infoGroup.add("statictext", undefined, "This script automatically removes third-party plugin dependencies");
        infoGroup.add("statictext", undefined, "from InDesign documents by exporting to IDML and back to INDD.");
        var t3 = infoGroup.add("statictext", undefined, "• Scans the selected folder AND all subfolders recursively.");
        var t4 = infoGroup.add("statictext", undefined, "• Saves stripped files next to originals.");
        var t5 = infoGroup.add("statictext", undefined, "• Suffix added: '_RemovedPluginDependencies.indd'");

        // Add a bit of space before the input
        var divider = dialog.add("panel");
        divider.alignment = "fill";
        divider.minimumSize.height = 2;

        var inputGroup = dialog.add("group");
        inputGroup.orientation = "row";
        inputGroup.alignChildren = ["left", "center"];

        inputGroup.add("statictext", undefined, "Folder Path:");
        var pathInput = inputGroup.add("edittext", undefined, "");
        pathInput.characters = 40; // Wide enough to paste paths comfortably

        var browseBtn = inputGroup.add("button", undefined, "Browse...");

        // Add Example Path Text
        var exampleTextGroup = dialog.add("group");
        exampleTextGroup.orientation = "row";
        exampleTextGroup.alignChildren = ["left", "top"];
        exampleTextGroup.margins.left = 75; // Align under the text input

        var exampleTxt = exampleTextGroup.add("statictext", undefined, "Example: C:\\MyFiles\\InDesign_Projects");

        // Use a smaller font for the example text if available
        try {
            var gFont = ScriptUI.newFont("dialog", "REGULAR", 10);
            exampleTxt.graphics.font = gFont;
        } catch (e) { }
        browseBtn.onClick = function () {
            var f = Folder.selectDialog("Select a folder containing InDesign (.indd) files:");
            if (f) {
                pathInput.text = f.fsName;
            }
        };

        var optionsGroup = dialog.add("group");
        optionsGroup.orientation = "row";
        optionsGroup.alignChildren = ["left", "center"];
        optionsGroup.margins.top = 5;
        var keepIdmlCheckbox = optionsGroup.add("checkbox", undefined, "Keep a copy of the .idml file");

        var bottomGroup = dialog.add("group");
        bottomGroup.orientation = "row";
        bottomGroup.alignChildren = ["fill", "center"];
        bottomGroup.alignment = ["fill", "top"];
        bottomGroup.margins.top = 10;

        // Add Author and License Credit
        var creditGroup = bottomGroup.add("group");
        creditGroup.orientation = "column";
        creditGroup.alignChildren = ["left", "center"];
        creditGroup.alignment = ["left", "center"];

        var creditTxt1 = creditGroup.add("statictext", undefined, "Author: Roger Jemterud (GitHub: RzrZrx)");
        var creditTxt2 = creditGroup.add("statictext", undefined, "License: MIT");

        try {
            var gFontSmall = ScriptUI.newFont("dialog", "REGULAR", 9);
            creditTxt1.graphics.font = gFontSmall;
            creditTxt2.graphics.font = gFontSmall;
        } catch (e) { }

        var btnGroup = bottomGroup.add("group");
        btnGroup.orientation = "row";
        btnGroup.alignChildren = ["right", "center"];
        btnGroup.alignment = ["right", "center"];

        var cancelBtn = btnGroup.add("button", undefined, "Cancel", { name: "cancel" });
        var okBtn = btnGroup.add("button", undefined, "OK", { name: "ok" });

        var result = null;

        okBtn.onClick = function () {
            if (pathInput.text !== "") {
                var f = new Folder(pathInput.text);
                if (f.exists) {
                    result = { folder: f, keepIdml: keepIdmlCheckbox.value };
                    dialog.close(1);
                } else {
                    alert("The specified folder does not exist. Please check the path.");
                }
            } else {
                alert("Please enter or select a folder path.");
            }
        };

        cancelBtn.onClick = function () {
            dialog.close(0);
        };

        if (dialog.show() === 1) {
            return result;
        }
        return null;
    })();

    // Check if the user selected a folder
    if (!promptResult) {
        return; // User canceled the dialog
    }

    var sourceFolder = promptResult.folder;
    var keepIdml = promptResult.keepIdml;

    // Find all .indd files recursively in the selected folder
    var resultFiles = [];

    // Recursive function to get files
    function getFilesRecursive(folder) {
        var files = folder.getFiles();
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file instanceof Folder) {
                // Recursively search subdirectories
                getFilesRecursive(file);
            } else if (file instanceof File && file.name.match(/\.indd$/i)) {
                // Check if it's already a stripped file to prevent endless loops or re-stripping
                if (!file.name.match(/_RemovedPluginDependencies\.indd$/i)) {
                    resultFiles.push(file);
                }
            }
        }
    }

    getFilesRecursive(sourceFolder);

    if (resultFiles.length === 0) {
        alert("No InDesign files found in the selected folder or its subfolders.");
        return;
    }

    // Save the current user interaction level to restore it later
    var originalInteractionLevel = app.scriptPreferences.userInteractionLevel;

    // 3. Set interaction level to NEVER_INTERACT to bypass 'Missing Plugin' and 'Missing Font' warnings
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;

    var successCount = 0;
    var errorLog = [];

    // 2. Loop through every .indd file found
    for (var i = 0; i < resultFiles.length; i++) {
        var file = resultFiles[i];
        var doc = null;
        var newDoc = null;

        try {
            // Open the original document invisibly (false) to avoid flashing windows and improve speed
            doc = app.open(file, false);

            // 4. Export the file to IDML format temporarily in the same folder
            var idmlFileName = file.name.replace(/\.indd$/i, ".idml");
            var idmlFile = new File(file.parent.fsName + "/" + idmlFileName);
            doc.exportFile(ExportFormat.INDESIGN_MARKUP, idmlFile);

            // 6. Close the original document without saving changes
            doc.close(SaveOptions.NO);
            doc = null;

            // 5. Immediately re-import (open) that IDML file
            // Opening IDML strips out any missing/unknown 3rd party plugin data
            newDoc = app.open(idmlFile, false);

            // Save it back as a new .indd file in the same folder with the suffix
            var newFileName = file.name.replace(/\.indd$/i, "_RemovedPluginDependencies.indd");
            var newInddFile = new File(file.parent.fsName + "/" + newFileName);
            newDoc.save(newInddFile);

            // Close the new document
            newDoc.close(SaveOptions.NO);
            newDoc = null;

            // Delete the temporary IDML file if not configured to keep it
            if (!keepIdml && idmlFile.exists) {
                idmlFile.remove();
            }

            successCount++;
        } catch (e) {
            // 7. Basic error handling in case a file is corrupt or locked
            errorLog.push("File: " + file.name + " - Error: " + e.message);

            // Attempt to cleanly close documents if an error fired mid-process
            if (doc !== null) {
                try { doc.close(SaveOptions.NO); } catch (err) { }
            }
            if (newDoc !== null) {
                try { newDoc.close(SaveOptions.NO); } catch (err) { }
            }
        }
    }

    // Restore original interaction level
    app.scriptPreferences.userInteractionLevel = originalInteractionLevel;

    // Report results via alert
    var resultMsg = "Processing complete!\nSuccessfully processed " + successCount + " out of " + resultFiles.length + " files.";

    if (errorLog.length > 0) {
        resultMsg += "\n\nErrors encountered:\n" + errorLog.join("\n");
    }

    // Re-enable interaction for the alert specifically
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
    alert(resultMsg);

    // Restore back to the very original state
    app.scriptPreferences.userInteractionLevel = originalInteractionLevel;
})();
