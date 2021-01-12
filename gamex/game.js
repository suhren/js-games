import {Player, DeathBallCircle, DeathBallLinear, Checkpoint} from './objects.js';
import {Vector, Rectangle, solve, clamp, rectIntersect, rectCircleInterset} from './utils.js';


var button = document.getElementById("play");
var audio = document.getElementById("sounds")

button.addEventListener("click", function(){
    if(audio.paused){
        audio.play();
        button.innerHTML = "■";
    } else {
        audio.pause();
        button.innerHTML = "►";
    }
});


var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

// Entry point of program
window.onload = function() {
    // Set up a listener to call the function "keyDown" when a key is pressed down
    document.addEventListener("keydown", keyDown);
    // Set up a listener to call the function "keyUp" when a key is let go
    document.addEventListener("keyup", keyUp);
    // Set up to call the function "gameLoop" 60 times/second
    setInterval(gameLoop, 1000/60);
}

var TILE_SIZE = 32;
var GAME_ROWS = 16;
var GAME_COLS = 32;

var GAME_WIDTH = GAME_COLS * TILE_SIZE;
var GAME_HEIGHT = GAME_ROWS * TILE_SIZE;

var drawColliders = false;
var drawDebug = false;
var drawGrid = true;

var TILE_MAP = Array(GAME_ROWS).fill(null).map(()=>Array(GAME_COLS).fill(0))
TILE_MAP[10][10] = 1
TILE_MAP[10][11] = 1

for (let row = 0; row < GAME_ROWS; row++) {
    TILE_MAP[row][0] = 1
    TILE_MAP[row][GAME_COLS-1] = 1
}
for (let col = 0; col < GAME_COLS; col++) {
    TILE_MAP[0][col] = 1
    TILE_MAP[GAME_ROWS-1][col] = 1
}

//Tile size is bound to the canvas size
ctx.canvas.width = GAME_WIDTH;
ctx.canvas.height = GAME_HEIGHT;

var playerSprite = new Image();
playerSprite.src = "images/Womp3.png";
playerSprite = playerSprite;

var ballSprite= new Image();
ballSprite.src = "images/DeathBot.png"
var wallSprite= new Image();
wallSprite.src = "images/Wall2.png"

var col0 = 0;
var row0 = 0;
var col1 = 0;
var row1 = 0;


function tileRectangleToCoords(x, y, w, h) {
    x = x * TILE_SIZE;
    y = y * TILE_SIZE;
    w = w * TILE_SIZE;
    h = h * TILE_SIZE;
    return  new Rectangle(x, y, w, h);
}


var player = new Player(new Vector(128, 128));

var deathBalls = [
    new DeathBallCircle(new Vector(900, 400), 20),
    new DeathBallCircle(new Vector(400, 200), 150, 0.01),
    new DeathBallCircle(new Vector(600, 400)),
    new DeathBallLinear(new Vector(50, 350), new Vector(300, 350), 0.01)
];

var checkpoints = [
    new Checkpoint(tileRectangleToCoords(1, 1, 1, 1)),
    new Checkpoint(tileRectangleToCoords(20, 3, 2, 2)),
    new Checkpoint(tileRectangleToCoords(23, 12, 3, 2))
];


function keyDown(e) {
    // Up arrow (38) or w (87)
    if (e.keyCode == 38 || e.keyCode == 87) {
        player.wish.y = -1;
    }
    // Down arrow (40) or s (83)
    if (e.keyCode == 40 || e.keyCode == 83) {
        player.wish.y = 1;
    }
    // Left arrow (37) or a (65)
    if (e.keyCode == 37 || e.keyCode == 65) {
        player.wish.x = -1;
    }
    // Right arrow (39) or d (68)
    if (e.keyCode == 39 || e.keyCode == 68) {
        player.wish.x = 1;
    }
}

function keyUp(e) {
    // Up arrow
    if (e.keyCode == 38 || e.keyCode == 87) {
        if (player.wish.y < 0) {
            player.wish.y = 0;
        }
    }
    // Down arrow
    if (e.keyCode == 40 || e.keyCode == 83) {
        if (player.wish.y > 0) {
            player.wish.y = 0;
        }
    }
    // Left arrow
    if (e.keyCode == 37 || e.keyCode == 65) {
        if (player.wish.x < 0) {
            player.wish.x = 0;
        }
    }
    // Right arrow
    if (e.keyCode == 39 || e.keyCode == 68) {
        if (player.wish.x > 0) {
            player.wish.x = 0;
        }
    }
}    


function gameLoop() {
    update();
    draw();
}

function coordToTile(x) {
    return Math.floor(x / TILE_SIZE);
}

