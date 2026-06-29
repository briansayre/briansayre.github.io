// Configurable Conway's Game of Life background, adapted from sketch.js.
// The simulation steps at `fps` generations/second, but renders at ~30fps and
// eases each cell's opacity toward its target so births/deaths fade smoothly
// instead of popping.
// Set `window.GOL_CONFIG` before this script loads to tune appearance/behavior.
//   cellSize    px size of each cell            (default 15)
//   bg          [r,g,b] canvas background       (default 242,242,244)
//   cell        [r,g,b,a] live-cell color       (default 100,100,100,8)
//   fps         generations per second          (default 5)
//   fadeMs      fade duration per birth/death   (default ~step length)
//   density     fraction of cells alive at seed (default 0.2)
//   shape       'square' | 'circle'             (default 'square')
//   interactive click/drag to seed cells        (default false)
//   zIndex      canvas stacking                 (default -1)
(function () {
    var cfg = window.GOL_CONFIG || {};
    var CELL_SIZE = cfg.cellSize || 15;
    var bgArr = cfg.bg || [242, 242, 244];
    var cellArr = cfg.cell || [100, 100, 100, 8];
    var FPS = cfg.fps || 5;
    var DENSITY = cfg.density != null ? cfg.density : 0.2;
    var SHAPE = cfg.shape || "square";
    var INTERACTIVE = !!cfg.interactive;
    var Z = cfg.zIndex != null ? cfg.zIndex : -1;

    var STEP_MS = 1000 / FPS; // time between generations
    var FADE_MS = cfg.fadeMs || Math.min(STEP_MS, 300); // birth/death fade time

    var ROWS = 0,
        COLS = 0,
        cells = [], // 0/1 current generation
        disp = [], // 0..1 eased display opacity per cell
        BG_COLOR,
        cr = 0, cg = 0, cb = 0, ca = 255, // cell color components
        bgStr = "",
        cellStr = "",
        sinceStep = 0,
        lastW = 0,
        resizeTimer = null;

    // If the page defines --gol-bg / --gol-cell, follow them (lets the
    // animation react to a light/dark theme toggle). Falls back to config.
    function refreshThemeColors() {
        if (typeof document === "undefined") return;
        var cs = getComputedStyle(document.documentElement);
        var b = cs.getPropertyValue("--gol-bg").trim();
        var c = cs.getPropertyValue("--gol-cell").trim();
        if (b && b !== bgStr) { bgStr = b; BG_COLOR = color(b); }
        if (c && c !== cellStr) {
            cellStr = c;
            var cc = color(c);
            cr = red(cc); cg = green(cc); cb = blue(cc); ca = alpha(cc);
        }
    }

    function seed() {
        ROWS = Math.ceil(windowHeight / CELL_SIZE);
        COLS = Math.ceil(windowWidth / CELL_SIZE);
        cells = [];
        disp = [];
        for (var i = 0; i < ROWS; i++) {
            cells[i] = [];
            disp[i] = [];
            for (var j = 0; j < COLS; j++) {
                var alive = random() < DENSITY ? 1 : 0;
                cells[i][j] = alive;
                disp[i][j] = alive; // start settled so the first frame isn't blank
            }
        }
    }

    // Grow the grid to cover a new size WITHOUT wiping the simulation. Used for
    // height-only resizes (e.g. a mobile browser's URL bar showing/hiding), so
    // the board isn't reborn on every scroll jiggle.
    function extendGrid() {
        var newRows = Math.ceil(windowHeight / CELL_SIZE);
        var newCols = Math.ceil(windowWidth / CELL_SIZE);
        for (var i = 0; i < newRows; i++) {
            if (!cells[i]) { cells[i] = []; disp[i] = []; }
            for (var j = 0; j < newCols; j++) {
                if (cells[i][j] === undefined) {
                    var alive = random() < DENSITY ? 1 : 0;
                    cells[i][j] = alive;
                    disp[i][j] = alive;
                }
            }
        }
        ROWS = newRows;
        COLS = newCols;
    }

    window.setup = function () {
        BG_COLOR = color(bgArr[0], bgArr[1], bgArr[2]);
        var dc = color(
            cellArr[0], cellArr[1], cellArr[2],
            cellArr[3] != null ? cellArr[3] : 255
        );
        cr = red(dc); cg = green(dc); cb = blue(dc); ca = alpha(dc);

        var canvas = createCanvas(windowWidth, windowHeight);
        // Pin to the viewport via fixed positioning — more reliable across
        // browsers than p5's canvas.position(), which can land at an offset.
        var el = canvas.elt;
        el.style.position = "fixed";
        el.style.left = "0";
        el.style.top = "0";
        el.style.zIndex = String(Z);

        frameRate(30);
        strokeWeight(0);
        refreshThemeColors();
        seed();
        sinceStep = 0;
        lastW = windowWidth;
    };

    window.windowResized = function () {
        // Mobile browsers fire 'resize' repeatedly as the URL bar shows/hides
        // (height changes, width stays). Debounce, and only re-seed on a real
        // width change; for height-only changes keep the board and just cover
        // the new area — no more reseeding on every Safari scroll/refresh tug.
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resizeCanvas(windowWidth, windowHeight);
            if (windowWidth !== lastW) {
                seed();
                sinceStep = 0;
            } else {
                extendGrid();
            }
            lastW = windowWidth;
        }, 150);
    };

    function paintAt(px, py, radius) {
        var cx = Math.floor(px / CELL_SIZE);
        var cy = Math.floor(py / CELL_SIZE);
        for (var dy = -radius; dy <= radius; dy++) {
            for (var dx = -radius; dx <= radius; dx++) {
                var x = cx + dx,
                    y = cy + dy;
                if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
                    if (random() < 0.6) cells[y][x] = 1;
                }
            }
        }
    }

    if (INTERACTIVE) {
        window.mousePressed = function () {
            paintAt(mouseX, mouseY, 3);
        };
        window.mouseDragged = function () {
            paintAt(mouseX, mouseY, 2);
        };
        // Touch equivalents — p5 maps touches[0] onto mouseX/mouseY.
        window.touchStarted = function () {
            paintAt(mouseX, mouseY, 3);
        };
        window.touchMoved = function () {
            paintAt(mouseX, mouseY, 2);
        };
    }

    function stepGeneration() {
        var newCells = [];
        for (var i = 0; i < ROWS; i++) {
            newCells[i] = [];
            for (var j = 0; j < COLS; j++) {
                newCells[i][j] = stepGameOfLife(j, i);
            }
        }
        cells = newCells;
    }

    window.draw = function () {
        refreshThemeColors();

        // Advance the simulation on its own (slow) cadence.
        sinceStep += deltaTime;
        if (sinceStep >= STEP_MS) {
            stepGeneration();
            sinceStep -= STEP_MS;
            if (sinceStep >= STEP_MS) sinceStep = 0; // recover from long stalls
        }

        // Ease each cell's opacity toward its target every frame.
        var k = Math.min(1, deltaTime / FADE_MS);

        clear();
        background(BG_COLOR);

        for (var i = 0; i < ROWS; i++) {
            for (var j = 0; j < COLS; j++) {
                var target = cells[i][j];
                var d = disp[i][j] + (target - disp[i][j]) * k;
                disp[i][j] = d;
                if (d > 0.01) {
                    fill(cr, cg, cb, ca * d);
                    renderCell(j, i);
                }
            }
        }
    };

    function renderCell(x, y) {
        if (SHAPE === "circle") {
            circle(x * CELL_SIZE + CELL_SIZE / 2, y * CELL_SIZE + CELL_SIZE / 2, CELL_SIZE);
        } else {
            square(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
        }
    }

    function getCell(x, y) {
        if (x == -1) x = COLS - 1;
        if (x == COLS) x = 0;
        if (y == -1) y = ROWS - 1;
        if (y == ROWS) y = 0;
        return cells[y][x];
    }

    function stepGameOfLife(x, y) {
        var n =
            getCell(x - 1, y - 1) +
            getCell(x, y - 1) +
            getCell(x + 1, y - 1) +
            getCell(x - 1, y) +
            getCell(x + 1, y) +
            getCell(x - 1, y + 1) +
            getCell(x, y + 1) +
            getCell(x + 1, y + 1);
        var alive = cells[y][x];
        if (alive == 1 && n < 2) return 0;
        if (alive == 1 && (n == 2 || n == 3)) return 1;
        if (alive == 1 && n > 3) return 0;
        if (alive == 0 && n == 3) return 1;
        return 0;
    }
})();
