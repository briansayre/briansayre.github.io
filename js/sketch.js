var ROWS = 0;
var COLS = 0;
var CELL_SIZE = 15;
var BG_COLOR;
var CELL_COLOR;
var cells = [];
var canvas;
var leftPressed = false;

function mouseClicked() {
    if (mouseButton === LEFT) {
        leftPressed = true;
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    setup();
}

function setup() {
    ROWS = Math.ceil(windowHeight / CELL_SIZE);
    COLS = Math.ceil(windowWidth / CELL_SIZE);
    BG_COLOR = color(245, 245, 247);
    CELL_COLOR = color(100, 100, 100, 6);

    var canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.zIndex = -1;

    frameRate(5);
    strokeWeight(0);

    for (var i = 0; i < ROWS; i++) {
        cells[i] = [];
        for (var j = 0; j < COLS; j++) {
            cells[i][j] = int(random(0, 5)) == 0;
        }
    }
}

function draw() {
    if (leftPressed) {
        leftPressed = false;
    }
    
    var newCells = [];
    for (var i = 0; i < ROWS; i++) {
        newCells[i] = [];
        for (var j = 0; j < COLS; j++) {
            newCells[i][j] = stepGameOfLife(j, i);
        }
    }
    
    clear();
    background(BG_COLOR);
    
    cells = newCells;
    for (var i = 0; i < ROWS; i++) {
        for (var j = 0; j < COLS; j++) {
            fill(CELL_COLOR);
            if (cells[i][j] == 1) renderCell(j, i);
        }
    }    
}

function renderCell(x, y) {
    // circle(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);  
    square(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE);
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