var ROWS = 0;
var COLS = 0;
var CELL_SIZE = 15;
var BG_COLOR;
var CELL_COLOR;
var PREV_CELL_COLOR;
var cells = [];
var prevCells = [];
var canvas;
var leftPressed = false;

function mouseClicked() {
    if (mouseButton === LEFT) {
        leftPressed = true;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function setup() {
    ROWS = Math.ceil(windowHeight / CELL_SIZE);
    COLS = Math.ceil(windowWidth / CELL_SIZE);
    BG_COLOR = color(54, 54, 54);
    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas");
    frameRate(10);
    strokeWeight(0);
    background(BG_COLOR);
    for (var i = 0; i < ROWS; i++) {
        cells[i] = [];
        for (var j = 0; j < COLS; j++) {
            cells[i][j] = int(random(0, 5)) == 0;
        }
    }
    fill(calcFill(j * CELL_SIZE, i * CELL_SIZE, 0));
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            if (cells[i][j] == 1) circle(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE);
        }
    }
}

function draw() {
    if (leftPressed) {
        leftPressed = false;
        setup();
    }
    clear();
    background(BG_COLOR);
    var newCells = [];
    for (var i = 0; i < ROWS; i++) {
        newCells[i] = [];
        for (var j = 0; j < COLS; j++) {
            newCells[i][j] = stepGameOfLife(j, i);
        }
    }
    prevCells = cells;
    cells = newCells;
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            fill(calcFill(j * CELL_SIZE, i * CELL_SIZE, 8));
            if (prevCells[i][j] == 1) circle(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE);
            fill(calcFill(j * CELL_SIZE, i * CELL_SIZE, 0));
            if (cells[i][j] == 1) circle(j * CELL_SIZE, i * CELL_SIZE, CELL_SIZE);
        }
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
    var liveNeighbors = getCell(x - 1, y - 1) + getCell(x, y - 1) + getCell(x + 1, y - 1);
    liveNeighbors += getCell(x - 1, y) + getCell(x + 1, y);
    liveNeighbors += getCell(x - 1, y + 1) + getCell(x, y + 1) + getCell(x + 1, y + 1);
    var alive = cells[y][x];
    if (alive == 1 && liveNeighbors < 2) return 0;
    if (alive == 1 && (liveNeighbors == 2 || liveNeighbors == 3)) return 1;
    if (alive == 1 && liveNeighbors > 3) return 0;
    if (alive == 0 && liveNeighbors == 3) return 1;
    return 0;
}

function calcFill(x, y, prev) {
    if (inRange(x, mouseX, 30) && inRange(y, mouseY, 30)) return color(0, 0, 0, 40 - prev);
    if (inRange(x, mouseX, 50) && inRange(y, mouseY, 50)) return color(0, 0, 0, 30 - prev);
    if (inRange(x, mouseX, 100) && inRange(y, mouseY, 100)) return color(0, 0, 0, 25 - prev);
    return color(0, 0, 0, 15 - prev);
}

function inRange(a, b, r) {
    return Math.abs(a - b) <= r;
}
