(function () {
  const root = document.documentElement;
  const paintApp = document.getElementById("paintApp");
  const fileButton = document.getElementById("menuFile");
  const fileMenu = document.getElementById("fileMenu");
  const commandUndo = document.getElementById("commandUndo");
  const commandRedo = document.getElementById("commandRedo");
  const paintViewport = document.getElementById("paintViewport");
  const canvas = document.getElementById("editingCanvas");
  const canvasFrame = document.getElementById("canvasFrame");
  const dimensionsLabel = document.getElementById("canvasDimensions");
  const zoomPercent = document.getElementById("zoomPercent");
  const zoomRange = document.getElementById("zoomRange");
  const viewZoomReset = document.getElementById("viewZoomReset");
  const viewZoomPercentText = document.getElementById("viewZoomPercentText");
  const viewZoomLabelPercent = document.getElementById("viewZoomLabelPercent");
  const colour1Preview = document.getElementById("colour1Preview");
  const colour2Preview = document.getElementById("colour2Preview");
  const statusBar = document.getElementById("paintStatus");
  const statusMessage = document.querySelector(".status-message");
  const viewRulers = document.getElementById("viewRulers");
  const viewGridlines = document.getElementById("viewGridlines");
  const viewStatusBar = document.getElementById("viewStatusBar");
  const viewFullScreen = document.getElementById("viewFullScreen");
  const viewThumbnail = document.getElementById("viewThumbnail");
  const commandEditColours = document.getElementById("commandEditColours");
  const horizontalRuler = document.getElementById("horizontalRuler");
  const verticalRuler = document.getElementById("verticalRuler");
  const thumbnailWindow = document.getElementById("thumbnailWindow");
  const thumbnailCanvas = document.getElementById("thumbnailCanvas");
  const thumbnailContext = thumbnailCanvas.getContext("2d");
  const editColoursDialog = document.getElementById("editColoursDialog");
  const basicColoursGrid = document.getElementById("basicColoursGrid");
  const customColoursGrid = document.getElementById("customColoursGrid");
  const colourSpectrum = document.getElementById("colourSpectrum");
  const colourSpectrumContext = colourSpectrum.getContext("2d");
  const luminositySlider = document.getElementById("luminositySlider");
  const luminosityContext = luminositySlider.getContext("2d");
  const spectrumMarker = document.getElementById("spectrumMarker");
  const luminosityMarker = document.getElementById("luminosityMarker");
  const dialogColourPreview = document.getElementById("dialogColourPreview");
  const fieldHue = document.getElementById("fieldHue");
  const fieldSat = document.getElementById("fieldSat");
  const fieldLum = document.getElementById("fieldLum");
  const fieldRed = document.getElementById("fieldRed");
  const fieldGreen = document.getElementById("fieldGreen");
  const fieldBlue = document.getElementById("fieldBlue");
  const openImageInput = document.getElementById("openImageInput");
  const selectionOptions = document.getElementById("selectionOptions");
  const operationDialog = document.getElementById("operationDialog");
  const operationDialogForm = document.getElementById("operationDialogForm");
  const operationDialogTitle = document.getElementById("operationDialogTitle");
  const operationDialogMessage = document.getElementById("operationDialogMessage");
  const operationDialogFields = document.getElementById("operationDialogFields");
  const operationDialogConfirm = document.getElementById("operationDialogConfirm");
  const operationDialogCancel = document.getElementById("operationDialogCancel");
  const drawingContext = canvas.getContext("2d", { willReadFrequently: true });
  const selectionOverlay = document.createElement("div");
  selectionOverlay.className = "canvas-selection";
  selectionOverlay.hidden = true;
  selectionOverlay.setAttribute("aria-hidden", "true");
  const selectionMaskCanvas = document.createElement("canvas");
  selectionMaskCanvas.className = "selection-mask-outline";
  selectionMaskCanvas.setAttribute("aria-hidden", "true");
  selectionOverlay.appendChild(selectionMaskCanvas);
  canvasFrame.appendChild(selectionOverlay);

  const paletteColours = [
    "#000000", "#7f7f7f", "#880015", "#ed1c24", "#ff7f27", "#fff200", "#22b14c", "#00a2e8", "#3f48cc", "#a349a4",
    "#ffffff", "#c3c3c3", "#b97a57", "#ffaec9", "#ffc90e", "#efe4b0", "#b5e61d", "#99d9ea", "#7092be", "#c8bfe7",
    "#f0f0f0", "#a0a0a0", "#6f3f2a", "#c00000", "#ff8040", "#ffff80", "#80ff80", "#80ffff", "#8080ff", "#d8bfd8"
  ];

  const basicDialogColours = [
    "#ff8080", "#ffff80", "#80ff80", "#00c060", "#80ffff", "#0080ff", "#ff80c0", "#ff80ff",
    "#ff0000", "#ffff00", "#80ff00", "#00ff40", "#00ffff", "#0080c0", "#8080c0", "#ff00ff",
    "#808080", "#ff8040", "#00ff00", "#008040", "#0080ff", "#8080ff", "#800080", "#ff0080",
    "#800000", "#ff8000", "#008000", "#008060", "#0000ff", "#000080", "#8000ff", "#8000c0",
    "#400000", "#804000", "#004000", "#004040", "#000080", "#000040", "#400040", "#400080",
    "#000000", "#808000", "#808040", "#808080", "#408080", "#c0c0c0", "#400040", "#ffffff"
  ];

  const MIN_ZOOM = 10;
  const MAX_ZOOM = 200;
  const MIN_CANVAS_DIMENSION = 64;
  const MAX_CANVAS_DIMENSION = 2560;
  const MAX_IMAGE_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_HISTORY_BYTES = 64 * 1024 * 1024;
  const DEFAULT_CANVAS_WIDTH = 886;
  const DEFAULT_CANVAS_HEIGHT = 635;
  const IMAGE_FILE_RULES = Object.freeze({
    png: {
      label: "PNG",
      mimeTypes: ["image/png"],
      matchesSignature(bytes) {
        return bytes.length >= 8
          && bytes[0] === 0x89
          && bytes[1] === 0x50
          && bytes[2] === 0x4e
          && bytes[3] === 0x47
          && bytes[4] === 0x0d
          && bytes[5] === 0x0a
          && bytes[6] === 0x1a
          && bytes[7] === 0x0a;
      }
    },
    jpg: {
      label: "JPG",
      mimeTypes: ["image/jpeg"],
      matchesSignature(bytes) {
        return bytes.length >= 3
          && bytes[0] === 0xff
          && bytes[1] === 0xd8
          && bytes[2] === 0xff;
      }
    },
    webp: {
      label: "WebP",
      mimeTypes: ["image/webp"],
      matchesSignature(bytes) {
        return bytes.length >= 12
          && bytes[0] === 0x52
          && bytes[1] === 0x49
          && bytes[2] === 0x46
          && bytes[3] === 0x46
          && bytes[8] === 0x57
          && bytes[9] === 0x45
          && bytes[10] === 0x42
          && bytes[11] === 0x50;
      }
    },
    gif: {
      label: "GIF",
      mimeTypes: ["image/gif"],
      matchesSignature(bytes) {
        return bytes.length >= 6
          && bytes[0] === 0x47
          && bytes[1] === 0x49
          && bytes[2] === 0x46
          && bytes[3] === 0x38
          && (bytes[4] === 0x37 || bytes[4] === 0x39)
          && bytes[5] === 0x61;
      }
    },
    bmp: {
      label: "BMP",
      mimeTypes: ["image/bmp", "image/x-ms-bmp"],
      matchesSignature(bytes) {
        return bytes.length >= 2
          && bytes[0] === 0x42
          && bytes[1] === 0x4d;
      }
    }
  });
  const brushChoices = [
    { label: "Brush", value: "brush", iconClass: "brush-option-icon brush-icon-brush" },
    { label: "Calligraphy 1", value: "calligraphy1", iconClass: "brush-option-icon brush-icon-calligraphy1" },
    { label: "Calligraphy 2", value: "calligraphy2", iconClass: "brush-option-icon brush-icon-calligraphy2" },
    { label: "Airbrush", value: "airbrush", iconClass: "brush-option-icon brush-icon-airbrush" },
    { label: "Oil brush", value: "oil", iconClass: "brush-option-icon brush-icon-oil" },
    { label: "Crayon", value: "crayon", iconClass: "brush-option-icon brush-icon-crayon" },
    { label: "Marker", value: "marker", iconClass: "brush-option-icon brush-icon-marker" },
    { label: "Pencil", value: "pencil", iconClass: "brush-option-icon brush-icon-pencil" },
    { label: "Watercolour", value: "watercolour", iconClass: "brush-option-icon brush-icon-watercolour" }
  ];

  const state = {
    activeColourRole: "colour1",
    colour1: "#000000",
    colour2: "#ffffff",
    activeTool: "brush",
    activeShape: "shapeLine",
    brushStyle: "brush",
    brushSize: 3,
    shapeOutline: true,
    shapeFill: false,
    zoom: 100,
    canvasWidth: DEFAULT_CANVAS_WIDTH,
    canvasHeight: DEFAULT_CANVAS_HEIGHT,
    showThumbnail: false,
    fullscreenFallback: false,
    zoomResetTimer: 0,
    customColours: Array(16).fill(""),
    selectedCustomColourIndex: -1,
    dialogReturnFocus: null,
    fileName: "untitled.png",
    fileHandle: null,
    fileMimeType: "image/png",
    dirty: false,
    history: [],
    historyIndex: -1,
    historyBytes: 0,
    cleanHistoryIndex: 0,
    pointerMode: "",
    pointerButton: 0,
    startPoint: null,
    lastPoint: null,
    previewImageData: null,
    previewShapeOptions: null,
    pendingShape: null,
    polygonDraft: null,
    selection: null,
    selectionMove: null,
    selectionFloating: null,
    selectionMode: "rectangular",
    freeFormDraft: null,
    transparentSelection: false,
    internalClipboard: null,
    activeChoiceMenu: null,
    textEditor: null,
    textStyle: {
      fontFamily: "Segoe UI",
      fontSize: 24,
      bold: false,
      italic: false,
      underline: false,
      alignment: "left",
      opaque: false
    },
    operationDialogResolve: null,
    operationDialogReturnFocus: null,
    editColour: {
      hex: "#000000",
      rgb: { r: 0, g: 0, b: 0 },
      hsl: { h: 160, s: 0, l: 0 }
    },
    syncingColourFields: false
  };

  function setStatus(message) {
    statusMessage.textContent = message || "";
  }

  function syncRibbonOverflow() {
    document.querySelectorAll(".paint-ribbon").forEach((ribbon) => {
      ribbon.classList.remove("has-horizontal-overflow");
      ribbon.style.removeProperty("--ribbon-scrollbar-height");
      if (ribbon.hidden) {
        return;
      }

      const scroller = ribbon.querySelector(".ribbon-scroll");
      if (!scroller || scroller.scrollWidth <= scroller.clientWidth + 1) {
        return;
      }

      const scrollbarHeight = Math.max(14, scroller.offsetHeight - scroller.clientHeight);
      ribbon.style.setProperty("--ribbon-scrollbar-height", `${scrollbarHeight}px`);
      ribbon.classList.add("has-horizontal-overflow");
    });
  }

  function setRibbon(targetId) {
    document.querySelectorAll("[data-ribbon-target]").forEach((tab) => {
      const isActive = tab.dataset.ribbonTarget === targetId;
      tab.classList.toggle("is-active", isActive);
    });

    document.querySelectorAll(".paint-ribbon").forEach((ribbon) => {
      const isActive = ribbon.id === targetId;
      ribbon.hidden = !isActive;
      ribbon.classList.toggle("is-active", isActive);
    });

    closeFileMenu();
    window.requestAnimationFrame(syncRibbonOverflow);
  }

  function openFileMenu() {
    fileMenu.hidden = false;
    fileButton.setAttribute("aria-expanded", "true");
  }

  function closeFileMenu() {
    fileMenu.hidden = true;
    fileButton.setAttribute("aria-expanded", "false");
  }

  function toggleFileMenu() {
    if (fileMenu.hidden) {
      openFileMenu();
    } else {
      closeFileMenu();
    }
  }

  function updateColourPreviews() {
    colour1Preview.style.backgroundColor = state.colour1;
    colour2Preview.style.backgroundColor = state.colour2;
    document.getElementById("colour1").classList.toggle("is-selected", state.activeColourRole === "colour1");
    document.getElementById("colour2").classList.toggle("is-selected", state.activeColourRole === "colour2");
  }

  function setActiveColourRole(role) {
    state.activeColourRole = role;
    updateColourPreviews();
  }

  function setColour(colour, role) {
    const targetRole = role || state.activeColourRole;
    if (targetRole === "colour2") {
      state.colour2 = colour;
    } else {
      state.colour1 = colour;
    }

    updateColourPreviews();
    if (state.textEditor) {
      state.textEditor.colour = colourForPointer(state.textEditor.button);
      syncTextEditorStyles();
    }
    if (state.pendingShape) {
      state.pendingShape.options.outlineColour = colourForPointer(state.pendingShape.options.pointerButton);
      state.pendingShape.options.fillColour = oppositeColourForPointer(state.pendingShape.options.pointerButton);
      redrawPendingShape();
    }
    if (state.polygonDraft) {
      state.polygonDraft.options.outlineColour = colourForPointer(state.polygonDraft.options.pointerButton);
      state.polygonDraft.options.fillColour = oppositeColourForPointer(state.polygonDraft.options.pointerButton);
      renderPolygonDraft();
    }
    setStatus(`${targetRole === "colour2" ? "Colour 2" : "Colour 1"} set to ${colour.toUpperCase()}`);
  }

  function updateDocumentTitle() {
    document.title = `${state.dirty ? "* " : ""}${state.fileName} - Paint Online`;
  }

  function setControlDisabled(control, disabled) {
    control.disabled = disabled;
    control.classList.toggle("is-disabled", disabled);
    control.setAttribute("aria-disabled", String(disabled));
  }

  function flashPressedButton(button) {
    if (!button || button.disabled) {
      return;
    }
    button.classList.add("is-pressed");
    window.clearTimeout(Number(button.dataset.pressTimer || 0));
    const timer = window.setTimeout(() => {
      button.classList.remove("is-pressed");
      delete button.dataset.pressTimer;
    }, 400);
    button.dataset.pressTimer = String(timer);
  }

  function captureDocumentSnapshot(label) {
    const imageData = drawingContext.getImageData(0, 0, canvas.width, canvas.height);
    return {
      width: canvas.width,
      height: canvas.height,
      imageData,
      bytes: imageData.data.byteLength,
      label
    };
  }

  function updateHistoryControls() {
    const canUndo = state.historyIndex > 0;
    const canRedo = state.historyIndex >= 0 && state.historyIndex < state.history.length - 1;
    setControlDisabled(commandUndo, !canUndo);
    setControlDisabled(commandRedo, !canRedo);

    const undoEntry = canUndo ? state.history[state.historyIndex] : null;
    const redoEntry = canRedo ? state.history[state.historyIndex + 1] : null;
    commandUndo.title = undoEntry ? `Undo ${undoEntry.label} (Ctrl+Z)` : "Nothing to undo";
    commandRedo.title = redoEntry ? `Redo ${redoEntry.label} (Ctrl+Y)` : "Nothing to redo";
    commandUndo.setAttribute("aria-label", undoEntry ? `Undo ${undoEntry.label}` : "Undo");
    commandRedo.setAttribute("aria-label", redoEntry ? `Redo ${redoEntry.label}` : "Redo");
  }

  function resetHistory(label) {
    const snapshot = captureDocumentSnapshot(label);
    state.history = [snapshot];
    state.historyIndex = 0;
    state.historyBytes = snapshot.bytes;
    state.cleanHistoryIndex = 0;
    state.dirty = false;
    updateDocumentTitle();
    updateHistoryControls();
  }

  function commitHistory(label) {
    if (state.historyIndex < state.history.length - 1) {
      const removedEntries = state.history.splice(state.historyIndex + 1);
      state.historyBytes -= removedEntries.reduce((total, entry) => total + entry.bytes, 0);
    }

    const snapshot = captureDocumentSnapshot(label);
    state.history.push(snapshot);
    state.historyBytes += snapshot.bytes;
    state.historyIndex = state.history.length - 1;

    while (state.historyBytes > MAX_HISTORY_BYTES && state.history.length > 1) {
      const removed = state.history.shift();
      state.historyBytes -= removed.bytes;
      state.historyIndex -= 1;
      state.cleanHistoryIndex -= 1;
    }

    state.dirty = state.historyIndex !== state.cleanHistoryIndex;
    updateDocumentTitle();
    updateHistoryControls();
    setStatus(label);
  }

  function restoreHistoryEntry(entry) {
    clearSelection();
    updateCanvasSize(entry.width, entry.height, { preserve: false });
    drawingContext.putImageData(entry.imageData, 0, 0);
    updateThumbnail();
  }

  function undo() {
    if (state.polygonDraft) {
      cancelPolygonDraft();
      return;
    }
    if (state.pendingShape) {
      cancelPendingShape();
      return;
    }
    if (state.historyIndex <= 0) {
      setStatus("Nothing to undo");
      return;
    }

    state.historyIndex -= 1;
    restoreHistoryEntry(state.history[state.historyIndex]);
    state.dirty = state.historyIndex !== state.cleanHistoryIndex;
    updateDocumentTitle();
    updateHistoryControls();
    setStatus(`Undo: ${state.history[state.historyIndex + 1].label}`);
  }

  function redo() {
    if (state.polygonDraft) {
      cancelPolygonDraft();
      return;
    }
    if (state.pendingShape) {
      cancelPendingShape();
      return;
    }
    if (state.historyIndex >= state.history.length - 1) {
      setStatus("Nothing to redo");
      return;
    }

    state.historyIndex += 1;
    restoreHistoryEntry(state.history[state.historyIndex]);
    state.dirty = state.historyIndex !== state.cleanHistoryIndex;
    updateDocumentTitle();
    updateHistoryControls();
    setStatus(`Redo: ${state.history[state.historyIndex].label}`);
  }

  function markCurrentHistoryClean() {
    state.cleanHistoryIndex = state.historyIndex;
    state.dirty = false;
    updateDocumentTitle();
    updateHistoryControls();
  }

  function closeChoiceMenu() {
    if (!state.activeChoiceMenu) {
      return;
    }

    const { menu, anchor } = state.activeChoiceMenu;
    menu.remove();
    anchor.setAttribute("aria-expanded", "false");
    state.activeChoiceMenu = null;
  }

  function showChoiceMenu(anchor, choices, onSelect, menuClass) {
    closeChoiceMenu();
    closeFileMenu();

    const menu = document.createElement("div");
    menu.className = "paint-choice-menu";
    if (menuClass) {
      menu.classList.add(menuClass);
    }
    menu.setAttribute("role", "menu");

    choices.forEach((choice) => {
      if (choice.heading) {
        const heading = document.createElement("div");
        heading.className = "paint-choice-heading";
        heading.setAttribute("role", "presentation");
        heading.textContent = choice.heading;
        menu.appendChild(heading);
        return;
      }

      const option = document.createElement("button");
      option.type = "button";
      option.className = "paint-choice-option";
      option.setAttribute("role", "menuitem");
      if (choice.title) {
        option.title = choice.title;
      }
      if (choice.iconClass) {
        option.classList.add("has-icon");
        const icon = document.createElement("span");
        icon.className = `selection-menu-icon ${choice.iconClass}`;
        icon.setAttribute("aria-hidden", "true");
        const label = document.createElement("span");
        label.textContent = choice.label;
        option.append(icon, label);
      } else {
        option.textContent = choice.label;
      }
      if (choice.selected) {
        option.classList.add("is-selected");
        option.setAttribute("aria-current", "true");
      }
      if (choice.disabled) {
        option.disabled = true;
        option.classList.add("is-disabled");
        option.setAttribute("aria-disabled", "true");
      }
      option.addEventListener("click", (event) => {
        event.stopPropagation();
        if (choice.disabled) {
          return;
        }
        onSelect(choice.value);
        closeChoiceMenu();
        anchor.focus();
      });
      menu.appendChild(option);
    });

    document.body.appendChild(menu);
    const anchorRect = anchor.getBoundingClientRect();
    const left = Math.min(anchorRect.left, window.innerWidth - menu.offsetWidth - 6);
    const top = Math.min(anchorRect.bottom + 2, window.innerHeight - menu.offsetHeight - 6);
    menu.style.left = `${Math.max(4, left)}px`;
    menu.style.top = `${Math.max(4, top)}px`;
    anchor.setAttribute("aria-haspopup", "menu");
    anchor.setAttribute("aria-expanded", "true");
    state.activeChoiceMenu = { menu, anchor };

    const firstOption = menu.querySelector("button:not(:disabled)");
    if (firstOption) {
      firstOption.focus();
    }
  }

  function normaliseRectangle(start, end) {
    const left = Math.max(0, Math.min(start.x, end.x));
    const top = Math.max(0, Math.min(start.y, end.y));
    const right = Math.min(canvas.width, Math.max(start.x, end.x));
    const bottom = Math.min(canvas.height, Math.max(start.y, end.y));
    return {
      x: Math.round(left),
      y: Math.round(top),
      width: Math.max(0, Math.round(right - left)),
      height: Math.max(0, Math.round(bottom - top))
    };
  }

  function selectionIncludesLocalPoint(selection, x, y) {
    const localX = Math.floor(x);
    const localY = Math.floor(y);
    if (
      localX < 0
      || localY < 0
      || localX >= selection.width
      || localY >= selection.height
    ) {
      return false;
    }
    return !selection.mask || selection.mask[localY * selection.width + localX] > 0;
  }

  function cloneSelection(selection) {
    if (!selection) {
      return null;
    }
    return {
      ...selection,
      mask: selection.mask ? selection.mask.slice() : null
    };
  }

  function pointInsideSelection(point) {
    const selection = state.selection;
    return Boolean(selection) && selectionIncludesLocalPoint(
      selection,
      point.x - selection.x,
      point.y - selection.y
    );
  }

  function imageDataCanvas(imageData) {
    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = imageData.width;
    sourceCanvas.height = imageData.height;
    sourceCanvas.getContext("2d").putImageData(imageData, 0, 0);
    return sourceCanvas;
  }

  function cloneCanvas(source) {
    const copy = document.createElement("canvas");
    copy.width = source.width;
    copy.height = source.height;
    copy.getContext("2d").drawImage(source, 0, 0);
    return copy;
  }

  function maskedSelectionCanvas(source, selection) {
    const copy = cloneCanvas(source);
    if (!selection.mask) {
      return copy;
    }

    const context = copy.getContext("2d", { willReadFrequently: true });
    const imageData = context.getImageData(0, 0, copy.width, copy.height);
    for (let index = 0; index < selection.mask.length; index += 1) {
      if (!selection.mask[index]) {
        imageData.data[index * 4 + 3] = 0;
      }
    }
    context.putImageData(imageData, 0, 0);
    return copy;
  }

  function fillSelectionOnContext(context, selection, colour) {
    if (!selection.mask) {
      context.fillStyle = colour;
      context.fillRect(selection.x, selection.y, selection.width, selection.height);
      return;
    }

    const imageData = context.getImageData(
      selection.x,
      selection.y,
      selection.width,
      selection.height
    );
    const fill = hexToRgb(colour);
    for (let index = 0; index < selection.mask.length; index += 1) {
      if (!selection.mask[index]) {
        continue;
      }
      const offset = index * 4;
      imageData.data[offset] = fill.r;
      imageData.data[offset + 1] = fill.g;
      imageData.data[offset + 2] = fill.b;
      imageData.data[offset + 3] = 255;
    }
    context.putImageData(imageData, selection.x, selection.y);
  }

  function transparentCanvas(source, colour) {
    if (!colour) {
      return cloneCanvas(source);
    }

    const copy = cloneCanvas(source);
    const context = copy.getContext("2d", { willReadFrequently: true });
    const imageData = context.getImageData(0, 0, copy.width, copy.height);
    const transparent = hexToRgb(colour);
    for (let offset = 0; offset < imageData.data.length; offset += 4) {
      if (
        imageData.data[offset] === transparent.r
        && imageData.data[offset + 1] === transparent.g
        && imageData.data[offset + 2] === transparent.b
      ) {
        imageData.data[offset + 3] = 0;
      }
    }
    context.putImageData(imageData, 0, 0);
    return copy;
  }

  function currentSelectionCanvas() {
    if (!state.selection) {
      return null;
    }
    if (state.selectionFloating) {
      return cloneCanvas(state.selectionFloating.image);
    }
    const source = imageDataCanvas(drawingContext.getImageData(
      state.selection.x,
      state.selection.y,
      state.selection.width,
      state.selection.height
    ));
    return maskedSelectionCanvas(source, state.selection);
  }

  function removeVisibleSelection() {
    if (!state.selection) {
      return;
    }
    if (state.selectionFloating) {
      drawingContext.putImageData(
        state.selectionFloating.underlay,
        state.selection.x,
        state.selection.y
      );
      return;
    }
    fillSelectionOnContext(drawingContext, state.selection, state.colour2);
  }

  function redrawFloatingSelection() {
    if (!state.selection || !state.selectionFloating) {
      return;
    }
    drawingContext.putImageData(
      state.selectionFloating.underlay,
      state.selection.x,
      state.selection.y
    );
    const renderSource = transparentCanvas(
      state.selectionFloating.image,
      state.transparentSelection ? state.colour2 : null
    );
    drawingContext.drawImage(renderSource, state.selection.x, state.selection.y);
    updateThumbnail();
  }

  function setTransparentSelection(enabled) {
    const nextValue = Boolean(enabled);
    selectionOptions.classList.toggle("is-selected", nextValue);
    selectionOptions.setAttribute("aria-pressed", String(nextValue));
    selectionOptions.title = nextValue ? "Selection options: transparent" : "Selection options: opaque";
    selectionOverlay.classList.toggle("is-transparent", nextValue);
    if (state.transparentSelection === nextValue) {
      setStatus(nextValue ? "Transparent selection enabled" : "Opaque selection enabled");
      return;
    }
    state.transparentSelection = nextValue;

    if (state.selectionFloating) {
      redrawFloatingSelection();
      commitHistory(nextValue ? "Selection made transparent" : "Selection made opaque");
    } else {
      setStatus(nextValue ? "Transparent selection enabled" : "Opaque selection enabled");
    }
  }

  function updateSelectionCommands() {
    const hasSelection = Boolean(state.selection && state.selection.width > 0 && state.selection.height > 0);
    setControlDisabled(document.getElementById("commandCut"), !hasSelection);
    setControlDisabled(document.getElementById("commandCopy"), !hasSelection);
    setControlDisabled(document.getElementById("toolCrop"), !hasSelection);
  }

  function renderSelectionMaskOutline(selection) {
    const hasMask = Boolean(selection && selection.mask);
    selectionOverlay.classList.toggle("is-masked", hasMask);
    selectionMaskCanvas.hidden = !selection;
    if (!selection) {
      selectionMaskCanvas.width = 1;
      selectionMaskCanvas.height = 1;
      return;
    }

    selectionMaskCanvas.width = selection.width;
    selectionMaskCanvas.height = selection.height;
    const context = selectionMaskCanvas.getContext("2d");
    if (!hasMask) {
      context.clearRect(0, 0, selection.width, selection.height);
      context.strokeStyle = "#fff";
      context.lineWidth = 1;
      context.setLineDash([4, 4]);
      context.strokeRect(
        0.5,
        0.5,
        Math.max(0, selection.width - 1),
        Math.max(0, selection.height - 1)
      );
      return;
    }

    const imageData = context.createImageData(selection.width, selection.height);
    const { mask, width, height } = selection;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const index = y * width + x;
        if (!mask[index]) {
          continue;
        }
        const boundary = (
          x === 0
          || y === 0
          || x === width - 1
          || y === height - 1
          || !mask[index - 1]
          || !mask[index + 1]
          || !mask[index - width]
          || !mask[index + width]
        );
        if (!boundary) {
          continue;
        }
        if ((x + y) % 8 >= 4) {
          continue;
        }
        const offset = index * 4;
        imageData.data[offset] = 255;
        imageData.data[offset + 1] = 255;
        imageData.data[offset + 2] = 255;
        imageData.data[offset + 3] = 255;
      }
    }
    context.putImageData(imageData, 0, 0);
  }

  function updateSelectionOverlay() {
    if (!state.selection || state.selection.width < 1 || state.selection.height < 1) {
      selectionOverlay.hidden = true;
      renderSelectionMaskOutline(null);
      updateSelectionCommands();
      return;
    }

    selectionOverlay.hidden = false;
    selectionOverlay.style.left = `${state.selection.x}px`;
    selectionOverlay.style.top = `${state.selection.y}px`;
    selectionOverlay.style.width = `${state.selection.width}px`;
    selectionOverlay.style.height = `${state.selection.height}px`;
    selectionOverlay.classList.toggle("is-transparent", state.transparentSelection);
    renderSelectionMaskOutline(state.selection);
    updateSelectionCommands();
    document.querySelector(".status-selection").setAttribute(
      "aria-label",
      `Selection size ${state.selection.width} by ${state.selection.height} pixels`
    );
  }

  function clearSelection() {
    clearFreeFormDraft();
    state.selection = null;
    state.selectionMove = null;
    state.selectionFloating = null;
    selectionOverlay.hidden = true;
    renderSelectionMaskOutline(null);
    document.querySelector(".status-selection").setAttribute("aria-label", "Selection size");
    updateSelectionCommands();
  }

  function setActiveTool(tool, label) {
    if (state.polygonDraft) {
      finalizePolygonDraft();
    }
    if (state.pendingShape) {
      commitPendingShape();
    }
    if (state.textEditor && tool !== "text") {
      commitTextEditor();
    }
    state.activeTool = tool;
    if (tool !== "select") {
      clearSelection();
    }

    const toolMap = {
      pencil: "toolPencil",
      fill: "toolFill",
      text: "toolText",
      eraser: "toolEraser",
      eyedropper: "toolEyedrop",
      magnifier: "toolMagnifier"
    };

    document.querySelectorAll(".tool-button").forEach((button) => {
      button.classList.toggle("is-active", toolMap[tool] === button.id);
    });
    document.getElementById("toolBrushes").classList.toggle("is-selected", tool === "brush");
    document.getElementById("toolSelect").classList.toggle("is-selected", tool === "select");
    document.querySelectorAll(".shape-button").forEach((button) => {
      button.classList.toggle("is-active", tool === "shape" && button.id === state.activeShape);
    });
    setControlDisabled(document.getElementById("shapeFill"), tool !== "shape");
    paintApp.dataset.activeTool = tool;
    paintApp.dataset.brushStyle = state.brushStyle;
    setStatus(`${label || tool} selected`);
  }

  function clamp(value, min, max) {
    const numeric = Number.parseInt(value, 10);
    if (Number.isNaN(numeric)) {
      return min;
    }
    return Math.max(min, Math.min(max, numeric));
  }

  function componentToHex(component) {
    return clamp(component, 0, 255).toString(16).padStart(2, "0");
  }

  function rgbToHex(rgb) {
    return `#${componentToHex(rgb.r)}${componentToHex(rgb.g)}${componentToHex(rgb.b)}`;
  }

  function hexToRgb(hex) {
    const normalised = hex.replace("#", "").padEnd(6, "0").slice(0, 6);
    return {
      r: Number.parseInt(normalised.slice(0, 2), 16),
      g: Number.parseInt(normalised.slice(2, 4), 16),
      b: Number.parseInt(normalised.slice(4, 6), 16)
    };
  }

  function rgbToPaintHsl(rgb) {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const diff = max - min;
      s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

      if (max === r) {
        h = (g - b) / diff + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / diff + 2;
      } else {
        h = (r - g) / diff + 4;
      }

      h /= 6;
    }

    const currentHue = state.editColour && state.editColour.hsl ? state.editColour.hsl.h : 160;
    return {
      h: max === min ? currentHue : Math.round(h * 239),
      s: Math.round(s * 240),
      l: Math.round(l * 240)
    };
  }

  function hueToRgb(p, q, t) {
    let nextT = t;
    if (nextT < 0) nextT += 1;
    if (nextT > 1) nextT -= 1;
    if (nextT < 1 / 6) return p + (q - p) * 6 * nextT;
    if (nextT < 1 / 2) return q;
    if (nextT < 2 / 3) return p + (q - p) * (2 / 3 - nextT) * 6;
    return p;
  }

  function paintHslToRgb(hsl) {
    const h = clamp(hsl.h, 0, 239) / 239;
    const s = clamp(hsl.s, 0, 240) / 240;
    const l = clamp(hsl.l, 0, 240) / 240;
    let r = l;
    let g = l;
    let b = l;

    if (s !== 0) {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h + 1 / 3);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1 / 3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  function setDialogColourFromRgb(rgb, source) {
    const safeRgb = {
      r: clamp(rgb.r, 0, 255),
      g: clamp(rgb.g, 0, 255),
      b: clamp(rgb.b, 0, 255)
    };
    const hsl = rgbToPaintHsl(safeRgb);
    state.editColour = {
      hex: rgbToHex(safeRgb),
      rgb: safeRgb,
      hsl
    };
    if (source !== "custom-swatch" && source !== "custom-add" && source !== "open") {
      state.selectedCustomColourIndex = -1;
    }
    syncDialogColourControls(source);
  }

  function setDialogColourFromHsl(hsl, source) {
    const safeHsl = {
      h: clamp(hsl.h, 0, 239),
      s: clamp(hsl.s, 0, 240),
      l: clamp(hsl.l, 0, 240)
    };
    const rgb = paintHslToRgb(safeHsl);
    state.editColour = {
      hex: rgbToHex(rgb),
      rgb,
      hsl: safeHsl
    };
    if (source !== "custom-swatch" && source !== "custom-add") {
      state.selectedCustomColourIndex = -1;
    }
    syncDialogColourControls(source);
  }

  function drawColourSpectrum() {
    const width = colourSpectrum.width;
    const height = colourSpectrum.height;
    const imageData = colourSpectrumContext.createImageData(width, height);

    for (let y = 0; y < height; y += 1) {
      const sat = Math.round((1 - y / (height - 1)) * 240);
      for (let x = 0; x < width; x += 1) {
        const hue = Math.round((x / (width - 1)) * 239);
        const baseRgb = paintHslToRgb({ h: hue, s: sat, l: 120 });
        const shade = 1 - y / (height - 1) * 0.35;
        const rgb = {
          r: Math.round(baseRgb.r * shade),
          g: Math.round(baseRgb.g * shade),
          b: Math.round(baseRgb.b * shade)
        };
        const index = (y * width + x) * 4;
        imageData.data[index] = rgb.r;
        imageData.data[index + 1] = rgb.g;
        imageData.data[index + 2] = rgb.b;
        imageData.data[index + 3] = 255;
      }
    }

    colourSpectrumContext.putImageData(imageData, 0, 0);
  }

  function drawLuminositySlider() {
    const width = luminositySlider.width;
    const height = luminositySlider.height;
    const imageData = luminosityContext.createImageData(width, height);
    const { h, s } = state.editColour.hsl;

    for (let y = 0; y < height; y += 1) {
      const lum = Math.round((1 - y / (height - 1)) * 240);
      const rgb = paintHslToRgb({ h, s, l: lum });
      for (let x = 0; x < width; x += 1) {
        const index = (y * width + x) * 4;
        imageData.data[index] = rgb.r;
        imageData.data[index + 1] = rgb.g;
        imageData.data[index + 2] = rgb.b;
        imageData.data[index + 3] = 255;
      }
    }

    luminosityContext.putImageData(imageData, 0, 0);
  }

  function syncDialogColourControls(source) {
    const { rgb, hsl, hex } = state.editColour;
    state.syncingColourFields = true;
    fieldHue.value = hsl.h;
    fieldSat.value = hsl.s;
    fieldLum.value = hsl.l;
    fieldRed.value = rgb.r;
    fieldGreen.value = rgb.g;
    fieldBlue.value = rgb.b;
    state.syncingColourFields = false;

    dialogColourPreview.style.backgroundColor = hex;
    spectrumMarker.style.left = `${(hsl.h / 239) * colourSpectrum.clientWidth}px`;
    spectrumMarker.style.top = `${(1 - hsl.s / 240) * colourSpectrum.clientHeight}px`;
    luminosityMarker.style.top = `${(1 - hsl.l / 240) * luminositySlider.clientHeight}px`;

    if (source !== "luminosity") {
      drawLuminositySlider();
    }
    drawColourSpectrum();
    updateDialogSwatchSelection();
  }

  function updateDialogSwatchSelection() {
    document.querySelectorAll(".dialog-swatch").forEach((swatch) => {
      const isCustom = swatch.dataset.customIndex !== undefined;
      const selectedCustom = isCustom && Number(swatch.dataset.customIndex) === state.selectedCustomColourIndex && Boolean(swatch.dataset.colour);
      const selectedBasic = !isCustom && state.selectedCustomColourIndex === -1 && swatch.dataset.colour === state.editColour.hex;
      swatch.classList.toggle("is-selected", selectedCustom || selectedBasic);
    });
  }

  function buildEditColoursDialog() {
    basicDialogColours.forEach((colour, index) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "dialog-swatch";
      swatch.id = `basicColour${index + 1}`;
      swatch.dataset.colour = colour;
      swatch.style.setProperty("--dialog-swatch", colour);
      swatch.setAttribute("aria-label", `Basic colour ${index + 1}`);
      swatch.addEventListener("click", () => setDialogColourFromRgb(hexToRgb(colour), "swatch"));
      basicColoursGrid.appendChild(swatch);
    });

    state.customColours.forEach((colour, index) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "dialog-swatch";
      swatch.id = `customColour${index + 1}`;
      swatch.dataset.customIndex = String(index);
      swatch.setAttribute("aria-label", `Custom colour ${index + 1}`);
      if (colour) {
        swatch.dataset.colour = colour;
        swatch.style.setProperty("--dialog-swatch", colour);
        swatch.classList.remove("is-empty");
      } else {
        swatch.classList.add("is-empty");
      }
      swatch.addEventListener("click", () => {
        if (state.customColours[index]) {
          state.selectedCustomColourIndex = index;
          setDialogColourFromRgb(hexToRgb(state.customColours[index]), "custom-swatch");
        } else {
          state.selectedCustomColourIndex = -1;
          updateDialogSwatchSelection();
        }
      });
      customColoursGrid.appendChild(swatch);
    });
  }

  function refreshCustomColourSwatches() {
    state.customColours.forEach((colour, index) => {
      const swatch = document.getElementById(`customColour${index + 1}`);
      if (colour) {
        swatch.dataset.colour = colour;
        swatch.style.setProperty("--dialog-swatch", colour);
        swatch.classList.remove("is-empty");
      } else {
        delete swatch.dataset.colour;
        swatch.style.removeProperty("--dialog-swatch");
        swatch.classList.add("is-empty");
      }
    });
    updateDialogSwatchSelection();
  }

  function setDialogBackgroundInert(inert, activeDialog) {
    Array.from(paintApp.children).forEach((child) => {
      if (!inert || child !== (activeDialog || editColoursDialog)) {
        child.inert = inert;
      }
    });
  }

  function getDialogFocusableElements(dialog) {
    return Array.from(dialog.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((element) => element.offsetParent !== null);
  }

  function trapDialogFocus(event, dialog) {
    const focusableElements = getDialogFocusableElements(dialog);
    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (!dialog.contains(document.activeElement)) {
      event.preventDefault();
      firstElement.focus();
    } else if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function openEditColoursDialog() {
    const activeColour = state.activeColourRole === "colour2" ? state.colour2 : state.colour1;
    state.dialogReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    editColoursDialog.hidden = false;
    setDialogBackgroundInert(true, editColoursDialog);
    state.selectedCustomColourIndex = -1;
    setDialogColourFromRgb(hexToRgb(activeColour), "open");
    window.requestAnimationFrame(() => {
      syncDialogColourControls("open");
      document.getElementById("editColoursOk").focus();
    });
  }

  function closeEditColoursDialog() {
    if (editColoursDialog.hidden) {
      return;
    }

    editColoursDialog.hidden = true;
    setDialogBackgroundInert(false);

    const returnFocus = state.dialogReturnFocus;
    state.dialogReturnFocus = null;
    if (returnFocus && document.contains(returnFocus)) {
      returnFocus.focus();
    }
  }

  function closeOperationDialog(result) {
    if (operationDialog.hidden) {
      return;
    }

    operationDialog.hidden = true;
    setDialogBackgroundInert(false);
    operationDialogFields.replaceChildren();

    const resolve = state.operationDialogResolve;
    const returnFocus = state.operationDialogReturnFocus;
    state.operationDialogResolve = null;
    state.operationDialogReturnFocus = null;
    if (returnFocus && document.contains(returnFocus)) {
      returnFocus.focus();
    }
    if (resolve) {
      resolve(result);
    }
  }

  function showOperationDialog(options) {
    closeChoiceMenu();
    closeFileMenu();
    if (!operationDialog.hidden) {
      closeOperationDialog(null);
    }

    operationDialogTitle.textContent = options.title || "Paint";
    operationDialogMessage.replaceChildren();
    operationDialogMessage.classList.toggle(
      "is-rich-content",
      typeof options.renderMessage === "function"
    );
    operationDialogForm.classList.toggle("is-about-dialog", options.variant === "about");
    if (typeof options.renderMessage === "function") {
      options.renderMessage(operationDialogMessage);
    } else {
      operationDialogMessage.textContent = options.message || "";
    }
    operationDialogConfirm.textContent = options.confirmLabel || "OK";
    operationDialogCancel.textContent = options.cancelLabel || "Cancel";
    operationDialogCancel.hidden = options.showCancel === false;
    operationDialogFields.replaceChildren();

    (options.fields || []).forEach((field, index) => {
      const fieldLabel = document.createElement("label");
      fieldLabel.className = `operation-field${field.multiline ? " is-multiline" : ""}`;
      const labelText = document.createElement("span");
      const input = document.createElement(field.multiline ? "textarea" : "input");
      const inputId = `operationField${index + 1}`;

      labelText.textContent = field.label;
      input.id = inputId;
      input.name = field.name;
      input.value = field.value === undefined ? "" : String(field.value);
      input.required = field.required !== false;
      if (!field.multiline) {
        input.type = field.type || "text";
      }
      if (field.min !== undefined) input.min = String(field.min);
      if (field.max !== undefined) input.max = String(field.max);
      if (field.step !== undefined) input.step = String(field.step);
      if (field.maxLength !== undefined) input.maxLength = field.maxLength;
      fieldLabel.append(labelText, input);
      operationDialogFields.appendChild(fieldLabel);
    });

    state.operationDialogReturnFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    operationDialog.hidden = false;
    setDialogBackgroundInert(true, operationDialog);

    return new Promise((resolve) => {
      state.operationDialogResolve = resolve;
      window.requestAnimationFrame(() => {
        const firstField = operationDialogFields.querySelector("input, textarea");
        const focusTarget = firstField || operationDialogConfirm;
        focusTarget.focus();
        if (firstField && typeof firstField.select === "function") {
          firstField.select();
        }
      });
    });
  }

  function pickSpectrumColour(event) {
    const rect = colourSpectrum.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width - 1, event.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height - 1, event.clientY - rect.top));
    setDialogColourFromHsl({
      h: Math.round((x / (rect.width - 1)) * 239),
      s: Math.round((1 - y / (rect.height - 1)) * 240),
      l: state.editColour.hsl.l
    }, "spectrum");
  }

  function pickLuminosity(event) {
    const rect = luminositySlider.getBoundingClientRect();
    const y = Math.max(0, Math.min(rect.height - 1, event.clientY - rect.top));
    setDialogColourFromHsl({
      h: state.editColour.hsl.h,
      s: state.editColour.hsl.s,
      l: Math.round((1 - y / (rect.height - 1)) * 240)
    }, "luminosity");
  }

  function prepareColourDrag(target, picker) {
    target.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      target.setPointerCapture(event.pointerId);
      picker(event);

      function onMove(moveEvent) {
        picker(moveEvent);
      }

      function onUp(upEvent) {
        if (target.hasPointerCapture(upEvent.pointerId)) {
          target.releasePointerCapture(upEvent.pointerId);
        }
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerup", onUp);
        target.removeEventListener("pointercancel", onUp);
      }

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerup", onUp);
      target.addEventListener("pointercancel", onUp);
    });
  }

  function buildPalette() {
    const palette = document.getElementById("colourPalette");
    paletteColours.forEach((colour, index) => {
      const swatch = document.createElement("button");
      swatch.type = "button";
      swatch.className = "colour-swatch";
      swatch.id = `colourSwatch${index + 1}`;
      swatch.style.setProperty("--swatch", colour);
      swatch.setAttribute("aria-label", `Colour swatch ${index + 1}`);

      swatch.addEventListener("click", () => setColour(colour));
      swatch.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        setColour(colour, "colour2");
      });

      palette.appendChild(swatch);
    });
  }

  function renderZoomFactor() {
    return state.zoom / 100;
  }

  function syncScaledCanvasMetrics() {
    const factor = renderZoomFactor();
    root.style.setProperty("--canvas-zoom", String(factor));
    root.style.setProperty("--scaled-canvas-width", `${Math.max(1, state.canvasWidth * factor)}px`);
    root.style.setProperty("--scaled-canvas-height", `${Math.max(1, state.canvasHeight * factor)}px`);
    root.style.setProperty("--ruler-minor-step", `${Math.max(2, 10 * factor)}px`);
    root.style.setProperty("--ruler-major-step", `${Math.max(10, 50 * factor)}px`);
  }

  function fillCanvasWhite() {
    drawingContext.save();
    drawingContext.setTransform(1, 0, 0, 1, 0, 0);
    drawingContext.globalAlpha = 1;
    drawingContext.fillStyle = "#ffffff";
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);
    drawingContext.restore();
  }

  function clampCanvasDimension(value, fallback) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) {
      return fallback;
    }
    return Math.max(MIN_CANVAS_DIMENSION, Math.min(MAX_CANVAS_DIMENSION, Math.round(numeric)));
  }

  function fitImageWithinCanvasLimit(width, height) {
    const safeWidth = Math.max(1, Number(width) || 1);
    const safeHeight = Math.max(1, Number(height) || 1);
    const scale = Math.min(
      1,
      MAX_CANVAS_DIMENSION / safeWidth,
      MAX_CANVAS_DIMENSION / safeHeight
    );
    return {
      width: Math.max(1, Math.round(safeWidth * scale)),
      height: Math.max(1, Math.round(safeHeight * scale))
    };
  }

  function updateCanvasSize(width, height, options) {
    const safeWidth = clampCanvasDimension(width, state.canvasWidth);
    const safeHeight = clampCanvasDimension(height, state.canvasHeight);
    const preserve = !options || options.preserve !== false;
    let previous = null;

    if (preserve) {
      previous = document.createElement("canvas");
      previous.width = canvas.width;
      previous.height = canvas.height;
      previous.getContext("2d").drawImage(canvas, 0, 0);
    }

    state.canvasWidth = safeWidth;
    state.canvasHeight = safeHeight;
    root.style.setProperty("--canvas-width", `${safeWidth}px`);
    root.style.setProperty("--canvas-height", `${safeHeight}px`);

    canvas.width = safeWidth;
    canvas.height = safeHeight;
    fillCanvasWhite();
    if (previous) {
      drawingContext.drawImage(previous, 0, 0);
    }
    dimensionsLabel.textContent = `${safeWidth} x ${safeHeight}px`;

    syncScaledCanvasMetrics();
    renderRulers();
    updateThumbnail();
  }

  function getCanvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    return {
      x: Math.max(0, Math.min(canvas.width - 1, Math.round(x))),
      y: Math.max(0, Math.min(canvas.height - 1, Math.round(y)))
    };
  }

  function colourForPointer(button) {
    return button === 2 ? state.colour2 : state.colour1;
  }

  function oppositeColourForPointer(button) {
    return button === 2 ? state.colour1 : state.colour2;
  }

  function sprayAt(point, colour) {
    const radius = Math.max(4, state.brushSize * 2);
    const dots = Math.max(18, state.brushSize * 7);
    drawingContext.save();
    drawingContext.fillStyle = colour;
    for (let index = 0; index < dots; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.sqrt(Math.random()) * radius;
      const x = point.x + Math.cos(angle) * distance;
      const y = point.y + Math.sin(angle) * distance;
      drawingContext.fillRect(Math.round(x), Math.round(y), 1, 1);
    }
    drawingContext.restore();
  }

  function forEachStrokePoint(from, to, spacing, callback) {
    const distance = Math.hypot(to.x - from.x, to.y - from.y);
    const steps = Math.max(1, Math.ceil(distance / Math.max(0.5, spacing)));
    for (let step = 0; step <= steps; step += 1) {
      const progress = step / steps;
      callback({
        x: from.x + (to.x - from.x) * progress,
        y: from.y + (to.y - from.y) * progress
      }, progress);
    }
  }

  function drawCalligraphyStroke(from, to, colour, style) {
    const nibWidth = Math.max(5, state.brushSize * 2.2);
    const nibHeight = Math.max(1.2, state.brushSize * 0.55);
    const nibAngle = style === "calligraphy1" ? -Math.PI / 4 : Math.PI / 4;
    drawingContext.save();
    drawingContext.fillStyle = colour;
    forEachStrokePoint(from, to, Math.max(0.75, nibHeight * 0.55), (point) => {
      drawingContext.save();
      drawingContext.translate(point.x, point.y);
      drawingContext.rotate(nibAngle);
      drawingContext.fillRect(-nibWidth / 2, -nibHeight / 2, nibWidth, nibHeight);
      drawingContext.restore();
    });
    drawingContext.restore();
  }

  function drawOilStroke(from, to, colour) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2;
    const nibWidth = Math.max(6, state.brushSize * 2.4);
    const nibHeight = Math.max(2, state.brushSize * 0.7);
    drawingContext.save();
    drawingContext.fillStyle = colour;
    forEachStrokePoint(from, to, Math.max(1, state.brushSize * 0.45), (point, progress) => {
      drawingContext.save();
      drawingContext.translate(point.x, point.y);
      drawingContext.rotate(angle);
      drawingContext.globalAlpha = 0.72 + ((Math.round(progress * 10) % 3) * 0.1);
      drawingContext.beginPath();
      drawingContext.ellipse(0, 0, nibWidth / 2, nibHeight / 2, 0, 0, Math.PI * 2);
      drawingContext.fill();
      drawingContext.restore();
    });
    drawingContext.restore();
  }

  function drawCrayonStroke(from, to, colour) {
    const width = Math.max(3, state.brushSize * 1.6);
    drawingContext.save();
    drawingContext.strokeStyle = colour;
    drawingContext.fillStyle = colour;
    drawingContext.globalAlpha = 0.58;
    drawingContext.lineWidth = width;
    drawingContext.lineCap = "round";
    drawingContext.lineJoin = "round";
    drawingContext.beginPath();
    drawingContext.moveTo(from.x, from.y);
    drawingContext.lineTo(to.x, to.y);
    drawingContext.stroke();
    forEachStrokePoint(from, to, 1.25, (point) => {
      const radius = width * 0.62;
      drawingContext.globalAlpha = 0.28 + Math.random() * 0.28;
      drawingContext.fillRect(
        Math.round(point.x + (Math.random() - 0.5) * radius * 2),
        Math.round(point.y + (Math.random() - 0.5) * radius * 2),
        1,
        1
      );
    });
    if (from.x === to.x && from.y === to.y) {
      drawingContext.globalAlpha = 0.58;
      drawingContext.beginPath();
      drawingContext.arc(from.x, from.y, width / 2, 0, Math.PI * 2);
      drawingContext.fill();
    }
    drawingContext.restore();
  }

  function drawWatercolourStroke(from, to, colour) {
    const width = Math.max(8, state.brushSize * 3);
    const direction = Math.atan2(to.y - from.y, to.x - from.x);
    const offsetX = Math.cos(direction + Math.PI / 2) * state.brushSize * 0.45;
    const offsetY = Math.sin(direction + Math.PI / 2) * state.brushSize * 0.45;
    drawingContext.save();
    drawingContext.strokeStyle = colour;
    drawingContext.fillStyle = colour;
    drawingContext.lineWidth = width;
    drawingContext.lineCap = "round";
    drawingContext.lineJoin = "round";
    [-1, 0, 1].forEach((offset, index) => {
      drawingContext.globalAlpha = index === 1 ? 0.16 : 0.09;
      drawingContext.beginPath();
      drawingContext.moveTo(from.x + offsetX * offset, from.y + offsetY * offset);
      drawingContext.lineTo(to.x + offsetX * offset, to.y + offsetY * offset);
      drawingContext.stroke();
    });
    if (from.x === to.x && from.y === to.y) {
      drawingContext.globalAlpha = 0.28;
      drawingContext.beginPath();
      drawingContext.arc(from.x, from.y, width / 2, 0, Math.PI * 2);
      drawingContext.fill();
    }
    drawingContext.restore();
  }

  function drawStrokeSegment(from, to) {
    const tool = state.activeTool;
    const colour = tool === "eraser" ? state.colour2 : colourForPointer(state.pointerButton);

    if (tool === "brush") {
      if (state.brushStyle === "airbrush") {
        forEachStrokePoint(from, to, 3, (point) => {
          sprayAt(point, colour);
        });
        return;
      }
      if (state.brushStyle === "calligraphy1" || state.brushStyle === "calligraphy2") {
        drawCalligraphyStroke(from, to, colour, state.brushStyle);
        return;
      }
      if (state.brushStyle === "oil") {
        drawOilStroke(from, to, colour);
        return;
      }
      if (state.brushStyle === "crayon") {
        drawCrayonStroke(from, to, colour);
        return;
      }
      if (state.brushStyle === "watercolour") {
        drawWatercolourStroke(from, to, colour);
        return;
      }
    }

    drawingContext.save();
    drawingContext.strokeStyle = colour;
    drawingContext.fillStyle = colour;
    drawingContext.globalAlpha = tool === "brush" && state.brushStyle === "marker" ? 0.36 : 1;
    drawingContext.lineWidth = tool === "pencil"
      ? 1
      : tool === "eraser"
        ? Math.max(8, state.brushSize * 4)
        : state.brushStyle === "marker"
          ? Math.max(8, state.brushSize * 3)
          : state.brushStyle === "pencil"
            ? 1
          : state.brushSize;
    drawingContext.lineCap = tool === "brush" && state.brushStyle === "marker" ? "butt" : "round";
    drawingContext.lineJoin = "round";
    drawingContext.beginPath();
    drawingContext.moveTo(from.x, from.y);
    drawingContext.lineTo(to.x, to.y);
    drawingContext.stroke();

    if (from.x === to.x && from.y === to.y) {
      drawingContext.beginPath();
      drawingContext.arc(from.x, from.y, Math.max(0.5, drawingContext.lineWidth / 2), 0, Math.PI * 2);
      drawingContext.fill();
    }
    drawingContext.restore();
  }

  function pixelMatches(data, offset, target) {
    return data[offset] === target.r
      && data[offset + 1] === target.g
      && data[offset + 2] === target.b
      && data[offset + 3] === target.a;
  }

  function floodFill(point, colour) {
    const imageData = drawingContext.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const startOffset = (point.y * canvas.width + point.x) * 4;
    const target = {
      r: data[startOffset],
      g: data[startOffset + 1],
      b: data[startOffset + 2],
      a: data[startOffset + 3]
    };
    const replacementRgb = hexToRgb(colour);
    const replacement = { ...replacementRgb, a: 255 };

    if (
      target.r === replacement.r
      && target.g === replacement.g
      && target.b === replacement.b
      && target.a === replacement.a
    ) {
      return false;
    }

    const stack = [point.x, point.y];
    while (stack.length > 0) {
      const y = stack.pop();
      const x = stack.pop();
      let scanY = y;
      let offset = (scanY * canvas.width + x) * 4;

      while (scanY >= 0 && pixelMatches(data, offset, target)) {
        scanY -= 1;
        offset -= canvas.width * 4;
      }
      scanY += 1;

      let spanLeft = false;
      let spanRight = false;
      for (; scanY < canvas.height; scanY += 1) {
        offset = (scanY * canvas.width + x) * 4;
        if (!pixelMatches(data, offset, target)) {
          break;
        }

        data[offset] = replacement.r;
        data[offset + 1] = replacement.g;
        data[offset + 2] = replacement.b;
        data[offset + 3] = replacement.a;

        if (x > 0) {
          const leftOffset = offset - 4;
          if (pixelMatches(data, leftOffset, target)) {
            if (!spanLeft) {
              stack.push(x - 1, scanY);
              spanLeft = true;
            }
          } else {
            spanLeft = false;
          }
        }

        if (x < canvas.width - 1) {
          const rightOffset = offset + 4;
          if (pixelMatches(data, rightOffset, target)) {
            if (!spanRight) {
              stack.push(x + 1, scanY);
              spanRight = true;
            }
          } else {
            spanRight = false;
          }
        }
      }
    }

    drawingContext.putImageData(imageData, 0, 0);
    return true;
  }

  function createPolygonPath(points) {
    const path = new Path2D();
    if (points.length === 0) {
      return path;
    }
    path.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => path.lineTo(point.x, point.y));
    path.closePath();
    return path;
  }

  function regularPolygonPoints(rect, sides, rotation) {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const radiusX = rect.width / 2;
    const radiusY = rect.height / 2;
    return Array.from({ length: sides }, (_, index) => {
      const angle = rotation + (index / sides) * Math.PI * 2;
      return {
        x: centerX + Math.cos(angle) * radiusX,
        y: centerY + Math.sin(angle) * radiusY
      };
    });
  }

  function starPoints(rect, points) {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const radiusX = rect.width / 2;
    const radiusY = rect.height / 2;
    const innerRatio = points === 4 ? 0.34 : 0.45;
    const result = [];
    for (let index = 0; index < points * 2; index += 1) {
      const ratio = index % 2 === 0 ? 1 : innerRatio;
      const angle = -Math.PI / 2 + (index / (points * 2)) * Math.PI * 2;
      result.push({
        x: centerX + Math.cos(angle) * radiusX * ratio,
        y: centerY + Math.sin(angle) * radiusY * ratio
      });
    }
    return result;
  }

  function arrowPoints(rect, direction) {
    const base = [
      { x: 0, y: 0.28 },
      { x: 0.58, y: 0.28 },
      { x: 0.58, y: 0 },
      { x: 1, y: 0.5 },
      { x: 0.58, y: 1 },
      { x: 0.58, y: 0.72 },
      { x: 0, y: 0.72 }
    ];

    return base.map((point) => {
      let normalX = point.x;
      let normalY = point.y;
      if (direction === "left") normalX = 1 - normalX;
      if (direction === "up") {
        [normalX, normalY] = [normalY, 1 - normalX];
      }
      if (direction === "down") {
        [normalX, normalY] = [1 - normalY, normalX];
      }
      return {
        x: rect.x + normalX * rect.width,
        y: rect.y + normalY * rect.height
      };
    });
  }

  function roundedRectanglePath(rect, radius) {
    const path = new Path2D();
    const safeRadius = Math.min(radius, rect.width / 2, rect.height / 2);
    path.moveTo(rect.x + safeRadius, rect.y);
    path.lineTo(rect.x + rect.width - safeRadius, rect.y);
    path.quadraticCurveTo(rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + safeRadius);
    path.lineTo(rect.x + rect.width, rect.y + rect.height - safeRadius);
    path.quadraticCurveTo(
      rect.x + rect.width,
      rect.y + rect.height,
      rect.x + rect.width - safeRadius,
      rect.y + rect.height
    );
    path.lineTo(rect.x + safeRadius, rect.y + rect.height);
    path.quadraticCurveTo(rect.x, rect.y + rect.height, rect.x, rect.y + rect.height - safeRadius);
    path.lineTo(rect.x, rect.y + safeRadius);
    path.quadraticCurveTo(rect.x, rect.y, rect.x + safeRadius, rect.y);
    path.closePath();
    return path;
  }

  function shapePath(shapeId, rect) {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    if (shapeId === "shapeRectangle") {
      const path = new Path2D();
      path.rect(rect.x, rect.y, rect.width, rect.height);
      return path;
    }
    if (shapeId === "shapeRoundedRectangle") {
      return roundedRectanglePath(rect, Math.min(18, rect.width / 4, rect.height / 4));
    }
    if (shapeId === "shapeOval") {
      const path = new Path2D();
      path.ellipse(centerX, centerY, rect.width / 2, rect.height / 2, 0, 0, Math.PI * 2);
      return path;
    }
    if (shapeId === "shapeTriangle") {
      return createPolygonPath([
        { x: centerX, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height }
      ]);
    }
    if (shapeId === "shapeRightTriangle") {
      return createPolygonPath([
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y + rect.height },
        { x: rect.x, y: rect.y + rect.height }
      ]);
    }
    if (shapeId === "shapeDiamond") {
      return createPolygonPath([
        { x: centerX, y: rect.y },
        { x: rect.x + rect.width, y: centerY },
        { x: centerX, y: rect.y + rect.height },
        { x: rect.x, y: centerY }
      ]);
    }
    if (shapeId === "shapePentagon") {
      return createPolygonPath(regularPolygonPoints(rect, 5, -Math.PI / 2));
    }
    if (shapeId === "shapeHexagon") {
      return createPolygonPath(regularPolygonPoints(rect, 6, 0));
    }
    if (shapeId === "shapePolygon") {
      return createPolygonPath(regularPolygonPoints(rect, 7, -Math.PI / 2));
    }
    if (shapeId === "shapeRightArrow") return createPolygonPath(arrowPoints(rect, "right"));
    if (shapeId === "shapeLeftArrow") return createPolygonPath(arrowPoints(rect, "left"));
    if (shapeId === "shapeUpArrow") return createPolygonPath(arrowPoints(rect, "up"));
    if (shapeId === "shapeDownArrow") return createPolygonPath(arrowPoints(rect, "down"));
    if (shapeId === "shapeFourPointStar") return createPolygonPath(starPoints(rect, 4));
    if (shapeId === "shapeFivePointStar") return createPolygonPath(starPoints(rect, 5));
    if (shapeId === "shapeSixPointStar") return createPolygonPath(starPoints(rect, 6));

    if (shapeId === "shapeCalloutRect" || shapeId === "shapeCalloutRound") {
      const bodyHeight = rect.height * 0.72;
      const bodyRect = { x: rect.x, y: rect.y, width: rect.width, height: bodyHeight };
      const path = shapeId === "shapeCalloutRound"
        ? roundedRectanglePath(bodyRect, Math.min(15, rect.width / 5))
        : new Path2D();
      if (shapeId === "shapeCalloutRect") {
        path.rect(bodyRect.x, bodyRect.y, bodyRect.width, bodyRect.height);
      }
      path.moveTo(rect.x + rect.width * 0.35, rect.y + bodyHeight);
      path.lineTo(rect.x + rect.width * 0.26, rect.y + rect.height);
      path.lineTo(rect.x + rect.width * 0.56, rect.y + bodyHeight);
      path.closePath();
      return path;
    }

    if (shapeId === "shapeCalloutCloud") {
      const path = new Path2D();
      path.moveTo(rect.x + rect.width * 0.2, rect.y + rect.height * 0.65);
      path.bezierCurveTo(rect.x, centerY, rect.x + rect.width * 0.12, rect.y + rect.height * 0.2, rect.x + rect.width * 0.34, rect.y + rect.height * 0.26);
      path.bezierCurveTo(rect.x + rect.width * 0.42, rect.y, rect.x + rect.width * 0.72, rect.y + rect.height * 0.02, rect.x + rect.width * 0.75, rect.y + rect.height * 0.28);
      path.bezierCurveTo(rect.x + rect.width, rect.y + rect.height * 0.22, rect.x + rect.width, rect.y + rect.height * 0.7, rect.x + rect.width * 0.76, rect.y + rect.height * 0.7);
      path.lineTo(rect.x + rect.width * 0.55, rect.y + rect.height * 0.72);
      path.lineTo(rect.x + rect.width * 0.34, rect.y + rect.height);
      path.lineTo(rect.x + rect.width * 0.38, rect.y + rect.height * 0.7);
      path.closePath();
      return path;
    }

    if (shapeId === "shapeHeart") {
      const path = new Path2D();
      path.moveTo(centerX, rect.y + rect.height);
      path.bezierCurveTo(
        rect.x - rect.width * 0.08,
        rect.y + rect.height * 0.58,
        rect.x + rect.width * 0.05,
        rect.y,
        centerX,
        rect.y + rect.height * 0.3
      );
      path.bezierCurveTo(
        rect.x + rect.width * 0.95,
        rect.y,
        rect.x + rect.width * 1.08,
        rect.y + rect.height * 0.58,
        centerX,
        rect.y + rect.height
      );
      path.closePath();
      return path;
    }

    const fallback = new Path2D();
    fallback.rect(rect.x, rect.y, rect.width, rect.height);
    return fallback;
  }

  function captureShapeOptions(button, shapeId) {
    return {
      shapeId: shapeId || state.activeShape,
      pointerButton: button,
      outlineColour: colourForPointer(button),
      fillColour: oppositeColourForPointer(button),
      brushSize: state.brushSize,
      outline: state.shapeOutline,
      fill: state.shapeFill
    };
  }

  function applyShapeDrawingStyle(options) {
    drawingContext.lineWidth = options.brushSize;
    drawingContext.lineJoin = "round";
    drawingContext.lineCap = "round";
    drawingContext.strokeStyle = options.outlineColour;
    drawingContext.fillStyle = options.fillColour;
  }

  function drawPolygonPoints(points, options, closed) {
    if (!points || points.length < 2) {
      return;
    }

    drawingContext.save();
    applyShapeDrawingStyle(options);
    drawingContext.beginPath();
    drawingContext.moveTo(points[0].x, points[0].y);
    points.slice(1).forEach((point) => drawingContext.lineTo(point.x, point.y));
    if (closed) {
      drawingContext.closePath();
      if (options.fill) drawingContext.fill();
    }
    if (options.outline || !closed) drawingContext.stroke();
    drawingContext.restore();
  }

  function drawShape(start, end, suppliedOptions, curveControls) {
    const rect = normaliseRectangle(start, end);
    const options = suppliedOptions || captureShapeOptions(state.pointerButton);

    drawingContext.save();
    applyShapeDrawingStyle(options);

    if (options.shapeId === "shapeLine") {
      drawingContext.beginPath();
      drawingContext.moveTo(start.x, start.y);
      drawingContext.lineTo(end.x, end.y);
      drawingContext.stroke();
    } else if (options.shapeId === "shapeCurve") {
      const controls = curveControls || {
        control1: {
          x: start.x + (end.x - start.x) / 3,
          y: Math.min(start.y, end.y) - 30
        },
        control2: {
          x: start.x + (end.x - start.x) * 2 / 3,
          y: Math.min(start.y, end.y) - 30
        }
      };
      drawingContext.beginPath();
      drawingContext.moveTo(start.x, start.y);
      drawingContext.bezierCurveTo(
        controls.control1.x,
        controls.control1.y,
        controls.control2.x,
        controls.control2.y,
        end.x,
        end.y
      );
      drawingContext.stroke();
    } else {
      const path = shapePath(options.shapeId, rect);
      if (options.fill) drawingContext.fill(path);
      if (options.outline) drawingContext.stroke(path);
    }
    drawingContext.restore();
  }

  function pendingShapePoints(shape) {
    if (shape.type === "polygon") {
      return shape.points;
    }
    if (shape.options.shapeId === "shapeCurve") {
      return [shape.start, shape.end, shape.control1, shape.control2];
    }
    return [shape.start, shape.end];
  }

  function pointBounds(points) {
    const xs = points.map((point) => point.x);
    const ys = points.map((point) => point.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    const right = Math.max(...xs);
    const bottom = Math.max(...ys);
    return {
      x,
      y,
      width: Math.max(1, right - x),
      height: Math.max(1, bottom - y)
    };
  }

  function clonePendingGeometry(shape) {
    return {
      start: shape.start ? { ...shape.start } : null,
      end: shape.end ? { ...shape.end } : null,
      control1: shape.control1 ? { ...shape.control1 } : null,
      control2: shape.control2 ? { ...shape.control2 } : null,
      points: shape.points ? shape.points.map((point) => ({ ...point })) : null
    };
  }

  function applyPendingGeometry(shape, geometry) {
    if (geometry.start) shape.start = { ...geometry.start };
    if (geometry.end) shape.end = { ...geometry.end };
    if (geometry.control1) shape.control1 = { ...geometry.control1 };
    if (geometry.control2) shape.control2 = { ...geometry.control2 };
    if (geometry.points) shape.points = geometry.points.map((point) => ({ ...point }));
  }

  function transformPointBetweenBounds(point, fromBounds, toBounds) {
    const ratioX = fromBounds.width > 0 ? (point.x - fromBounds.x) / fromBounds.width : 0;
    const ratioY = fromBounds.height > 0 ? (point.y - fromBounds.y) / fromBounds.height : 0;
    return {
      x: toBounds.x + ratioX * toBounds.width,
      y: toBounds.y + ratioY * toBounds.height
    };
  }

  function transformPendingGeometry(shape, originalGeometry, fromBounds, toBounds) {
    const transform = (point) => transformPointBetweenBounds(point, fromBounds, toBounds);
    if (originalGeometry.start) shape.start = transform(originalGeometry.start);
    if (originalGeometry.end) shape.end = transform(originalGeometry.end);
    if (originalGeometry.control1) shape.control1 = transform(originalGeometry.control1);
    if (originalGeometry.control2) shape.control2 = transform(originalGeometry.control2);
    if (originalGeometry.points) shape.points = originalGeometry.points.map(transform);
  }

  function translatePendingGeometry(shape, originalGeometry, deltaX, deltaY) {
    const translate = (point) => ({ x: point.x + deltaX, y: point.y + deltaY });
    if (originalGeometry.start) shape.start = translate(originalGeometry.start);
    if (originalGeometry.end) shape.end = translate(originalGeometry.end);
    if (originalGeometry.control1) shape.control1 = translate(originalGeometry.control1);
    if (originalGeometry.control2) shape.control2 = translate(originalGeometry.control2);
    if (originalGeometry.points) shape.points = originalGeometry.points.map(translate);
  }

  function redrawPendingShape() {
    const shape = state.pendingShape;
    if (!shape) {
      return;
    }
    drawingContext.putImageData(shape.baseImageData, 0, 0);
    if (shape.type === "polygon") {
      drawPolygonPoints(shape.points, shape.options, true);
    } else {
      drawShape(shape.start, shape.end, shape.options, {
        control1: shape.control1,
        control2: shape.control2
      });
    }
    updateThumbnail();
  }

  function removeShapeEditorElements(shape) {
    if (!shape) {
      return;
    }
    if (shape.editor) shape.editor.remove();
    if (shape.controlGuide) shape.controlGuide.remove();
    (shape.controlHandles || []).forEach((handle) => handle.remove());
  }

  function refreshShapeEditor() {
    const shape = state.pendingShape;
    if (!shape || !shape.editor) {
      return;
    }
    const bounds = pointBounds(pendingShapePoints(shape));
    shape.bounds = bounds;
    shape.editor.style.left = `${bounds.x}px`;
    shape.editor.style.top = `${bounds.y}px`;
    shape.editor.style.width = `${Math.max(12, bounds.width)}px`;
    shape.editor.style.height = `${Math.max(12, bounds.height)}px`;

    if (shape.options.shapeId === "shapeCurve") {
      const lines = shape.controlGuide.querySelectorAll("line");
      lines[0].setAttribute("x1", String(shape.start.x));
      lines[0].setAttribute("y1", String(shape.start.y));
      lines[0].setAttribute("x2", String(shape.control1.x));
      lines[0].setAttribute("y2", String(shape.control1.y));
      lines[1].setAttribute("x1", String(shape.end.x));
      lines[1].setAttribute("y1", String(shape.end.y));
      lines[1].setAttribute("x2", String(shape.control2.x));
      lines[1].setAttribute("y2", String(shape.control2.y));
      [shape.control1, shape.control2].forEach((point, index) => {
        shape.controlHandles[index].style.left = `${point.x - 6}px`;
        shape.controlHandles[index].style.top = `${point.y - 6}px`;
      });
    }
  }

  function prepareShapeMove(editor) {
    editor.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button, .shape-resize-handle")) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      const shape = state.pendingShape;
      if (!shape) return;
      const startX = event.clientX;
      const startY = event.clientY;
      const originalGeometry = clonePendingGeometry(shape);
      const originalBounds = pointBounds(pendingShapePoints(shape));
      const zoomFactor = renderZoomFactor();
      editor.classList.add("is-moving");
      editor.setPointerCapture(event.pointerId);

      function move(moveEvent) {
        const requestedX = (moveEvent.clientX - startX) / zoomFactor;
        const requestedY = (moveEvent.clientY - startY) / zoomFactor;
        const deltaX = Math.max(-originalBounds.x, Math.min(canvas.width - originalBounds.x - originalBounds.width, requestedX));
        const deltaY = Math.max(-originalBounds.y, Math.min(canvas.height - originalBounds.y - originalBounds.height, requestedY));
        translatePendingGeometry(shape, originalGeometry, deltaX, deltaY);
        redrawPendingShape();
        refreshShapeEditor();
      }

      function finish(upEvent) {
        editor.classList.remove("is-moving");
        if (editor.hasPointerCapture(upEvent.pointerId)) {
          editor.releasePointerCapture(upEvent.pointerId);
        }
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        setStatus("Shape moved. Apply to commit.");
      }

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    });
  }

  function prepareShapeResize(handle, corner) {
    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const shape = state.pendingShape;
      if (!shape) return;
      const startX = event.clientX;
      const startY = event.clientY;
      const originalGeometry = clonePendingGeometry(shape);
      const originalBounds = pointBounds(pendingShapePoints(shape));
      const zoomFactor = renderZoomFactor();
      handle.setPointerCapture(event.pointerId);

      function move(moveEvent) {
        const deltaX = (moveEvent.clientX - startX) / zoomFactor;
        const deltaY = (moveEvent.clientY - startY) / zoomFactor;
        let left = originalBounds.x;
        let top = originalBounds.y;
        let right = originalBounds.x + originalBounds.width;
        let bottom = originalBounds.y + originalBounds.height;
        if (corner.includes("w")) left = Math.max(0, Math.min(right - 4, left + deltaX));
        if (corner.includes("e")) right = Math.min(canvas.width, Math.max(left + 4, right + deltaX));
        if (corner.includes("n")) top = Math.max(0, Math.min(bottom - 4, top + deltaY));
        if (corner.includes("s")) bottom = Math.min(canvas.height, Math.max(top + 4, bottom + deltaY));
        transformPendingGeometry(shape, originalGeometry, originalBounds, {
          x: left,
          y: top,
          width: right - left,
          height: bottom - top
        });
        redrawPendingShape();
        refreshShapeEditor();
      }

      function finish(upEvent) {
        if (handle.hasPointerCapture(upEvent.pointerId)) {
          handle.releasePointerCapture(upEvent.pointerId);
        }
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        setStatus("Shape resized. Apply to commit.");
      }

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    });
  }

  function prepareCurveControl(handle, controlKey) {
    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      handle.setPointerCapture(event.pointerId);

      function move(moveEvent) {
        const shape = state.pendingShape;
        if (!shape) return;
        shape[controlKey] = getCanvasPoint(moveEvent);
        redrawPendingShape();
        refreshShapeEditor();
      }

      function finish(upEvent) {
        if (handle.hasPointerCapture(upEvent.pointerId)) {
          handle.releasePointerCapture(upEvent.pointerId);
        }
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", finish);
        window.removeEventListener("pointercancel", finish);
        setStatus("Curve adjusted. Apply to commit.");
      }

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", finish);
      window.addEventListener("pointercancel", finish);
    });
  }

  function createShapeEditor() {
    const shape = state.pendingShape;
    if (!shape) return;

    const editor = document.createElement("section");
    editor.className = "canvas-shape-editor";
    editor.setAttribute("role", "group");
    editor.setAttribute("aria-label", "Editable shape");

    const actions = document.createElement("div");
    actions.className = "shape-editor-actions";
    const apply = document.createElement("button");
    apply.type = "button";
    apply.textContent = "Apply";
    apply.addEventListener("click", commitPendingShape);
    const cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "Cancel";
    cancel.addEventListener("click", cancelPendingShape);
    actions.append(apply, cancel);
    editor.appendChild(actions);

    ["nw", "ne", "sw", "se"].forEach((corner) => {
      const handle = document.createElement("span");
      handle.className = `shape-resize-handle is-${corner}`;
      handle.dataset.corner = corner;
      handle.setAttribute("aria-hidden", "true");
      prepareShapeResize(handle, corner);
      editor.appendChild(handle);
    });

    canvasFrame.appendChild(editor);
    shape.editor = editor;
    prepareShapeMove(editor);

    if (shape.options.shapeId === "shapeCurve") {
      const guide = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      guide.classList.add("shape-control-guides");
      guide.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);
      guide.setAttribute("aria-hidden", "true");
      guide.append(
        document.createElementNS("http://www.w3.org/2000/svg", "line"),
        document.createElementNS("http://www.w3.org/2000/svg", "line")
      );
      canvasFrame.appendChild(guide);
      shape.controlGuide = guide;
      shape.controlHandles = ["control1", "control2"].map((controlKey, index) => {
        const handle = document.createElement("button");
        handle.type = "button";
        handle.className = "shape-control-handle";
        handle.setAttribute("aria-label", `Curve control point ${index + 1}`);
        prepareCurveControl(handle, controlKey);
        canvasFrame.appendChild(handle);
        return handle;
      });
    }

    refreshShapeEditor();
  }

  function beginPendingShape(shape) {
    if (state.pendingShape) {
      commitPendingShape();
    }
    state.pendingShape = shape;
    redrawPendingShape();
    createShapeEditor();
    setStatus(
      shape.options.shapeId === "shapeCurve"
        ? "Adjust the curve handles, move or resize, then Apply."
        : "Move or resize the shape, then Apply."
    );
  }

  function commitPendingShape() {
    const shape = state.pendingShape;
    if (!shape) {
      return false;
    }
    redrawPendingShape();
    removeShapeEditorElements(shape);
    state.pendingShape = null;
    commitHistory(shape.type === "polygon" ? "Polygon added" : "Shape added");
    updateThumbnail();
    return true;
  }

  function cancelPendingShape() {
    const shape = state.pendingShape;
    if (!shape) {
      return;
    }
    drawingContext.putImageData(shape.baseImageData, 0, 0);
    removeShapeEditorElements(shape);
    state.pendingShape = null;
    updateThumbnail();
    setStatus("Shape cancelled");
  }

  function renderPolygonDraft(hoverPoint) {
    const draft = state.polygonDraft;
    if (!draft) return;
    drawingContext.putImageData(draft.baseImageData, 0, 0);
    const previewPoints = hoverPoint ? [...draft.points, hoverPoint] : draft.points;
    drawPolygonPoints(previewPoints, draft.options, false);
    drawingContext.save();
    drawingContext.fillStyle = "#ffffff";
    drawingContext.strokeStyle = "#176ba0";
    draft.points.forEach((point) => {
      drawingContext.fillRect(point.x - 3, point.y - 3, 6, 6);
      drawingContext.strokeRect(point.x - 3, point.y - 3, 6, 6);
    });
    drawingContext.restore();
  }

  function addPolygonPoint(point, eventDetail) {
    if (!state.polygonDraft) {
      state.polygonDraft = {
        baseImageData: drawingContext.getImageData(0, 0, canvas.width, canvas.height),
        points: [point],
        options: captureShapeOptions(state.pointerButton, "shapePolygon")
      };
      renderPolygonDraft();
      setStatus("Polygon started. Click each corner; double-click or click the first point to finish.");
      return;
    }

    const draft = state.polygonDraft;
    if (eventDetail > 1) {
      finalizePolygonDraft();
      return;
    }
    const first = draft.points[0];
    if (draft.points.length >= 3 && Math.hypot(point.x - first.x, point.y - first.y) <= 9) {
      finalizePolygonDraft();
      return;
    }
    draft.points.push(point);
    renderPolygonDraft();
    setStatus(`${draft.points.length} polygon points. Double-click to finish.`);
  }

  function finalizePolygonDraft() {
    const draft = state.polygonDraft;
    if (!draft) return false;
    state.polygonDraft = null;
    if (draft.points.length < 3) {
      drawingContext.putImageData(draft.baseImageData, 0, 0);
      setStatus("A polygon needs at least three points");
      return false;
    }
    beginPendingShape({
      type: "polygon",
      points: draft.points.map((point) => ({ ...point })),
      options: draft.options,
      baseImageData: draft.baseImageData
    });
    return true;
  }

  function cancelPolygonDraft() {
    const draft = state.polygonDraft;
    if (!draft) return;
    drawingContext.putImageData(draft.baseImageData, 0, 0);
    state.polygonDraft = null;
    updateThumbnail();
    setStatus("Polygon cancelled");
  }

  function commitShapeWork() {
    if (state.polygonDraft) {
      finalizePolygonDraft();
    }
    if (state.pendingShape) {
      commitPendingShape();
    }
  }

  function textFont(style) {
    return `${style.italic ? "italic " : ""}${style.bold ? "700 " : "400 "}${style.fontSize}px "${style.fontFamily}", sans-serif`;
  }

  function syncTextEditorStyles() {
    const editor = state.textEditor;
    if (!editor) {
      return;
    }

    const style = state.textStyle;
    editor.input.style.fontFamily = `"${style.fontFamily}", sans-serif`;
    editor.input.style.fontSize = `${style.fontSize}px`;
    editor.input.style.fontWeight = style.bold ? "700" : "400";
    editor.input.style.fontStyle = style.italic ? "italic" : "normal";
    editor.input.style.textDecoration = style.underline ? "underline" : "none";
    editor.input.style.textAlign = style.alignment;
    editor.input.style.color = editor.colour;
    editor.input.style.backgroundColor = style.opaque ? state.colour2 : "transparent";
    editor.input.classList.toggle("is-opaque", style.opaque);

    editor.element.querySelectorAll("[data-text-style]").forEach((button) => {
      const key = button.dataset.textStyle;
      button.classList.toggle("is-selected", Boolean(style[key]));
      button.setAttribute("aria-pressed", String(Boolean(style[key])));
    });
    editor.alignmentButton.textContent = style.alignment === "left"
      ? "L"
      : style.alignment === "center"
        ? "C"
        : "R";
    editor.alignmentButton.title = `Alignment: ${style.alignment}`;
    editor.alignmentButton.setAttribute("aria-label", `Alignment: ${style.alignment}`);
    editor.backgroundButton.classList.toggle("is-selected", style.opaque);
    editor.backgroundButton.setAttribute("aria-pressed", String(style.opaque));
  }

  function prepareTextEditorDrag(editor, toolbar) {
    toolbar.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button, select")) {
        return;
      }
      event.preventDefault();
      const startX = event.clientX;
      const startY = event.clientY;
      const originalLeft = Number.parseFloat(editor.style.left) || 0;
      const originalTop = Number.parseFloat(editor.style.top) || 0;
      const zoomFactor = renderZoomFactor();
      editor.classList.add("is-dragging");
      toolbar.setPointerCapture(event.pointerId);

      function move(moveEvent) {
        const maxLeft = Math.max(0, canvas.width - editor.offsetWidth);
        const maxTop = Math.max(0, canvas.height - editor.offsetHeight);
        const left = originalLeft + (moveEvent.clientX - startX) / zoomFactor;
        const top = originalTop + (moveEvent.clientY - startY) / zoomFactor;
        editor.style.left = `${Math.max(0, Math.min(maxLeft, left))}px`;
        editor.style.top = `${Math.max(0, Math.min(maxTop, top))}px`;
      }

      function finish(upEvent) {
        editor.classList.remove("is-dragging");
        if (toolbar.hasPointerCapture(upEvent.pointerId)) {
          toolbar.releasePointerCapture(upEvent.pointerId);
        }
        toolbar.removeEventListener("pointermove", move);
        toolbar.removeEventListener("pointerup", finish);
        toolbar.removeEventListener("pointercancel", finish);
      }

      toolbar.addEventListener("pointermove", move);
      toolbar.addEventListener("pointerup", finish);
      toolbar.addEventListener("pointercancel", finish);
    });
  }

  function prepareTextEditorResize(editor, handle) {
    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = editor.offsetWidth;
      const startHeight = editor.offsetHeight;
      const left = Number.parseFloat(editor.style.left) || 0;
      const top = Number.parseFloat(editor.style.top) || 0;
      const zoomFactor = renderZoomFactor();
      handle.setPointerCapture(event.pointerId);

      function move(moveEvent) {
        const maxWidth = Math.max(180, canvas.width - left);
        const maxHeight = Math.max(112, canvas.height - top);
        const width = startWidth + (moveEvent.clientX - startX) / zoomFactor;
        const height = startHeight + (moveEvent.clientY - startY) / zoomFactor;
        editor.style.width = `${Math.max(180, Math.min(maxWidth, width))}px`;
        editor.style.height = `${Math.max(112, Math.min(maxHeight, height))}px`;
      }

      function finish(upEvent) {
        if (handle.hasPointerCapture(upEvent.pointerId)) {
          handle.releasePointerCapture(upEvent.pointerId);
        }
        handle.removeEventListener("pointermove", move);
        handle.removeEventListener("pointerup", finish);
        handle.removeEventListener("pointercancel", finish);
      }

      handle.addEventListener("pointermove", move);
      handle.addEventListener("pointerup", finish);
      handle.addEventListener("pointercancel", finish);
    });
  }

  function makeTextStyleButton(label, title, key) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `text-style-button text-style-${key}`;
    button.textContent = label;
    button.title = title;
    button.setAttribute("aria-label", title);
    button.dataset.textStyle = key;
    button.addEventListener("click", () => {
      state.textStyle[key] = !state.textStyle[key];
      syncTextEditorStyles();
    });
    return button;
  }

  function startTextEditor(point, button) {
    if (state.textEditor) {
      commitTextEditor();
    }

    const editor = document.createElement("section");
    editor.className = "canvas-text-editor";
    editor.setAttribute("role", "group");
    editor.setAttribute("aria-label", "Editable text box");

    const toolbar = document.createElement("div");
    toolbar.className = "text-editor-toolbar";
    toolbar.title = "Drag to move the text box";

    const fontFamily = document.createElement("select");
    fontFamily.className = "text-font-family";
    fontFamily.setAttribute("aria-label", "Font family");
    ["Segoe UI", "Arial", "Calibri", "Georgia", "Times New Roman", "Courier New", "Comic Sans MS"].forEach((family) => {
      const option = document.createElement("option");
      option.value = family;
      option.textContent = family;
      fontFamily.appendChild(option);
    });
    fontFamily.value = state.textStyle.fontFamily;
    fontFamily.addEventListener("change", () => {
      state.textStyle.fontFamily = fontFamily.value;
      syncTextEditorStyles();
    });

    const fontSize = document.createElement("select");
    fontSize.className = "text-font-size";
    fontSize.setAttribute("aria-label", "Font size");
    [12, 14, 18, 24, 32, 48, 72].forEach((size) => {
      const option = document.createElement("option");
      option.value = String(size);
      option.textContent = String(size);
      fontSize.appendChild(option);
    });
    fontSize.value = String(state.textStyle.fontSize);
    fontSize.addEventListener("change", () => {
      state.textStyle.fontSize = Number.parseInt(fontSize.value, 10);
      syncTextEditorStyles();
    });

    const alignmentButton = document.createElement("button");
    alignmentButton.type = "button";
    alignmentButton.className = "text-style-button";
    alignmentButton.addEventListener("click", () => {
      state.textStyle.alignment = state.textStyle.alignment === "left"
        ? "center"
        : state.textStyle.alignment === "center"
          ? "right"
          : "left";
      syncTextEditorStyles();
    });

    const backgroundButton = document.createElement("button");
    backgroundButton.type = "button";
    backgroundButton.className = "text-style-button";
    backgroundButton.textContent = "BG";
    backgroundButton.title = "Opaque background";
    backgroundButton.setAttribute("aria-label", "Opaque background");
    backgroundButton.addEventListener("click", () => {
      state.textStyle.opaque = !state.textStyle.opaque;
      syncTextEditorStyles();
    });

    const spacer = document.createElement("span");
    spacer.className = "text-toolbar-spacer";

    const applyButton = document.createElement("button");
    applyButton.type = "button";
    applyButton.className = "text-action-button text-action-apply";
    applyButton.textContent = "Apply";
    applyButton.addEventListener("click", commitTextEditor);

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "text-action-button";
    cancelButton.textContent = "Cancel";
    cancelButton.addEventListener("click", cancelTextEditor);

    toolbar.append(
      fontFamily,
      fontSize,
      makeTextStyleButton("B", "Bold", "bold"),
      makeTextStyleButton("I", "Italic", "italic"),
      makeTextStyleButton("U", "Underline", "underline"),
      alignmentButton,
      backgroundButton,
      spacer,
      applyButton,
      cancelButton
    );

    const input = document.createElement("textarea");
    input.className = "text-editor-input";
    input.setAttribute("aria-label", "Text");
    input.placeholder = "Type text here";
    input.maxLength = 4000;
    input.spellcheck = true;
    input.addEventListener("keydown", (event) => {
      event.stopPropagation();
      if (event.key === "Escape") {
        event.preventDefault();
        cancelTextEditor();
      } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        commitTextEditor();
      }
    });

    const hint = document.createElement("span");
    hint.className = "text-editor-hint";
    hint.textContent = "Ctrl+Enter to apply";

    const resizeHandle = document.createElement("span");
    resizeHandle.className = "text-editor-resize-handle";
    resizeHandle.setAttribute("aria-hidden", "true");

    editor.append(toolbar, input, hint, resizeHandle);
    canvasFrame.appendChild(editor);

    const width = Math.min(520, Math.max(180, canvas.width - 8));
    const height = Math.min(190, Math.max(112, canvas.height - 8));
    const left = Math.max(0, Math.min(canvas.width - width, point.x));
    const top = Math.max(0, Math.min(canvas.height - height, point.y));
    editor.style.width = `${width}px`;
    editor.style.height = `${height}px`;
    editor.style.left = `${left}px`;
    editor.style.top = `${top}px`;

    state.textEditor = {
      element: editor,
      input,
      alignmentButton,
      backgroundButton,
      button,
      colour: colourForPointer(button)
    };
    setControlDisabled(commandUndo, true);
    setControlDisabled(commandRedo, true);
    commandUndo.title = "Finish text editing before undoing";
    commandRedo.title = "Finish text editing before redoing";
    prepareTextEditorDrag(editor, toolbar);
    prepareTextEditorResize(editor, resizeHandle);
    syncTextEditorStyles();
    input.focus();
    setStatus("Editing text. Drag or resize the box, then Apply.");
  }

  function wrapTextLine(context, text, maxWidth) {
    if (!text) {
      return [""];
    }
    const words = text.split(/\s+/);
    const lines = [];
    let line = "";

    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth) {
        line = candidate;
        return;
      }
      if (line) {
        lines.push(line);
      }
      if (context.measureText(word).width <= maxWidth) {
        line = word;
        return;
      }
      let fragment = "";
      Array.from(word).forEach((character) => {
        const candidateFragment = `${fragment}${character}`;
        if (fragment && context.measureText(candidateFragment).width > maxWidth) {
          lines.push(fragment);
          fragment = character;
        } else {
          fragment = candidateFragment;
        }
      });
      line = fragment;
    });

    if (line || lines.length === 0) {
      lines.push(line);
    }
    return lines;
  }

  function commitTextEditor() {
    const editor = state.textEditor;
    if (!editor) {
      return;
    }

    const text = editor.input.value;
    const x = Math.max(0, Math.round(Number.parseFloat(editor.element.style.left) || 0));
    const y = Math.max(0, Math.round(Number.parseFloat(editor.element.style.top) || 0));
    const width = Math.max(1, Math.round(editor.input.clientWidth));
    const height = Math.max(1, Math.round(editor.input.clientHeight));
    editor.element.remove();
    state.textEditor = null;

    if (!text.trim()) {
      updateHistoryControls();
      setStatus("Empty text box removed");
      return;
    }

    const style = { ...state.textStyle };
    const lineHeight = Math.round(style.fontSize * 1.24);
    drawingContext.save();
    drawingContext.beginPath();
    drawingContext.rect(x, y, width, height);
    drawingContext.clip();
    if (style.opaque) {
      drawingContext.fillStyle = state.colour2;
      drawingContext.fillRect(x, y, width, height);
    }
    drawingContext.font = textFont(style);
    drawingContext.fillStyle = editor.colour;
    drawingContext.textBaseline = "top";
    drawingContext.textAlign = style.alignment;

    const lines = text.split(/\r?\n/).flatMap((line) => wrapTextLine(
      drawingContext,
      line,
      Math.max(1, width - 12)
    ));
    lines.forEach((line, index) => {
      const lineY = y + 5 + index * lineHeight;
      if (lineY + lineHeight > y + height) {
        return;
      }
      const lineX = style.alignment === "left"
        ? x + 6
        : style.alignment === "center"
          ? x + width / 2
          : x + width - 6;
      drawingContext.fillText(line, lineX, lineY);
      if (style.underline && line) {
        const lineWidth = drawingContext.measureText(line).width;
        const underlineStart = style.alignment === "left"
          ? lineX
          : style.alignment === "center"
            ? lineX - lineWidth / 2
            : lineX - lineWidth;
        drawingContext.fillRect(
          underlineStart,
          lineY + style.fontSize + 1,
          lineWidth,
          Math.max(1, Math.round(style.fontSize / 14))
        );
      }
    });
    drawingContext.restore();
    commitHistory("Text added");
    updateThumbnail();
  }

  function cancelTextEditor() {
    if (!state.textEditor) {
      return;
    }
    state.textEditor.element.remove();
    state.textEditor = null;
    updateHistoryControls();
    setStatus("Text editing cancelled");
  }

  function pickCanvasColour(point, button) {
    const pixel = drawingContext.getImageData(point.x, point.y, 1, 1).data;
    const colour = rgbToHex({ r: pixel[0], g: pixel[1], b: pixel[2] });
    setColour(colour, button === 2 ? "colour2" : "colour1");
  }

  function setSelectionMode(mode) {
    const nextMode = mode === "freeform" ? "freeform" : "rectangular";
    if (nextMode !== state.selectionMode) {
      clearSelection();
    }
    state.selectionMode = nextMode;
    document.getElementById("toolSelect").classList.toggle(
      "is-freeform",
      state.selectionMode === "freeform"
    );
    setActiveTool(
      "select",
      state.selectionMode === "freeform" ? "Free-form selection" : "Rectangular selection"
    );
  }

  function selectAll() {
    setActiveTool("select", "Select all");
    clearSelection();
    state.selection = {
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      mask: null,
      type: "rectangular"
    };
    updateSelectionOverlay();
    setStatus(`Selected all ${canvas.width} x ${canvas.height}px`);
  }

  function trimSelectionMask(mask, width, height, type) {
    let left = width;
    let top = height;
    let right = -1;
    let bottom = -1;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (!mask[y * width + x]) {
          continue;
        }
        left = Math.min(left, x);
        top = Math.min(top, y);
        right = Math.max(right, x);
        bottom = Math.max(bottom, y);
      }
    }

    if (right < left || bottom < top) {
      return null;
    }

    const trimmedWidth = right - left + 1;
    const trimmedHeight = bottom - top + 1;
    const trimmedMask = new Uint8Array(trimmedWidth * trimmedHeight);
    for (let y = 0; y < trimmedHeight; y += 1) {
      const sourceStart = (top + y) * width + left;
      trimmedMask.set(
        mask.subarray(sourceStart, sourceStart + trimmedWidth),
        y * trimmedWidth
      );
    }

    return {
      x: left,
      y: top,
      width: trimmedWidth,
      height: trimmedHeight,
      mask: trimmedMask,
      type
    };
  }

  function invertSelection() {
    if (!state.selection) {
      setStatus("Make a selection before inverting");
      return;
    }

    const original = cloneSelection(state.selection);
    const inverseMask = new Uint8Array(canvas.width * canvas.height);
    inverseMask.fill(255);
    let invertedPixelCount = inverseMask.length;

    for (let y = 0; y < original.height; y += 1) {
      for (let x = 0; x < original.width; x += 1) {
        if (!selectionIncludesLocalPoint(original, x, y)) {
          continue;
        }
        const canvasX = original.x + x;
        const canvasY = original.y + y;
        if (
          canvasX < 0
          || canvasY < 0
          || canvasX >= canvas.width
          || canvasY >= canvas.height
        ) {
          continue;
        }
        inverseMask[canvasY * canvas.width + canvasX] = 0;
        invertedPixelCount -= 1;
      }
    }

    const invertedSelection = invertedPixelCount > 0
      ? trimSelectionMask(inverseMask, canvas.width, canvas.height, "inverse")
      : null;
    if (!invertedSelection) {
      clearSelection();
      setStatus("Selection inverted: nothing selected");
      return;
    }

    state.selectionFloating = null;
    state.selectionMove = null;
    state.selection = invertedSelection;
    updateSelectionOverlay();
    setStatus("Selection inverted");
  }

  function clearFreeFormDraft() {
    if (!state.freeFormDraft) {
      return;
    }
    state.freeFormDraft.element.remove();
    state.freeFormDraft = null;
  }

  function beginFreeFormSelection(point) {
    clearSelection();
    const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    element.classList.add("freeform-selection-draft");
    element.setAttribute("viewBox", `0 0 ${canvas.width} ${canvas.height}`);
    element.setAttribute("aria-hidden", "true");
    const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    line.setAttribute("points", `${point.x},${point.y}`);
    element.appendChild(line);
    canvasFrame.appendChild(element);
    state.freeFormDraft = {
      element,
      line,
      points: [{ ...point }]
    };
    state.pointerMode = "selection-freeform";
    setStatus("Drag around the area to select");
  }

  function extendFreeFormSelection(point) {
    const draft = state.freeFormDraft;
    if (!draft) {
      return;
    }
    const previous = draft.points[draft.points.length - 1];
    if (Math.hypot(point.x - previous.x, point.y - previous.y) < 2) {
      return;
    }
    draft.points.push({ ...point });
    draft.line.setAttribute(
      "points",
      draft.points.map((draftPoint) => `${draftPoint.x},${draftPoint.y}`).join(" ")
    );
  }

  function finishFreeFormSelection() {
    const draft = state.freeFormDraft;
    if (!draft) {
      return false;
    }
    const points = draft.points;
    draft.element.remove();
    state.freeFormDraft = null;

    if (points.length < 3) {
      clearSelection();
      setStatus("Free-form selection cancelled");
      return false;
    }

    const x = Math.max(0, Math.floor(Math.min(...points.map((point) => point.x))));
    const y = Math.max(0, Math.floor(Math.min(...points.map((point) => point.y))));
    const right = Math.min(canvas.width - 1, Math.ceil(Math.max(...points.map((point) => point.x))));
    const bottom = Math.min(canvas.height - 1, Math.ceil(Math.max(...points.map((point) => point.y))));
    const width = Math.max(1, right - x + 1);
    const height = Math.max(1, bottom - y + 1);
    const maskSource = document.createElement("canvas");
    maskSource.width = width;
    maskSource.height = height;
    const maskContext = maskSource.getContext("2d", { willReadFrequently: true });
    maskContext.fillStyle = "#000";
    maskContext.beginPath();
    maskContext.moveTo(points[0].x - x, points[0].y - y);
    points.slice(1).forEach((point) => maskContext.lineTo(point.x - x, point.y - y));
    maskContext.closePath();
    maskContext.fill();

    const alpha = maskContext.getImageData(0, 0, width, height).data;
    const mask = new Uint8Array(width * height);
    let selectedPixelCount = 0;
    for (let index = 0; index < mask.length; index += 1) {
      if (alpha[index * 4 + 3] > 0) {
        mask[index] = 255;
        selectedPixelCount += 1;
      }
    }

    if (selectedPixelCount === 0) {
      clearSelection();
      setStatus("Free-form selection cancelled");
      return false;
    }

    state.selection = {
      x,
      y,
      width,
      height,
      mask,
      type: "freeform"
    };
    state.selectionFloating = null;
    updateSelectionOverlay();
    setStatus(`Free-form selection ${width} x ${height}px`);
    return true;
  }

  function beginSelection(point) {
    if (pointInsideSelection(point)) {
      const selection = cloneSelection(state.selection);
      const originalCanvas = drawingContext.getImageData(0, 0, canvas.width, canvas.height);
      const sourceImage = currentSelectionCanvas();
      const baseCanvas = imageDataCanvas(originalCanvas);
      const baseContext = baseCanvas.getContext("2d", { willReadFrequently: true });

      if (state.selectionFloating) {
        baseContext.putImageData(
          state.selectionFloating.underlay,
          selection.x,
          selection.y
        );
      } else {
        fillSelectionOnContext(baseContext, selection, state.colour2);
      }

      state.selectionMove = {
        original: selection,
        offsetX: point.x - selection.x,
        offsetY: point.y - selection.y,
        originalCanvas,
        base: baseContext.getImageData(0, 0, canvas.width, canvas.height),
        image: sourceImage,
        renderImage: transparentCanvas(
          sourceImage,
          state.transparentSelection ? state.colour2 : null
        ),
        nextUnderlay: null
      };
      state.pointerMode = "selection-move";
      return;
    }

    if (state.selectionMode === "freeform") {
      beginFreeFormSelection(point);
      return;
    }

    clearSelection();
    state.selection = {
      x: point.x,
      y: point.y,
      width: 0,
      height: 0,
      mask: null,
      type: "rectangular"
    };
    state.selectionFloating = null;
    state.pointerMode = "selection-create";
    updateSelectionOverlay();
  }

  function moveSelection(point) {
    const move = state.selectionMove;
    if (!move) {
      return;
    }

    const nextX = Math.max(0, Math.min(canvas.width - move.original.width, point.x - move.offsetX));
    const nextY = Math.max(0, Math.min(canvas.height - move.original.height, point.y - move.offsetY));
    drawingContext.putImageData(move.base, 0, 0);
    move.nextUnderlay = drawingContext.getImageData(
      nextX,
      nextY,
      move.original.width,
      move.original.height
    );
    drawingContext.drawImage(move.renderImage, nextX, nextY);
    state.selection = {
      ...cloneSelection(move.original),
      x: nextX,
      y: nextY
    };
    updateSelectionOverlay();
  }

  function handleCanvasPointerDown(event) {
    if (event.button !== 0 && event.button !== 2) {
      return;
    }

    event.preventDefault();
    closeChoiceMenu();
    if (state.pendingShape) {
      commitPendingShape();
    }
    canvas.setPointerCapture(event.pointerId);
    const point = getCanvasPoint(event);
    state.pointerButton = event.button;
    state.startPoint = point;
    state.lastPoint = point;

    if (state.activeTool === "select") {
      beginSelection(point);
      return;
    }
    if (state.activeTool === "fill") {
      if (floodFill(point, colourForPointer(event.button))) {
        commitHistory("Area filled");
        updateThumbnail();
      }
      state.pointerMode = "";
      return;
    }
    if (state.activeTool === "eyedropper") {
      pickCanvasColour(point, event.button);
      state.pointerMode = "";
      return;
    }
    if (state.activeTool === "magnifier") {
      nudgeZoom(event.button === 2 ? -10 : 10);
      state.pointerMode = "";
      return;
    }
    if (state.activeTool === "text") {
      if (canvas.hasPointerCapture(event.pointerId)) {
        canvas.releasePointerCapture(event.pointerId);
      }
      startTextEditor(point, event.button);
      state.pointerMode = "";
      return;
    }
    if (state.activeTool === "shape") {
      if (state.activeShape === "shapePolygon") {
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
        addPolygonPoint(point, event.detail);
        state.pointerMode = "";
        state.startPoint = null;
        state.lastPoint = null;
        return;
      }
      state.pointerMode = "shape";
      state.previewImageData = drawingContext.getImageData(0, 0, canvas.width, canvas.height);
      state.previewShapeOptions = captureShapeOptions(event.button, state.activeShape);
      return;
    }

    state.pointerMode = "stroke";
    drawStrokeSegment(point, point);
  }

  function handleCanvasPointerMove(event) {
    if (
      !state.pointerMode
      && state.polygonDraft
      && state.activeTool === "shape"
      && state.activeShape === "shapePolygon"
    ) {
      renderPolygonDraft(getCanvasPoint(event));
      return;
    }
    if (!state.pointerMode) {
      return;
    }

    const point = getCanvasPoint(event);
    if (state.pointerMode === "stroke") {
      drawStrokeSegment(state.lastPoint, point);
      state.lastPoint = point;
    } else if (state.pointerMode === "shape") {
      drawingContext.putImageData(state.previewImageData, 0, 0);
      drawShape(state.startPoint, point, state.previewShapeOptions);
      state.lastPoint = point;
    } else if (state.pointerMode === "selection-create") {
      state.selection = {
        ...normaliseRectangle(state.startPoint, point),
        mask: null,
        type: "rectangular"
      };
      updateSelectionOverlay();
    } else if (state.pointerMode === "selection-freeform") {
      extendFreeFormSelection(point);
    } else if (state.pointerMode === "selection-move") {
      moveSelection(point);
    }
  }

  function handleCanvasPointerUp(event) {
    if (!state.pointerMode) {
      return;
    }

    const completedMode = state.pointerMode;
    const point = getCanvasPoint(event);
    if (completedMode === "shape") {
      drawingContext.putImageData(state.previewImageData, 0, 0);
      if (Math.hypot(point.x - state.startPoint.x, point.y - state.startPoint.y) < 2) {
        setStatus("Drag to size a shape");
      } else {
        const pendingShape = {
          type: "shape",
          start: { ...state.startPoint },
          end: { ...point },
          options: state.previewShapeOptions,
          baseImageData: state.previewImageData
        };
        if (state.previewShapeOptions.shapeId === "shapeCurve") {
          const span = Math.hypot(point.x - state.startPoint.x, point.y - state.startPoint.y);
          const offset = Math.max(18, Math.min(70, span * 0.25));
          pendingShape.control1 = {
            x: state.startPoint.x + (point.x - state.startPoint.x) / 3,
            y: Math.max(0, Math.min(canvas.height, state.startPoint.y + (point.y - state.startPoint.y) / 3 - offset))
          };
          pendingShape.control2 = {
            x: state.startPoint.x + (point.x - state.startPoint.x) * 2 / 3,
            y: Math.max(0, Math.min(canvas.height, state.startPoint.y + (point.y - state.startPoint.y) * 2 / 3 - offset))
          };
        }
        beginPendingShape(pendingShape);
      }
    } else if (completedMode === "stroke") {
      commitHistory(state.activeTool === "eraser" ? "Erased" : "Stroke drawn");
    } else if (completedMode === "selection-create") {
      state.selection = {
        ...normaliseRectangle(state.startPoint, point),
        mask: null,
        type: "rectangular"
      };
      state.selectionFloating = null;
      if (state.selection.width < 2 || state.selection.height < 2) {
        clearSelection();
      } else {
        updateSelectionOverlay();
        setStatus(`Selected ${state.selection.width} x ${state.selection.height}px`);
      }
    } else if (completedMode === "selection-freeform") {
      extendFreeFormSelection(point);
      finishFreeFormSelection();
    } else if (completedMode === "selection-move") {
      const move = state.selectionMove;
      const moved = state.selection.x !== move.original.x || state.selection.y !== move.original.y;
      if (moved && move.nextUnderlay) {
        state.selectionFloating = {
          image: move.image,
          underlay: move.nextUnderlay
        };
        commitHistory("Selection moved");
      } else {
        drawingContext.putImageData(move.originalCanvas, 0, 0);
        state.selection = { ...move.original };
        setStatus("Selection ready");
      }
      state.selectionMove = null;
    }

    state.pointerMode = "";
    state.previewImageData = null;
    state.previewShapeOptions = null;
    state.startPoint = null;
    state.lastPoint = null;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
    updateThumbnail();
  }

  function handleCanvasPointerCancel(event) {
    if (state.pointerMode === "shape" && state.previewImageData) {
      drawingContext.putImageData(state.previewImageData, 0, 0);
    }
    if (state.pointerMode === "selection-move" && state.selectionMove) {
      drawingContext.putImageData(state.selectionMove.originalCanvas, 0, 0);
      state.selection = { ...state.selectionMove.original };
      updateSelectionOverlay();
    }
    if (state.pointerMode === "selection-freeform") {
      clearFreeFormDraft();
      clearSelection();
      setStatus("Free-form selection cancelled");
    }
    state.pointerMode = "";
    state.previewImageData = null;
    state.previewShapeOptions = null;
    state.selectionMove = null;
    if (canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }
  }

  function createSelectionCanvas() {
    const source = currentSelectionCanvas();
    if (!source) {
      return null;
    }
    return transparentCanvas(source, state.transparentSelection ? state.colour2 : null);
  }

  async function canvasBlob(sourceCanvas, type, quality) {
    if (type === "image/gif") {
      if (!window.PaintGifEncoder) {
        throw new Error("GIF encoder is unavailable");
      }
      return window.PaintGifEncoder.encodeCanvas(sourceCanvas);
    }
    return new Promise((resolve) => sourceCanvas.toBlob(
      resolve,
      type || "image/png",
      quality
    ));
  }

  async function copySelection() {
    const clipboardCanvas = createSelectionCanvas();
    if (!clipboardCanvas) {
      setStatus("Make a selection before copying");
      return false;
    }

    state.internalClipboard = clipboardCanvas;
    let systemCopied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.write && window.ClipboardItem) {
        const blob = await canvasBlob(clipboardCanvas, "image/png");
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        systemCopied = true;
      }
    } catch (error) {
      systemCopied = false;
    }

    setStatus(systemCopied ? "Selection copied" : "Selection copied inside Paint");
    return true;
  }

  async function cutSelection() {
    if (!state.selection) {
      setStatus("Make a selection before cutting");
      return;
    }

    await copySelection();
    removeVisibleSelection();
    clearSelection();
    commitHistory("Selection cut");
    updateThumbnail();
  }

  function deleteSelection() {
    if (!state.selection) {
      return;
    }
    removeVisibleSelection();
    clearSelection();
    commitHistory("Selection deleted");
    updateThumbnail();
  }

  function cropToSelection() {
    if (!state.selection) {
      setStatus("Make a selection before cropping");
      return;
    }

    const selection = { ...state.selection };
    const cropped = currentSelectionCanvas();
    clearSelection();
    updateCanvasSize(selection.width, selection.height, { preserve: false });
    drawingContext.fillStyle = state.colour2;
    drawingContext.fillRect(0, 0, canvas.width, canvas.height);
    drawingContext.drawImage(cropped, 0, 0);
    commitHistory("Image cropped");
    updateThumbnail();
  }

  function pasteCanvasSource(source) {
    const sourceWidth = source.width || source.naturalWidth;
    const sourceHeight = source.height || source.naturalHeight;
    if (!sourceWidth || !sourceHeight) {
      setStatus("Clipboard image could not be read");
      return;
    }

    const fittedSize = fitImageWithinCanvasLimit(sourceWidth, sourceHeight);
    const nextWidth = Math.max(canvas.width, fittedSize.width);
    const nextHeight = Math.max(canvas.height, fittedSize.height);
    if (nextWidth !== canvas.width || nextHeight !== canvas.height) {
      updateCanvasSize(nextWidth, nextHeight);
    }

    const pasteWidth = Math.min(fittedSize.width, canvas.width);
    const pasteHeight = Math.min(fittedSize.height, canvas.height);
    const pasteImage = document.createElement("canvas");
    pasteImage.width = pasteWidth;
    pasteImage.height = pasteHeight;
    pasteImage.getContext("2d").drawImage(source, 0, 0, pasteWidth, pasteHeight);
    const underlay = drawingContext.getImageData(0, 0, pasteWidth, pasteHeight);
    const renderSource = transparentCanvas(
      pasteImage,
      state.transparentSelection ? state.colour2 : null
    );
    drawingContext.drawImage(renderSource, 0, 0);
    setActiveTool("select", "Select");
    state.selection = { x: 0, y: 0, width: pasteWidth, height: pasteHeight };
    state.selectionFloating = {
      image: pasteImage,
      underlay
    };
    updateSelectionOverlay();
    commitHistory("Image pasted");
    updateThumbnail();
  }

  async function pasteFromClipboard() {
    closeChoiceMenu();
    commitShapeWork();
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((type) => imageRuleForMimeType(type));
          if (imageType) {
            const blob = await item.getType(imageType);
            const validation = await validateImageBlob(blob, imageRuleForMimeType(imageType));
            if (!validation.valid) {
              setStatus(validation.message);
              return;
            }
            const bitmap = await createImageBitmap(blob);
            pasteCanvasSource(bitmap);
            bitmap.close();
            return;
          }
        }
      }
    } catch (error) {
      // The internal clipboard below remains available when browser permission is denied.
    }

    if (state.internalClipboard) {
      pasteCanvasSource(state.internalClipboard);
      return;
    }

    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          drawingContext.save();
          drawingContext.fillStyle = state.colour1;
          drawingContext.font = "20px \"Segoe UI\", Arial, sans-serif";
          drawingContext.textBaseline = "top";
          text.split(/\r?\n/).forEach((line, index) => {
            drawingContext.fillText(line, 10, 10 + index * 25);
          });
          drawingContext.restore();
          commitHistory("Text pasted");
          updateThumbnail();
          return;
        }
      }
    } catch (error) {
      // Report the common fallback below.
    }

    setStatus("Nothing available to paste");
  }

  async function confirmDiscardChanges(action) {
    if (!state.dirty) {
      return true;
    }
    const values = await showOperationDialog({
      title: "Unsaved Changes",
      message: `Save or copy your work before ${action}.\n\nContinue and discard unsaved changes?`,
      confirmLabel: "Discard",
      cancelLabel: "Keep Editing"
    });
    return Boolean(values);
  }

  async function newDocument() {
    commitShapeWork();
    commitTextEditor();
    if (!await confirmDiscardChanges("creating a new image")) {
      setStatus("New image cancelled");
      return;
    }

    clearSelection();
    updateCanvasSize(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, { preserve: false });
    fillCanvasWhite();
    state.fileName = "untitled.png";
    state.fileHandle = null;
    state.fileMimeType = "image/png";
    resetHistory("New image");
    setZoom(100, { silent: true });
    setStatus("New image");
  }

  function cleanFileName(name) {
    const cleaned = String(name || "untitled")
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-");
    return cleaned || "untitled";
  }

  function imageFileExtension(name) {
    const match = String(name || "").toLowerCase().match(/\.([^.]+)$/);
    return match ? match[1] : "";
  }

  function imageRuleForMimeType(mimeType) {
    const normalisedMimeType = String(mimeType || "").toLowerCase();
    return Object.values(IMAGE_FILE_RULES).find(
      (rule) => rule.mimeTypes.includes(normalisedMimeType)
    ) || null;
  }

  async function readImageSignature(blob) {
    return new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  }

  async function validateImageBlob(blob, rule) {
    if (!blob || !rule) {
      return {
        valid: false,
        message: "Only PNG, JPG, WebP, GIF and BMP images are supported"
      };
    }
    if (blob.size > MAX_IMAGE_FILE_BYTES) {
      return {
        valid: false,
        message: "That image is larger than the 10 MB limit"
      };
    }
    try {
      const signature = await readImageSignature(blob);
      if (!rule.matchesSignature(signature)) {
        return {
          valid: false,
          message: `The file does not have a valid ${rule.label} signature`
        };
      }
    } catch (error) {
      return {
        valid: false,
        message: "That image could not be verified"
      };
    }
    return { valid: true };
  }

  async function validateImageFile(file) {
    if (!file) {
      return { valid: false, message: "No image was selected" };
    }

    const extension = imageFileExtension(file.name);
    const rule = IMAGE_FILE_RULES[extension];
    if (!rule) {
      return {
        valid: false,
        message: "Choose a .png, .jpg, .webp, .gif or .bmp image"
      };
    }

    const mimeType = String(file.type || "").toLowerCase();
    if (mimeType && !rule.mimeTypes.includes(mimeType)) {
      return {
        valid: false,
        message: `The file type does not match its .${extension} extension`
      };
    }

    const blobValidation = await validateImageBlob(file, rule);
    if (!blobValidation.valid) {
      return blobValidation;
    }

    return {
      valid: true,
      extension,
      mimeType: rule.mimeTypes[0]
    };
  }

  function imageFormatForName(name, mimeHint) {
    const lowerName = String(name || "").toLowerCase();
    if (lowerName.endsWith(".jpg")) {
      return { mime: "image/jpeg", extension: ".jpg", quality: 0.92 };
    }
    if (lowerName.endsWith(".webp")) {
      return { mime: "image/webp", extension: ".webp", quality: 0.92 };
    }
    if (lowerName.endsWith(".gif")) {
      return { mime: "image/gif", extension: ".gif", quality: undefined };
    }
    if (lowerName.endsWith(".png")) {
      return { mime: "image/png", extension: ".png", quality: undefined };
    }
    if (mimeHint === "image/jpeg") {
      return { mime: "image/jpeg", extension: ".jpg", quality: 0.92 };
    }
    if (mimeHint === "image/webp") {
      return { mime: "image/webp", extension: ".webp", quality: 0.92 };
    }
    if (mimeHint === "image/gif") {
      return { mime: "image/gif", extension: ".gif", quality: undefined };
    }
    return { mime: "image/png", extension: ".png", quality: undefined };
  }

  function normaliseImageFileName(name, mimeHint) {
    const cleaned = cleanFileName(name);
    const format = imageFormatForName(cleaned, mimeHint);
    if (/\.(png|jpg|webp|gif)$/i.test(cleaned)) {
      return cleaned;
    }
    return `${cleaned.replace(/\.[^.]+$/, "")}${format.extension}`;
  }

  function canSaveOpenedFormat(extension) {
    return (
      extension === "png"
      || extension === "jpg"
      || extension === "webp"
      || extension === "gif"
    );
  }

  function supportsNativeOpen() {
    return window.isSecureContext && typeof window.showOpenFilePicker === "function";
  }

  function supportsNativeSave() {
    return window.isSecureContext && typeof window.showSaveFilePicker === "function";
  }

  const imageOpenPickerOptions = {
    multiple: false,
    types: [
      {
        description: "Image files",
        accept: {
          "image/png": [".png"],
          "image/jpeg": [".jpg"],
          "image/webp": [".webp"],
          "image/bmp": [".bmp"],
          "image/gif": [".gif"]
        }
      }
    ]
  };

  const imageSavePickerTypes = [
    {
      description: "PNG image",
      accept: { "image/png": [".png"] }
    },
    {
      description: "JPEG image",
      accept: { "image/jpeg": [".jpg"] }
    },
    {
      description: "WebP image",
      accept: { "image/webp": [".webp"] }
    },
    {
      description: "GIF image",
      accept: { "image/gif": [".gif"] }
    }
  ];

  async function writeDocumentToHandle(handle) {
    commitShapeWork();
    commitTextEditor();
    const fileName = cleanFileName(
      handle.name || normaliseImageFileName(state.fileName, state.fileMimeType)
    );
    const format = imageFormatForName(fileName, state.fileMimeType);
    if (format.mime === "image/gif") {
      setStatus("Encoding GIF...");
    }
    const blob = await canvasBlob(canvas, format.mime, format.quality);
    if (!blob) {
      throw new Error("The image could not be encoded");
    }
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    state.fileHandle = handle;
    state.fileName = fileName;
    state.fileMimeType = format.mime;
    markCurrentHistoryClean();
    setStatus(`Saved ${state.fileName}`);
  }

  async function openDocument() {
    if (!supportsNativeOpen()) {
      openImageInput.click();
      return;
    }

    try {
      const handles = await window.showOpenFilePicker(imageOpenPickerOptions);
      const handle = handles && handles[0];
      if (!handle) {
        setStatus("Open cancelled");
        return;
      }
      const file = await handle.getFile();
      await loadImageFile(file, { fileHandle: handle });
    } catch (error) {
      if (error && error.name === "AbortError") {
        setStatus("Open cancelled");
      } else {
        state.fileHandle = null;
        setStatus("Native Open was unavailable. Use Open again to choose an image.");
      }
    }
  }

  async function downloadDocument(fileName, options) {
    commitShapeWork();
    commitTextEditor();
    const downloadName = normaliseImageFileName(fileName, options && options.mimeType);
    const format = imageFormatForName(downloadName, options && options.mimeType);
    if (format.mime === "image/gif") {
      setStatus("Encoding GIF...");
    }
    let blob;
    try {
      blob = await canvasBlob(canvas, format.mime, format.quality);
    } catch (error) {
      setStatus("The image could not be encoded");
      return false;
    }
    if (!blob) {
      setStatus("The image could not be saved");
      return false;
    }

    const url = URL.createObjectURL(blob);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = downloadName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      URL.revokeObjectURL(url);
      setStatus("The image download could not be started");
      return false;
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (!options || options.adoptAsDocument !== false) {
      state.fileName = downloadName;
      state.fileHandle = null;
      state.fileMimeType = format.mime;
      markCurrentHistoryClean();
      setStatus(`Saved ${state.fileName}`);
    } else {
      setStatus(`Downloaded ${downloadName}`);
    }
    return true;
  }

  async function saveDocument(saveAs) {
    if (!saveAs && state.fileHandle) {
      try {
        await writeDocumentToHandle(state.fileHandle);
      } catch (error) {
        state.fileHandle = null;
        setStatus("Save permission was lost. Use Save as to choose the file again.");
      }
      return;
    }

    if (supportsNativeSave()) {
      try {
        const suggestedName = normaliseImageFileName(state.fileName, state.fileMimeType);
        const handle = await window.showSaveFilePicker({
          suggestedName,
          types: imageSavePickerTypes,
          excludeAcceptAllOption: false
        });
        await writeDocumentToHandle(handle);
      } catch (error) {
        if (error && error.name === "AbortError") {
          setStatus("Save cancelled");
        } else {
          setStatus("The image could not be saved. Try Save as again.");
        }
      }
      return;
    }

    let fileName = normaliseImageFileName(state.fileName, state.fileMimeType);
    if (saveAs || state.fileName === "untitled.png") {
      const values = await showOperationDialog({
        title: "Save As",
        message: "Choose a file name. PNG, JPEG, WebP and GIF are supported.",
        confirmLabel: "Save",
        fields: [
          {
            name: "fileName",
            label: "File name",
            value: fileName,
            maxLength: 180
          }
        ]
      });
      const chosenName = values && values.fileName;
      if (!chosenName) {
        setStatus("Save cancelled");
        return;
      }
      fileName = chosenName;
    }
    await downloadDocument(fileName);
  }

  async function loadImageFile(file, options) {
    if (!file) {
      return false;
    }
    const validation = await validateImageFile(file);
    if (!validation.valid) {
      setStatus(validation.message);
      return false;
    }
    commitShapeWork();
    commitTextEditor();
    if (!await confirmDiscardChanges("opening another image")) {
      setStatus("Open cancelled");
      return false;
    }

    const imageUrl = URL.createObjectURL(file);
    const image = new Image();
    return new Promise((resolve) => {
      image.onload = () => {
        clearSelection();
        const fittedSize = fitImageWithinCanvasLimit(image.naturalWidth, image.naturalHeight);
        const width = clampCanvasDimension(fittedSize.width, DEFAULT_CANVAS_WIDTH);
        const height = clampCanvasDimension(fittedSize.height, DEFAULT_CANVAS_HEIGHT);
        updateCanvasSize(width, height, { preserve: false });
        drawingContext.imageSmoothingEnabled = false;
        drawingContext.drawImage(image, 0, 0, fittedSize.width, fittedSize.height);
        const openedName = cleanFileName(file.name || "untitled.png");
        const openedFormat = imageFormatForName(openedName, validation.mimeType);
        state.fileName = openedName;
        state.fileMimeType = openedFormat.mime;
        state.fileHandle = options && options.fileHandle && canSaveOpenedFormat(validation.extension)
          ? options.fileHandle
          : null;
        resetHistory(`Opened ${openedName}`);
        setZoom(100, { silent: true });
        setStatus(
          state.fileHandle
            ? `Opened ${openedName}. Save will update this file.`
            : `Opened ${openedName}`
        );
        URL.revokeObjectURL(imageUrl);
        resolve(true);
      };
      image.onerror = () => {
        state.fileHandle = null;
        setStatus("That image could not be opened");
        URL.revokeObjectURL(imageUrl);
        resolve(false);
      };
      image.src = imageUrl;
    });
  }

  function isSupportedImageFile(file) {
    return Boolean(file) && Boolean(IMAGE_FILE_RULES[imageFileExtension(file.name)]);
  }

  async function handleDroppedImage(event) {
    event.preventDefault();
    paintViewport.classList.remove("is-file-dragover");
    const files = Array.from((event.dataTransfer && event.dataTransfer.files) || []);
    const imageFile = files.find(isSupportedImageFile);
    if (!imageFile) {
      setStatus("Drop a PNG, JPG, WebP, BMP or GIF image to open it");
      return;
    }
    await loadImageFile(imageFile);
  }

  function printDocument() {
    commitShapeWork();
    commitTextEditor();
    const imageUrl = canvas.toDataURL("image/png");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setStatus("Allow pop-ups to print this image");
      return;
    }
    printWindow.opener = null;
    printWindow.document.write(
      `<!doctype html><title>Print ${state.fileName}</title><style>html,body{margin:0}img{max-width:100%;height:auto}</style><img src="${imageUrl}" alt="">`
    );
    printWindow.document.close();
    printWindow.addEventListener("load", () => {
      printWindow.focus();
      printWindow.print();
    }, { once: true });
    setStatus("Print view opened");
  }

  async function downloadDesktopBackground() {
    await downloadDocument("mspaint-desktop-background.png", { adoptAsDocument: false });
    setStatus("Desktop image downloaded. Choose it in your system wallpaper settings.");
  }

  async function showProperties() {
    commitShapeWork();
    commitTextEditor();
    const values = await showOperationDialog({
      title: "Image Properties",
      message: "Set the canvas dimensions in pixels.",
      confirmLabel: "Apply",
      fields: [
        {
          name: "width",
          label: "Width",
          value: canvas.width,
          type: "number",
          min: MIN_CANVAS_DIMENSION,
          max: MAX_CANVAS_DIMENSION,
          step: 1
        },
        {
          name: "height",
          label: "Height",
          value: canvas.height,
          type: "number",
          min: MIN_CANVAS_DIMENSION,
          max: MAX_CANVAS_DIMENSION,
          step: 1
        }
      ]
    });
    if (!values) return;

    const width = clampCanvasDimension(values.width, canvas.width);
    const height = clampCanvasDimension(values.height, canvas.height);
    if (width === canvas.width && height === canvas.height) {
      setStatus("Canvas properties unchanged");
      return;
    }
    clearSelection();
    updateCanvasSize(width, height);
    commitHistory("Canvas properties changed");
  }

  async function resizeImage() {
    commitShapeWork();
    commitTextEditor();
    const values = await showOperationDialog({
      title: "Resize Image",
      message: "Resize the image by a percentage.",
      confirmLabel: "Resize",
      fields: [
        {
          name: "percentage",
          label: "Percentage",
          value: 100,
          type: "number",
          min: 1,
          max: 500,
          step: 1
        }
      ]
    });
    if (!values) return;
    const percentage = Math.max(1, Math.min(500, Number.parseFloat(values.percentage)));
    if (!Number.isFinite(percentage) || percentage === 100) {
      setStatus(Number.isFinite(percentage) ? "Image size unchanged" : "Enter a valid percentage");
      return;
    }

    const previous = document.createElement("canvas");
    previous.width = canvas.width;
    previous.height = canvas.height;
    previous.getContext("2d").drawImage(canvas, 0, 0);
    const width = clampCanvasDimension(canvas.width * percentage / 100, canvas.width);
    const height = clampCanvasDimension(canvas.height * percentage / 100, canvas.height);
    clearSelection();
    updateCanvasSize(width, height, { preserve: false });
    drawingContext.imageSmoothingEnabled = false;
    drawingContext.drawImage(previous, 0, 0, width, height);
    commitHistory(`Image resized to ${Math.round(percentage)}%`);
  }

  function rotateImage(operation) {
    commitShapeWork();
    commitTextEditor();
    const previous = document.createElement("canvas");
    previous.width = canvas.width;
    previous.height = canvas.height;
    previous.getContext("2d").drawImage(canvas, 0, 0);
    const swapDimensions = operation === "right" || operation === "left";
    const width = swapDimensions ? previous.height : previous.width;
    const height = swapDimensions ? previous.width : previous.height;

    clearSelection();
    updateCanvasSize(width, height, { preserve: false });
    drawingContext.save();
    if (operation === "right") {
      drawingContext.translate(width, 0);
      drawingContext.rotate(Math.PI / 2);
    } else if (operation === "left") {
      drawingContext.translate(0, height);
      drawingContext.rotate(-Math.PI / 2);
    } else if (operation === "180") {
      drawingContext.translate(width, height);
      drawingContext.rotate(Math.PI);
    } else if (operation === "flip-horizontal") {
      drawingContext.translate(width, 0);
      drawingContext.scale(-1, 1);
    } else if (operation === "flip-vertical") {
      drawingContext.translate(0, height);
      drawingContext.scale(1, -1);
    }
    drawingContext.drawImage(previous, 0, 0);
    drawingContext.restore();
    commitHistory("Image rotated");
    updateThumbnail();
  }

  async function showAboutPaint() {
    const renderAboutMessage = (container) => {
      const content = document.createElement("div");
      content.className = "about-content";

      const addGroup = (...children) => {
        const group = document.createElement("section");
        group.className = "about-group";
        group.append(...children);
        content.appendChild(group);
      };

      const line = (text, className) => {
        const paragraph = document.createElement("p");
        paragraph.className = `about-line${className ? ` ${className}` : ""}`;
        paragraph.textContent = text;
        return paragraph;
      };

      const link = (text, href) => {
        const anchor = document.createElement("a");
        anchor.className = "about-link";
        anchor.textContent = text;
        anchor.href = href;
        if (href.startsWith("https://")) {
          anchor.target = "_blank";
          anchor.rel = "noopener noreferrer";
        }
        return anchor;
      };

      const heading = document.createElement("h3");
      heading.className = "about-heading";
      heading.textContent = "About Paint Online";
      addGroup(heading);

      addGroup(
        line("Paint Online v1.0 - The Paint You Grew Up With", "about-strong")
      );

      addGroup(
        line("An open-source, online and browser-based tribute to classic desktop Paint."),
        line("Supports opening, editing and saving png/jpg/gif/webp file formats up to 2560×2560px (maximum 10MB file size).")
      );

      addGroup(
        line("URL's:"),
        link("https://mspaint.co.uk", "https://mspaint.co.uk"),
        link("https://paint.lat", "https://paint.lat")
      );

      addGroup(
        line("The project and source code can be found here:"),
        link("https://github.com/x87e/paint-online", "https://github.com/x87e/paint-online")
      );

      addGroup(
        line("Contact:"),
        link("contact@boski.net", "mailto:contact@boski.net"),
        link("https://github.com/x87e", "https://github.com/x87e")
      );

      addGroup(
        line("This is a passion project recreating the simple, nostalgic feel of classic MS Paint in the browser.", "about-emphasis"),
        line("This project is purely non-commercial, for fun, and is not affiliated with or endorsed by Microsoft.", "about-emphasis")
      );

      container.appendChild(content);
    };

    await showOperationDialog({
      title: "About Paint Online",
      renderMessage: renderAboutMessage,
      variant: "about",
      showCancel: false
    });
  }

  function clampZoom(value) {
    const numeric = Number.parseFloat(String(value).replace("%", ""));
    if (Number.isNaN(numeric)) {
      return state.zoom;
    }
    return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.round(numeric)));
  }

  function setZoom(value, options) {
    const nextZoom = clampZoom(value);
    state.zoom = nextZoom;
    syncScaledCanvasMetrics();
    zoomRange.value = String(nextZoom);
    zoomPercent.textContent = `${nextZoom}%`;
    viewZoomPercentText.textContent = String(nextZoom);
    viewZoomLabelPercent.textContent = `${nextZoom}%`;
    updateThumbnailAvailability();
    renderRulers();
    updateThumbnail();

    if (!options || !options.silent) {
      setStatus(`Zoom: ${nextZoom}%`);
    }
  }

  function nudgeZoom(delta) {
    setZoom(state.zoom + delta);
  }

  function activateWithin(selector, activeElement) {
    document.querySelectorAll(selector).forEach((button) => {
      button.classList.toggle("is-active", button === activeElement);
    });
  }

  function setRulersVisible(visible) {
    paintApp.classList.toggle("show-rulers", visible);
    viewRulers.checked = visible;
    renderRulers();
    setStatus(visible ? "Rulers shown" : "Rulers hidden");
  }

  function setGridlinesVisible(visible) {
    paintApp.classList.toggle("show-gridlines", visible);
    viewGridlines.checked = visible;
    setStatus(visible ? "Gridlines shown" : "Gridlines hidden");
  }

  function setStatusBarVisible(visible) {
    viewStatusBar.checked = visible;
    statusBar.hidden = !visible;
    statusBar.setAttribute("aria-hidden", String(!visible));
    if (visible) {
      setStatus("Status bar shown");
    }
  }

  function renderRulers() {
    if (!paintApp.classList.contains("show-rulers")) {
      return;
    }

    const factor = renderZoomFactor();
    horizontalRuler.textContent = "";
    verticalRuler.textContent = "";

    for (let value = 0; value <= state.canvasWidth; value += 100) {
      const mark = document.createElement("span");
      mark.className = "ruler-mark";
      mark.style.left = `${value * factor}px`;
      mark.textContent = String(value);
      horizontalRuler.appendChild(mark);
    }

    for (let value = 0; value <= state.canvasHeight; value += 100) {
      const mark = document.createElement("span");
      mark.className = "ruler-mark";
      mark.style.top = `${value * factor}px`;
      mark.textContent = String(value);
      verticalRuler.appendChild(mark);
    }
  }

  function updateThumbnailAvailability() {
    const enabled = state.zoom > 100;
    viewThumbnail.classList.toggle("is-disabled", !enabled);
    viewThumbnail.setAttribute("aria-disabled", String(!enabled));
    viewThumbnail.disabled = !enabled;

    if (!enabled) {
      state.showThumbnail = false;
      thumbnailWindow.hidden = true;
      viewThumbnail.setAttribute("aria-pressed", "false");
    }
  }

  function positionThumbnail() {
    if (thumbnailWindow.hidden) {
      return;
    }

    const margin = 16;
    const left = paintViewport.scrollLeft + paintViewport.clientWidth - thumbnailWindow.offsetWidth - margin;
    const top = paintViewport.scrollTop + paintViewport.clientHeight - thumbnailWindow.offsetHeight - margin;
    thumbnailWindow.style.left = `${Math.max(margin, left)}px`;
    thumbnailWindow.style.top = `${Math.max(margin, top)}px`;
  }

  function updateThumbnail() {
    if (!state.showThumbnail || state.zoom <= 100) {
      return;
    }

    const maxWidth = Math.max(96, Math.floor(paintViewport.clientWidth / 4));
    const maxHeight = Math.max(72, Math.floor(paintViewport.clientHeight / 4));
    const aspect = state.canvasWidth / state.canvasHeight;
    let width = maxWidth;
    let height = Math.round(width / aspect);

    if (height > maxHeight) {
      height = maxHeight;
      width = Math.round(height * aspect);
    }

    thumbnailCanvas.width = width;
    thumbnailCanvas.height = height;
    thumbnailWindow.style.width = `${width}px`;
    thumbnailContext.fillStyle = "#ffffff";
    thumbnailContext.fillRect(0, 0, width, height);
    thumbnailContext.drawImage(canvas, 0, 0, width, height);
    positionThumbnail();
  }

  function toggleThumbnail() {
    if (state.zoom <= 100) {
      setStatus("Thumbnail is available when zoomed in.");
      return;
    }

    state.showThumbnail = !state.showThumbnail;
    thumbnailWindow.hidden = !state.showThumbnail;
    viewThumbnail.setAttribute("aria-pressed", String(state.showThumbnail));
    updateThumbnail();
    setStatus(state.showThumbnail ? "Thumbnail shown" : "Thumbnail hidden");
  }

  function isFullscreen() {
    return document.fullscreenElement === paintViewport || state.fullscreenFallback;
  }

  async function enterFullscreen() {
    closeFileMenu();
    paintViewport.classList.add("is-fullscreen");

    try {
      if (paintViewport.requestFullscreen) {
        await paintViewport.requestFullscreen();
      } else {
        state.fullscreenFallback = true;
        document.body.classList.add("is-viewport-fullscreen");
      }
    } catch (error) {
      state.fullscreenFallback = true;
      document.body.classList.add("is-viewport-fullscreen");
    }

    viewFullScreen.classList.add("is-selected");
    setStatus("Full screen view. Double-click the workspace to return.");
    updateThumbnail();
  }

  async function exitFullscreen() {
    if (document.fullscreenElement === paintViewport && document.exitFullscreen) {
      await document.exitFullscreen();
    }

    state.fullscreenFallback = false;
    document.body.classList.remove("is-viewport-fullscreen");
    paintViewport.classList.remove("is-fullscreen");
    viewFullScreen.classList.remove("is-selected");
    setStatus("Full screen closed");
    updateThumbnail();
  }

  function toggleFullscreen() {
    if (isFullscreen()) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }

  function beginZoomEdit(event) {
    event.preventDefault();
    event.stopPropagation();
    window.clearTimeout(state.zoomResetTimer);

    if (viewZoomReset.querySelector(".zoom-edit-input")) {
      return;
    }

    const input = document.createElement("input");
    input.type = "number";
    input.className = "zoom-edit-input";
    input.min = String(MIN_ZOOM);
    input.max = String(MAX_ZOOM);
    input.value = String(state.zoom);
    input.setAttribute("aria-label", "Custom zoom percentage");
    viewZoomLabelPercent.hidden = true;
    viewZoomLabelPercent.parentElement.appendChild(input);
    let editorClosed = false;

    function closeEditor(commit) {
      if (editorClosed) {
        return;
      }
      editorClosed = true;
      if (commit) {
        setZoom(input.value);
      }
      input.remove();
      viewZoomLabelPercent.hidden = false;
    }

    input.addEventListener("keydown", (keyEvent) => {
      if (keyEvent.key === "Enter") {
        closeEditor(true);
      }
      if (keyEvent.key === "Escape") {
        closeEditor(false);
      }
    });

    input.addEventListener("click", (clickEvent) => clickEvent.stopPropagation());
    input.addEventListener("dblclick", (dblClickEvent) => dblClickEvent.stopPropagation());
    input.addEventListener("blur", () => closeEditor(true), { once: true });
    input.focus();
    input.select();
  }

  function prepareCanvasResize(handle) {
    handle.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      commitShapeWork();
      commitTextEditor();
      clearSelection();
      const axis = handle.dataset.resizeAxis;
      const cursorClass = axis === "xy" ? "is-resizing-xy" : axis === "x" ? "is-resizing-x" : "is-resizing-y";
      const startX = event.clientX;
      const startY = event.clientY;
      const startWidth = canvas.width;
      const startHeight = canvas.height;
      const zoomFactor = renderZoomFactor();

      document.body.classList.add(cursorClass);
      handle.setPointerCapture(event.pointerId);

      function onMove(moveEvent) {
        const deltaX = (moveEvent.clientX - startX) / zoomFactor;
        const deltaY = (moveEvent.clientY - startY) / zoomFactor;
        const nextWidth = axis.includes("x") ? startWidth + deltaX : startWidth;
        const nextHeight = axis.includes("y") ? startHeight + deltaY : startHeight;
        updateCanvasSize(nextWidth, nextHeight);
      }

      function onUp(upEvent) {
        document.body.classList.remove(cursorClass);
        if (handle.hasPointerCapture(upEvent.pointerId)) {
          handle.releasePointerCapture(upEvent.pointerId);
        }
        handle.removeEventListener("pointermove", onMove);
        handle.removeEventListener("pointerup", onUp);
        handle.removeEventListener("pointercancel", onUp);
        if (canvas.width !== startWidth || canvas.height !== startHeight) {
          commitHistory("Canvas resized");
        } else {
          setStatus("Canvas size unchanged");
        }
      }

      handle.addEventListener("pointermove", onMove);
      handle.addEventListener("pointerup", onUp);
      handle.addEventListener("pointercancel", onUp);
    });
  }

  fileButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeChoiceMenu();
    toggleFileMenu();
  });

  document.querySelectorAll("[data-ribbon-target]").forEach((tab) => {
    tab.addEventListener("click", () => {
      closeChoiceMenu();
      setRibbon(tab.dataset.ribbonTarget);
    });
  });

  document.addEventListener("click", (event) => {
    if (!fileMenu.hidden && !fileMenu.contains(event.target) && event.target !== fileButton) {
      closeFileMenu();
    }
    if (state.activeChoiceMenu && !state.activeChoiceMenu.menu.contains(event.target)) {
      closeChoiceMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const commandKey = event.ctrlKey || event.metaKey;

    if (!operationDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOperationDialog(null);
      } else if (event.key === "Tab") {
        trapDialogFocus(event, operationDialog);
      }
      return;
    }

    if (!editColoursDialog.hidden) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeEditColoursDialog();
      } else if (event.key === "Tab") {
        trapDialogFocus(event, editColoursDialog);
      }
      return;
    }

    if (
      state.textEditor
      && state.textEditor.element.contains(event.target)
    ) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelTextEditor();
      } else if (event.key === "Enter" && commandKey) {
        event.preventDefault();
        commitTextEditor();
      }
      return;
    }

    if (state.polygonDraft) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelPolygonDraft();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        finalizePolygonDraft();
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        state.polygonDraft.points.pop();
        if (state.polygonDraft.points.length === 0) {
          cancelPolygonDraft();
        } else {
          renderPolygonDraft();
          setStatus(`${state.polygonDraft.points.length} polygon point${state.polygonDraft.points.length === 1 ? "" : "s"}.`);
        }
        return;
      }
    }

    if (state.pendingShape) {
      if (event.key === "Escape") {
        event.preventDefault();
        cancelPendingShape();
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        commitPendingShape();
        return;
      }
    }

    if (commandKey && key === "z") {
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
      return;
    }
    if (commandKey && key === "y") {
      event.preventDefault();
      redo();
      return;
    }
    if (commandKey && key === "s") {
      event.preventDefault();
      saveDocument(event.shiftKey);
      return;
    }
    if (commandKey && key === "o") {
      event.preventDefault();
      openDocument();
      return;
    }
    if (commandKey && key === "n") {
      event.preventDefault();
      newDocument();
      return;
    }
    if (commandKey && key === "a") {
      event.preventDefault();
      selectAll();
      return;
    }
    if (commandKey && key === "c" && state.selection) {
      event.preventDefault();
      copySelection();
      return;
    }
    if (commandKey && key === "x" && state.selection) {
      event.preventDefault();
      cutSelection();
      return;
    }
    if (commandKey && key === "v") {
      event.preventDefault();
      pasteFromClipboard();
      return;
    }

    if (event.key === "Escape") {
      if (state.activeChoiceMenu) {
        closeChoiceMenu();
        return;
      }
      if (state.selection) {
        clearSelection();
        setStatus("Selection cleared");
        return;
      }
      closeFileMenu();
      if (state.fullscreenFallback) {
        exitFullscreen();
      }
    }

    if (event.key === "F11") {
      event.preventDefault();
      toggleFullscreen();
    }

    if (event.key === "Delete" && state.selection) {
      event.preventDefault();
      deleteSelection();
    }

    if (commandKey && event.key === "PageUp") {
      event.preventDefault();
      nudgeZoom(10);
    }

    if (commandKey && event.key === "PageDown") {
      event.preventDefault();
      nudgeZoom(-10);
    }

    if (commandKey && key === "r") {
      event.preventDefault();
      setRulersVisible(!viewRulers.checked);
    }

    if (commandKey && key === "g") {
      event.preventDefault();
      setGridlinesVisible(!viewGridlines.checked);
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement === paintViewport) {
      paintViewport.classList.add("is-fullscreen");
      viewFullScreen.classList.add("is-selected");
    } else if (!state.fullscreenFallback) {
      paintViewport.classList.remove("is-fullscreen");
      viewFullScreen.classList.remove("is-selected");
    }
    updateThumbnail();
  });

  const fileCommandHandlers = {
    commandNew: newDocument,
    commandOpen: openDocument,
    commandSave: () => saveDocument(false),
    commandSaveAs: () => saveDocument(true),
    commandPrint: printDocument,
    commandSetAsDesktop: downloadDesktopBackground,
    commandProperties: showProperties,
    commandAbout: showAboutPaint
  };

  document.querySelectorAll(".file-option").forEach((option) => {
    option.addEventListener("click", () => {
      closeFileMenu();
      const handler = fileCommandHandlers[option.id];
      if (handler) handler();
    });
  });

  const directToolMap = {
    toolPencil: ["pencil", "Pencil"],
    toolFill: ["fill", "Fill with colour"],
    toolText: ["text", "Text"],
    toolEraser: ["eraser", "Eraser"],
    toolEyedrop: ["eyedropper", "Colour picker"],
    toolMagnifier: ["magnifier", "Magnifier"]
  };

  document.querySelectorAll(".tool-button").forEach((button) => {
    button.addEventListener("click", () => {
      const [tool, label] = directToolMap[button.id];
      setActiveTool(tool, label);
    });
  });

  document.querySelectorAll(".shape-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeShape = button.id;
      setActiveTool("shape", button.title);
    });
  });

  document.getElementById("toolSelect").addEventListener("click", () => {
    setSelectionMode(state.selectionMode);
  });
  selectionOptions.addEventListener("click", (event) => {
    event.stopPropagation();
    const hasSelection = Boolean(state.selection);
    showChoiceMenu(selectionOptions, [
      { heading: "Selection shapes" },
      {
        label: "Rectangular selection",
        value: "rectangular",
        selected: state.selectionMode === "rectangular",
        iconClass: "selection-icon-rectangle"
      },
      {
        label: "Free-form selection",
        value: "freeform",
        selected: state.selectionMode === "freeform",
        iconClass: "selection-icon-freeform"
      },
      { heading: "Selection options" },
      {
        label: "Select all",
        value: "select-all",
        iconClass: "selection-icon-all"
      },
      {
        label: "Invert selection",
        value: "invert",
        disabled: !hasSelection,
        iconClass: "selection-icon-invert"
      },
      {
        label: "Delete",
        value: "delete",
        disabled: !hasSelection,
        iconClass: "selection-icon-delete"
      },
      {
        label: "Transparent selection",
        value: "transparent",
        selected: state.transparentSelection,
        iconClass: "selection-icon-transparent"
      }
    ], (action) => {
      if (action === "rectangular" || action === "freeform") {
        setSelectionMode(action);
      } else if (action === "select-all") {
        selectAll();
      } else if (action === "invert") {
        setActiveTool("select", "Invert selection");
        invertSelection();
      } else if (action === "delete") {
        deleteSelection();
      } else if (action === "transparent") {
        setActiveTool("select", "Transparent selection");
        setTransparentSelection(!state.transparentSelection);
      }
    }, "selection-choice-menu");
  });
  document.getElementById("toolResize").addEventListener("click", resizeImage);
  document.getElementById("toolRotate").addEventListener("click", (event) => {
    event.stopPropagation();
    showChoiceMenu(event.currentTarget, [
      { label: "Rotate right 90°", value: "right" },
      { label: "Rotate left 90°", value: "left" },
      { label: "Rotate 180°", value: "180" },
      { label: "Flip horizontal", value: "flip-horizontal" },
      { label: "Flip vertical", value: "flip-vertical" }
    ], rotateImage);
  });

  document.getElementById("toolBrushes").addEventListener("click", (event) => {
    event.stopPropagation();
    const brushButton = event.currentTarget;
    setActiveTool("brush", "Brush");
    showChoiceMenu(brushButton, brushChoices.map((choice) => ({
      ...choice,
      title: choice.label,
      selected: state.brushStyle === choice.value
    })), (value) => {
      const choice = brushChoices.find((item) => item.value === value) || brushChoices[0];
      state.brushStyle = value;
      brushButton.dataset.brushStyle = value;
      brushButton.title = `${choice.label} selected`;
      setActiveTool("brush", choice.label);
    }, "brush-choice-menu");
  });

  document.getElementById("toolSize").addEventListener("click", (event) => {
    event.stopPropagation();
    showChoiceMenu(event.currentTarget, [1, 3, 5, 8, 12].map((size) => ({
      label: `${size}px`,
      value: size,
      selected: state.brushSize === size
    })), (size) => {
      state.brushSize = size;
      if (state.pendingShape) {
        state.pendingShape.options.brushSize = size;
        redrawPendingShape();
      }
      if (state.polygonDraft) {
        state.polygonDraft.options.brushSize = size;
        renderPolygonDraft();
      }
      setStatus(`Line size: ${size}px`);
    });
  });

  document.getElementById("shapeOutline").addEventListener("click", (event) => {
    event.stopPropagation();
    showChoiceMenu(event.currentTarget, [
      { label: "Solid outline", value: true, selected: state.shapeOutline },
      { label: "No outline", value: false, selected: !state.shapeOutline }
    ], (value) => {
      state.shapeOutline = value;
      if (state.pendingShape) {
        state.pendingShape.options.outline = value;
        redrawPendingShape();
      }
      if (state.polygonDraft) {
        state.polygonDraft.options.outline = value;
        renderPolygonDraft();
      }
      document.getElementById("shapeOutline").classList.toggle("is-selected", value);
      setStatus(value ? "Solid shape outline" : "Shape outline disabled");
    });
  });

  document.getElementById("shapeFill").addEventListener("click", (event) => {
    event.stopPropagation();
    showChoiceMenu(event.currentTarget, [
      { label: "No fill", value: false, selected: !state.shapeFill },
      { label: "Solid fill", value: true, selected: state.shapeFill }
    ], (value) => {
      state.shapeFill = value;
      if (state.pendingShape) {
        state.pendingShape.options.fill = value;
        redrawPendingShape();
      }
      if (state.polygonDraft) {
        state.polygonDraft.options.fill = value;
        renderPolygonDraft();
      }
      document.getElementById("shapeFill").classList.toggle("is-selected", value);
      setStatus(value ? "Solid shape fill" : "Shape fill disabled");
    });
  });

  document.getElementById("commandPaste").addEventListener("click", (event) => {
    flashPressedButton(event.currentTarget);
    pasteFromClipboard();
  });
  document.getElementById("commandCut").addEventListener("click", (event) => {
    flashPressedButton(event.currentTarget);
    cutSelection();
  });
  document.getElementById("commandCopy").addEventListener("click", (event) => {
    flashPressedButton(event.currentTarget);
    copySelection();
  });
  commandUndo.addEventListener("click", undo);
  commandRedo.addEventListener("click", redo);
  document.getElementById("toolCrop").addEventListener("click", cropToSelection);

  openImageInput.addEventListener("change", () => {
    loadImageFile(openImageInput.files && openImageInput.files[0]);
    openImageInput.value = "";
  });

  document.getElementById("colour1").addEventListener("click", () => setActiveColourRole("colour1"));
  document.getElementById("colour2").addEventListener("click", () => setActiveColourRole("colour2"));
  commandEditColours.addEventListener("click", openEditColoursDialog);

  document.getElementById("editColoursClose").addEventListener("click", closeEditColoursDialog);
  document.getElementById("editColoursCancel").addEventListener("click", closeEditColoursDialog);
  document.getElementById("editColoursOk").addEventListener("click", () => {
    setColour(state.editColour.hex);
    closeEditColoursDialog();
  });

  operationDialogForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(operationDialogForm).entries());
    closeOperationDialog(values);
  });
  document.getElementById("operationDialogClose").addEventListener("click", () => {
    closeOperationDialog(null);
  });
  operationDialogCancel.addEventListener("click", () => {
    closeOperationDialog(null);
  });

  document.getElementById("addToCustomColours").addEventListener("click", () => {
    const emptyIndex = state.customColours.findIndex((colour) => !colour);
    const targetIndex = emptyIndex === -1 ? state.selectedCustomColourIndex : emptyIndex;
    const safeTargetIndex = targetIndex < 0 ? 0 : targetIndex;
    state.customColours[safeTargetIndex] = state.editColour.hex;
    state.selectedCustomColourIndex = safeTargetIndex;
    refreshCustomColourSwatches();
    setDialogColourFromRgb(hexToRgb(state.editColour.hex), "custom-add");
    setStatus("Custom colour added");
  });

  [fieldHue, fieldSat, fieldLum].forEach((field) => {
    field.addEventListener("input", () => {
      if (state.syncingColourFields) {
        return;
      }
      setDialogColourFromHsl({
        h: fieldHue.value,
        s: fieldSat.value,
        l: fieldLum.value
      }, "field");
    });
  });

  [fieldRed, fieldGreen, fieldBlue].forEach((field) => {
    field.addEventListener("input", () => {
      if (state.syncingColourFields) {
        return;
      }
      setDialogColourFromRgb({
        r: fieldRed.value,
        g: fieldGreen.value,
        b: fieldBlue.value
      }, "field");
    });
  });

  prepareColourDrag(colourSpectrum, pickSpectrumColour);
  prepareColourDrag(luminositySlider, pickLuminosity);

  zoomRange.addEventListener("input", () => setZoom(zoomRange.value));
  document.getElementById("zoomOut").addEventListener("click", () => nudgeZoom(-10));
  document.getElementById("zoomIn").addEventListener("click", () => nudgeZoom(10));
  document.getElementById("viewZoomOut").addEventListener("click", () => nudgeZoom(-10));
  document.getElementById("viewZoomIn").addEventListener("click", () => nudgeZoom(10));

  viewZoomReset.addEventListener("click", () => {
    window.clearTimeout(state.zoomResetTimer);
    state.zoomResetTimer = window.setTimeout(() => setZoom(100), 180);
  });

  viewZoomLabelPercent.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
  });
  viewZoomLabelPercent.addEventListener("dblclick", beginZoomEdit);

  viewRulers.addEventListener("change", (event) => setRulersVisible(event.target.checked));
  viewGridlines.addEventListener("change", (event) => setGridlinesVisible(event.target.checked));
  viewStatusBar.addEventListener("change", (event) => setStatusBarVisible(event.target.checked));
  viewFullScreen.addEventListener("click", toggleFullscreen);
  viewThumbnail.addEventListener("click", toggleThumbnail);

  paintViewport.addEventListener("dblclick", () => {
    if (isFullscreen()) {
      exitFullscreen();
    }
  });

  paintViewport.addEventListener("scroll", positionThumbnail);
  paintViewport.addEventListener("dragenter", (event) => {
    if (event.dataTransfer && Array.from(event.dataTransfer.types || []).includes("Files")) {
      event.preventDefault();
      paintViewport.classList.add("is-file-dragover");
    }
  });
  paintViewport.addEventListener("dragover", (event) => {
    if (event.dataTransfer && Array.from(event.dataTransfer.types || []).includes("Files")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
      paintViewport.classList.add("is-file-dragover");
    }
  });
  paintViewport.addEventListener("dragleave", (event) => {
    if (!paintViewport.contains(event.relatedTarget)) {
      paintViewport.classList.remove("is-file-dragover");
    }
  });
  paintViewport.addEventListener("drop", handleDroppedImage);
  window.addEventListener("resize", updateThumbnail);
  window.addEventListener("resize", syncRibbonOverflow);
  window.addEventListener("beforeunload", (event) => {
    if (!state.dirty) {
      return;
    }
    event.preventDefault();
    event.returnValue = "";
  });
  document.querySelectorAll(".canvas-resize-handle").forEach(prepareCanvasResize);
  canvas.addEventListener("pointerdown", handleCanvasPointerDown);
  canvas.addEventListener("pointermove", handleCanvasPointerMove);
  canvas.addEventListener("pointerup", handleCanvasPointerUp);
  canvas.addEventListener("pointercancel", handleCanvasPointerCancel);
  canvas.addEventListener("dblclick", (event) => {
    if (state.polygonDraft) {
      event.preventDefault();
      finalizePolygonDraft();
    }
  });
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  buildPalette();
  buildEditColoursDialog();
  updateColourPreviews();
  updateCanvasSize(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, { preserve: false });
  setZoom(100, { silent: true });
  resetHistory("Initial canvas");
  setTransparentSelection(false);
  setActiveTool("brush", "Brush");
  window.requestAnimationFrame(syncRibbonOverflow);
}());
