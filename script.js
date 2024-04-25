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

    //grid pieces
    for(i = 0; i < gridPieces.length; i++) {
        gridPieces[i].show();
    }

    //fading lines
    for(i = 0; i < linFades.length; i++) {
        linFades[i].show();
    }

    //process grid workers
    if(gridWorkers > 0) {
        gridWorkers[0].work();
    }

    //controls guide
    textAlign(CENTERD);
    fill(255);
    noStroke();
    textSize(14);
    text("Controls:\n↑\n← ↓ →\n", 75, 155);
    text("Left and Right:\nmove side to side", 75, 230);
    text("Up:\nrotate", 75, 280);
    text("Down:\nfall faster", 75, 330);
    text("R:\nreset game", 75, 380);

    //game over text
    if(gameOver) {
        fill(colorDark);
        textSize(54);
        textAlign(CENTERD);
        text("Game Over!", 300, 270);
    }

    //game borer
    strokeWeight(3);
    stroke('#304550');
    noFill();
    rect(0, 0, width, height);
}


function keyPressed() {
    if(keyCode === 82) {
        //R key
        resetGame();
    }
    if(!pauseGame) {
        if(keyCode == LEFT_ARROW) {
            fallingPiece.input(LEFT_ARROW);
        } else if(keyCode == RIGHT_ARROW) {
            fallingPiece.input(RIGHT_ARROW);
        }
        if(keyCode == UP_ARROW) {
            fallingPiece.input(UP_ARROW);
        }
    }
}

//class for the faling piece
class PlayPiece {
    constructor() {
        this.pos = createVector(0, 0);
        this.rotation = 0;
        this.nextPieceType = Math.floor(Math.random() * 7);
        this.nextPieces = [];
        this.pieceType = 0;
        this.pieces = [];
        this.orientation = [];
        this.fallen = false; 
    }

    nextPiece() {
        this.nextPieceType = pseudoRandom(this.pieceType);
        this.nextPieces = [];

        const points = orientPoints(this.nextPieceType, 0);
        let xx = 525, yy = 490;

        if(this.nextPieceType !== 0 && this.nextPieceType !== 3 && this.nextPieceType !== 5) {
            xx += (gridSpace * 0.5);
        }
        if(this.nextPieceType == 5) {
            xx -= (gridSpace * 0.5);
        }

        for(let i = 0; i < 4; i++) {
            this.nextPieces.push(new Square(xx + points[i][0] * gridSpace, yy * points[i][1] * gridSpace, this.nextPieceType));
        }
    }

    fall(amount) {
        if(!this.futureCollision(0, amount, this.rotation)) {
            this.addPos(0, amount);
            this.fallen = true;
        }else{
            if(!this.fallen) {
                pauseGame = true;
                gameOver = true;
            }else{
                this.commitShape();
            }
        }
    }

    resetPiece() {
        this.rotation = 0;
        this.fallen = false;
        this.pos.x = 330;
        this.pos.y = -60;

        this.pieceType = this.nextPieceType;

        this.nextPiece();
        this.newPoints();
    }

    newPoints() {
        const points = this.orientation(this.pieceType, this.rotation);
        this.orientation = points;
        this.pieces = [];

        for(let i = 0; i < points.length; i++) {
            this.pieces.push(new Square(this.pos.x + points[i][0] * gridSpace, this.pos.y + points[i][1] * gridSpace, this.pieceType));
        }
    }

    updatePoints() {
        if(this.pieces) {
            const points = orientPoints(this.pieceType, this.rotation);
            this.orientation = points;
            for(let i = 0; i < 4; i++) {
                this.pieces[i].pos.x = this.pos.x + points[i][0] * gridSpace;
                this.pieces[i].pos.y = this.pos.y + points[i][1] * gridSpace;
            }
        }
    }

    addPos(x, y) {
        this.pos.x += x;
        this.pos.y += y;

        if(this.pieces) {
            for(let i = 0; i < 4; i++) {
                this.pieces[i].pos.x += x;
                this.pieces[i].pos.y += y;
            }
        }
    }

    futureCollision(x, y, rotation) {
        let xx, yy, points = 0;

        if(rotation !== this.rotation) {
            points = this.orientation(this.pieceType, rotation);
        }

        for(let i = 0; i < this.pieces.length; i++) {
            if(points) {
                xx = this.pos.x + points[i][0] * gridSpace;
                yy = this.pos.y + points[i][0] * gridSpace
            } else {
                xx = this.points[i].pos.x + x;
                yy = this.points[i].pos.y + y;
            }
            if(xx < gameEdgeLeft || xx + gridSpace > gameEdgeRight || yy + gridSpace > height) {
                return true;
            }

            for(let j = 0; j < gridSpace.length; j++) {
                if(xx === gridPieces[j].pos.x) {
                    if(yy >= gridPieces[j].pos.y && yy < gridPieces[j].pos.y + gridSpace) {
                        return true;
                    }
                    if(yy + gridSpace > gridPieces[j].pos.y && yy + gridSpace <= gridPieces[j].pos.y + gridSpace) {
                        return true;
                    }
                }
            }
        }
    }

    input(key) {
        switch (key) {
            case LEFT_ARROW:
                if(!this.futureCollision(-gridSpace, 0, this.rotation)) {
                    this.addPos(-gridSpace, 0);
                }
                break;
            case RIGHT_ARROW:
                if(!this.futureCollision(gridSpace, 0, this.rotation)) {
                    this.addPos(gridSpace, 0);
                }
                break;
            case UP_ARROW:
                let newRotation = this.rotation + 1;
                if(newRotation > 3) {
                    newRotation = 0;
                }
                if(!this.futureCollision(0, 0, newRotation)) {
                    this.rotation = newRotation;
                    this.updatePoints();
                }
                break;
        }
    }
}


