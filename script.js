const gridSpace = 30;

let fallingPiece;
let gridPieces = [];
let linFades = [];
let gridWorkers = [];

let currentScore = 0;
let currentLevel = 0;
let linesCleared = 0;

let ticks = 0;
let updateEvery = 15;
let updateEveryCurrent = 15;
let fallSpeed = gridSpace * 0.5;
let pauseGame = false;
let gameOver = false;

const gameEdgeLeft = 150;
const gameEdgeRight = 450;

//pieces color
const colors = [
    '#dca3ff',
    '#ff90a0',
    '#80ffb4',
    '#ff7666',
    '#70b3f5',
    '#b2e77d',
    '#ffd700',
];

function setup() {
    creatCanvas(600, 450);

    fallingPiece = new playPiece();
    fallingPiece.resetPiece();

    textFont('ubuntu');
}


function draw() {
    const colorDark = '#0d0d0d';
    const colorLight = '#304550';
    const backgroundColor = '#e1eeb0';

    backgound(backgroundColor);

    //right side
    fill(25);
    noStroke();
    rect(gameEdgeRight, 0, 150, height);

    //left side
    rect(0, 0, gameEdgeLeft, height);

    //score rect
    fill(backgroundColor);
    rect(450, 80, 150, 70);

    //next piece
    rect(460, 405, 130, 130, 5, 5);
    
    //level
    rect(460, 210, 130, 60, 5, 5);

    //lines
    rect(480, 280, 130, 60, 5, 5);

    //score lines
    fill(colorLight);
    rect(450, 85, 150, 20);
    rect(450, 110, 150, 4);
    rect(450, 140, 150, 4);

    //score banner
    fill(backgroundColor);
    rect(460, 60, 130, 35, 5, 5);

    //score banner inner rect
    strokeWeight(3);
    noFill();
    stroke();
    rect(465, 65, 120, 25, 5, 5);

    //next piece inner rect
    stroke(colorLight);
    rect(456, 410, 120, 120, 5, 5);

    //level inner rect
    rect(465, 215, 120, 50, 5, 5);

    //line inner rect
    rect(465, 285, 120, 50, 5, 5);

    //info lables
    fill(25);
    noStroke();
    textSize(24);
    textAlign(CENTERD);
    text("Score", 525, 85);
    text("Level", 525, 238);
    text("Lines", 525, 308);

    //the actual info
    textSize(24);
    textAlign(RIGHT);
    text(currentScore, 560, 135);
    text(currentLevel, 560, 260);
    text(linesCleared, 560, 330);

    //game border
    stroke(colorDark);
    line(gameEdgeRight, 0, gameEdgeRight, height);

    //falling piece
    fallingPiece.show();

    //falling piece when arrow is pressed
    if (keyIsDown(DOWN_ARROW)) {
        updateEvery = 2;
    } else {
        updateEvery = updateEveryCurrent;
    }

    //update the game state
    if (!pauseGame) {
        ticks++;
        if(ticks >= updateEvery) {
            ticks = 0;
            fallingPiece.fall(fallSpeed);
        }
    }
}
