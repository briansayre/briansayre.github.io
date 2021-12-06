
const WIDTH = 2000;
const HEIGHT = 500;
const ROWS = HEIGHT/10;
const COLS = WIDTH/10;
const CELL_SIZE = 10;
var BG_COLOR;
var CELL_COLOR;
var cells = [];
var canvas;
var refreshImg;
var pauseImg;
var playImg;
var paused;

function preload() {
  refreshImg = loadImage('images/refresh.png');
  pauseImg = loadImage('images/pause.png');
  playImg = loadImage('images/play.png');
}

function windowResized() {
  var clientHeight = document.getElementById('header').clientHeight;
	var clientWidth = document.getElementById('header').clientWidth;
  resizeCanvas(clientWidth, clientHeight);
}

function setup() {
  paused = 0;
  var clientHeight = document.getElementById('header').clientHeight;
	var clientWidth = document.getElementById('header').clientWidth;
  var canvas = createCanvas(clientWidth, clientHeight);
	canvas.parent("header");
  BG_COLOR = color(238, 240, 241, 60);
  CELL_COLOR = color(72, 95, 199, 20);
  frameRate(5);
  strokeWeight(2);
  background(BG_COLOR);
  stroke(CELL_COLOR);
  for (var i = 0; i < ROWS; i++) {
    cells[i] = [];
    for (var j = 0; j < COLS; j++) {
      cells[i][j] = int(random(0, 5)) == 0;
    }
  }
  fill(CELL_COLOR);
  for (var i = 0; i < ROWS; i++) {
    for (var j = 0; j < COLS; j++) {
      if (cells[i][j] == 1) rect(j*CELL_SIZE, i*CELL_SIZE, CELL_SIZE, CELL_SIZE);
    }
  }
  image(refreshImg, 0, 0, 20, 20);
}

function draw() {
  if (!paused) {
    clear();
    background(BG_COLOR);
    var newCells = [];
    for (var i = 0; i < ROWS; i++) {
      newCells[i] = [];
      for (var j = 0; j < COLS; j++) {
        newCells[i][j] = stepGameOfLife(j, i);
      }
    }
    cells = newCells;
    for (var i = 0; i < ROWS; i++) {
      for (var j = 0; j < COLS; j++) {
        if (cells[i][j] == 1) rect(j*CELL_SIZE, i*CELL_SIZE, CELL_SIZE);
      }
    }
    image(refreshImg, 5, 5, 12, 12);
    image(pauseImg, 22, 2, 14, 16);
  } else {
    clear();
    background(BG_COLOR);
    for (var i = 0; i < ROWS; i++) {
      for (var j = 0; j < COLS; j++) {
        if (cells[i][j] == 1) rect(j*CELL_SIZE, i*CELL_SIZE, CELL_SIZE);
      }
    }
    image(refreshImg, 5, 5, 12, 12);
    image(playImg, 22, 2, 14, 16);
  }

}


function getCell(x, y) {
  if (x == -1) x = COLS-1;
  if (x == COLS) x = 0;
  if (y == -1) y = ROWS-1;
  if (y == ROWS) y = 0;
  return cells[y][x];
}

function stepGameOfLife(x, y) {
  var liveNeighbors = getCell(x-1, y-1) + getCell(x, y-1) + getCell(x+1, y-1);
  liveNeighbors += getCell(x-1, y) + getCell(x+1, y);
  liveNeighbors += getCell(x-1, y+1) + getCell(x, y+1) + getCell(x+1, y+1);
  var alive = cells[y][x];
  if (alive == 1 && liveNeighbors < 2) return 0;
  if (alive == 1 && (liveNeighbors == 2 || liveNeighbors == 3)) return 1;
  if (alive == 1 && liveNeighbors > 3) return 0;
  if (alive == 0 && liveNeighbors == 3) return 1;
  return 0;
}

function mouseClicked() {
  if (mouseX < 20 && mouseY < 20) {
    for (var i = 0; i < ROWS; i++) {
      cells[i] = [];
      for (var j = 0; j < COLS; j++) {
        cells[i][j] = int(random(0, 5)) == 0;
      }
    }
  }
  if (mouseX > 20 && mouseX < 40 && mouseY < 20) {
    paused = !paused;
  }
}