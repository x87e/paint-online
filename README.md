# Paint Online - The Paint You Grew Up With
An open-source, online and browser-based tribute to classic desktop Paint.

Supports opening, editing and saving png/jpg/gif/webp file formats up to 2560×2560px (maximum 10MB file size).

This is a passion project dedicated to recreating the simple, fast, and nostalgic feel of Microsoft Paint directly in the browser.
It is in no way affiliated with, associated with, or endorsed by Microsoft. 
This project is purely for fun and is not intended to infringe on Microsoft's proprietary IP in any way.


## Features:
- pencil, eraser, fill, colour picker, magnifier, and nine distinct brush styles.
- line sizes, foreground/background colours, and a custom colour editor.
- the full visible shape palette with outline and solid-fill options, editable placement frames, curve control points, and click-by-click polygons.
- rectangular and free-form selection, select all, invert, repeated movement, cut, copy, paste, delete, crop, and opaque/transparent modes.
- movable and resizable canvas text boxes with font, size, bold, italic, underline, alignment, and background controls.
- resize, canvas properties, rotate, flip, and drag-to-resize handles.
- visible undo and redo controls backed by a bounded in-memory history.
- New, native Open/Save/Save As, drag-and-drop opening, and Print commands.
- zoom, rulers, gridlines, full-screen view, and a thumbnail preview.
- unsaved-work warnings and keyboard shortcuts.

In supported Chromium browsers, Open and Save can work directly with a user-approved local image file. Artwork history stays in the current browser tab.
The app has no external runtime dependencies. You can open `index.html` in a local web browser, or view with a local static HTTP server, for example:
```
python -m http.server 8080 127.0.0.1
```

## Keyboard shortcuts:
- `Ctrl+Z` / `Ctrl+Y`: undo / redo (also available in the top quick-access toolbar)
- `Ctrl+S` / `Ctrl+Shift+S`: save / save as
- `Ctrl+O` / `Ctrl+N`: open / new
- `Ctrl+A`, `Ctrl+C`, `Ctrl+X`, `Ctrl+V`: selection and clipboard commands
- `Delete`: delete the current selection
- `Enter` / `Escape`: apply or cancel the current shape; polygons also support Backspace to remove the last point
- `Ctrl+Page Up` / `Ctrl+Page Down`: zoom in / out
- `Ctrl+G` / `Ctrl+R`: toggle gridlines / rulers

### Known limitations:
- Opened files are limited to 10 MB and must have a `.png`, `.jpg`, `.webp`, `.gif`, or `.bmp` extension that matches both their image MIME type.
- Animated gifs are flattened to a single image frame when edited and saved.
- Canvas width and height are limited to 2560 pixels. Larger opened or pasted images are scaled down proportionally to fit within that area.
- System clipboard image access depends on browser permission. An internal Paint clipboard is used as a fallback.
- Set as desktop background downloads a prepared PNG for manual selection in operating-system settings.
- Print may require pop-ups to be allowed.
- Text remains editable until Apply is selected or another drawing tool is chosen.
- Transparent selection treats the current Colour 2 as the removable background colour.