function update() {
    
    // Check intersecting tiles
    col0 = coordToTile(player.pos.x) - 1;
    row0 = coordToTile(player.pos.y) - 1;
    col1 = coordToTile(player.pos.x + player.width) + 1;
    row1 = coordToTile(player.pos.y + player.height) + 1;
    col0 = Math.max(col0, 0);
    row0 = Math.max(row0, 0);
    col1 = Math.min(col1, GAME_COLS);
    row1 = Math.min(row1, GAME_ROWS);

    // Update player movement
    let speed = player.vel.length();
    let friction = player.vel.normalize().multiply(-player.friction).limit(speed);
    let acc = player.wish.normalize().multiply(player.acceleration);
    let resultant = acc.add(friction);
    player.vel = player.vel.add(resultant);
    player.vel = player.vel.limit(player.maxSpeed);
    player.pos = player.pos.add(player.vel);

    // Make sure we stay within bounds
    player.pos.x = clamp(player.pos.x, 0, GAME_WIDTH - player.width);
    player.pos.y = clamp(player.pos.y, 0, GAME_HEIGHT - player.height);

    // Check collisions
    for (let row = row0; row < row1; row++) {
        for (let col = col0; col < col1; col++) {
            if (TILE_MAP[row][col] == 1) {
                let tileRect = new Rectangle(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                let collide = rectIntersect(player.getRectangle(), tileRect);
                if (collide) {
                    solve(player, tileRect);
                }
            }
        }
    }

    // Check checkpoints
    for (let i = 0; i < checkpoints.length; i++) {
        let cp = checkpoints[i];
        if (rectIntersect(player.getRectangle(), cp.getRectangle())) {
            if (!cp.active) {
                cp.active = true;
                player.activeCheckpoint = cp;
                for (let j = 0; j < checkpoints.length; j++) {
                    checkpoints[j].active = (i == j);
                }
            }
        }
    }
    
    // Check death ball collisions
    for (let i = 0; i < deathBalls.length; i++) {
        let ball = deathBalls[i];
        ball.update_position();
        if (rectCircleInterset(player.getRectangle(), ball.getCircle())) {
            player.respawn();
        }
    }
}


function strokeLine(v1, v2) {
    ctx.beginPath();
    ctx.moveTo(v1.x, v1.y);
    ctx.lineTo(v2.x, v2.y);
    ctx.stroke();
}

function strokeVector(origin, vector) {
    strokeLine(origin, origin.add(vector));
}


function strokeGrid() {
    
    ctx.strokeStyle = "#ccc";

    for (let i = 0; i < GAME_COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, GAME_HEIGHT);
        ctx.stroke();
    }

    for (let i = 0; i < GAME_ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(GAME_WIDTH, i * TILE_SIZE);
        ctx.stroke();
    }
}


function draw() {
    
    ctx.imageSmoothingEnabled = false;
    
    // (Clear) draw background color on the entire screen
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (drawGrid)
        strokeGrid(ctx);

    // Intersecting tiles
    if (drawDebug) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(col0 * TILE_SIZE, row0 * TILE_SIZE, TILE_SIZE * (col1 - col0), TILE_SIZE * (row1 - row0));
    }

    // Draw Tile Map
    ctx.fillStyle = "black";
    for (let row = 0; row < GAME_ROWS; row++) {
        for (let col = 0; col < GAME_COLS; col++) {
            if (TILE_MAP[row][col] == 1) {
                ctx.drawImage(wallSprite, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Draw Checkpoints
    for (let i = 0; i < checkpoints.length; i++) {
        let checkpoint = checkpoints[i];
        checkpoint.draw(ctx);
    }

    // Draw death ball circles outline
    for (let i = 0; i < deathBalls.length; i++) {
        let ball = deathBalls[i];

        let circle = ball.getCircle()
        let rect = ball.getRectangle()

        if (drawDebug)
            ball.drawMovement(ctx)

        if (drawColliders) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
            ctx.beginPath();
            ctx.arc(circle.c.x, circle.c.y, circle.r, 0, Math.PI * 2, false);
            ctx.strokeStyle = "red";
            ctx.stroke();
        }

        ctx.drawImage(ballSprite, rect.x, rect.y, rect.w, rect.h);
    }

    //Draw player
    ctx.drawImage(playerSprite, player.pos.x, player.pos.y, player.width, player.height);


    // Draw player position and other debug information
    if (drawDebug) {
        // Draw status text
        ctx.font = "bold 18px Courier";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.textAlight = "start";
        ctx.textAlign = "left";
        let txt = `player: ${player.pos.x.toFixed(2)} ${player.pos.y.toFixed(2)} ${player.vel.x.toFixed(2)} ${player.vel.y.toFixed(2)} ${player.vel.length().toFixed(2)}`
        ctx.strokeText(txt, 8, 20);
        ctx.fillText(txt, 8, 20);
        // Draw movement vectors
        ctx.strokeStyle = "red";
        strokeVector(player.getRectangle().center(), player.vel.setLength(100));
        ctx.strokeStyle = "blue";
        strokeVector(player.getRectangle().center(), player.wish.setLength(100));
    }

    //Draw bounding boxes
    if (drawColliders) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(player.pos.x, player.pos.y, player.width, player.height);
    }
}