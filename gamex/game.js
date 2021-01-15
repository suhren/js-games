import {Player, DeathBallCircle, DeathBallLinear, Checkpoint, Goal, Level, TILE_SIZE} from "./objects.js";
import {Vector, Rectangle, solve, clamp, rectIntersect, rectCircleInterset} from "./utils.js";
import * as assets from "./assets.js";

var fps = 240;

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
    // Call the init function before the loop
    init();
}

var drawColliders = true;
var drawDebug = true;
var drawGrid = false;

var player = new Player(new Vector(128, 128));
var level;
var levelIndex = 0;

var levelChanging =  false;


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
    // x key (88)
    if (e.keyCode == 88) {
        drawDebug = !drawDebug;
        drawColliders = !drawColliders;
    }
}


function init() {
    assets.loadAllLevels();
    levelIndex = 0;
    loadLevel(assets.LEVELS[levelIndex]);
    // Set up to call the function "gameLoop" 60 times/second
    setInterval(gameLoop, 1000 / fps);
}

var startTime, endTime;


var lastLoopTime = new Date();
var dT = 0;

function gameLoop() {
    // ms -> s
    dT = (new Date() - lastLoopTime) / 1000;
    update(dT);
    lastLoopTime = new Date();
    draw();

}


function changeLevel() {
    levelChanging = true;
    levelIndex = (levelIndex + 1) % assets.LEVELS.length;
    loadLevel(assets.LEVELS[levelIndex])
    levelChanging = false;
}


function loadLevel(lvl) {
    lvl.goal.activated = false;
    if (player.activeCheckpoint != null) {
        player.activeCheckpoint.active = false;
        player.activeCheckpoint = null;   
    }
    level = lvl;
    ctx.canvas.width = level.width;
    ctx.canvas.height = level.height;
    player.pos = level.playerStart.copy();
    player.pos.x -= player.width / 2;
    player.pos.y -= player.height / 2;
    player.start = level.playerStart.copy();
}


function update(dT) {
    
    if (levelChanging)
        return

    // Update player movement
    player.updateMovement(level, dT);
    
    // Check collisions
    for (let row = player.row0; row < player.row1; row++) {
        for (let col = player.col0; col < player.col1; col++) {
            if (level.tileMap[row][col].collision) {
                let tileRect = new Rectangle(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                let collide = rectIntersect(player.getRectangle(), tileRect);
                if (collide) {
                    solve(player, tileRect);
                }
            }
        }
    }
    

    // Check checkpoints
    for (let i = 0; i < level.checkpoints.length; i++) {
        let cp = level.checkpoints[i];
        if (rectIntersect(player.getRectangle(), cp.getRectangle())) {
            if (!cp.active) {
                cp.active = true;
                player.activeCheckpoint = cp;
                for (let j = 0; j < level.checkpoints.length; j++) {
                    level.checkpoints[j].active = (i == j);
                }
            }
        }
    }

    if (!level.goal.activated && rectIntersect(player.getRectangle(), level.goal.getRectangle())) {
        level.goal.activated = true;
        setTimeout(changeLevel, 1000);
        
    }
    
    // Check death ball collisions
    for (let i = 0; i < level.deathBalls.length; i++) {
        let ball = level.deathBalls[i];
        ball.update(dT);
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

    for (let i = 0; i < level.ncols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, level.height);
        ctx.stroke();
    }

    for (let i = 0; i < level.nrows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(level.width, i * TILE_SIZE);
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

    // Draw Tile Map
    ctx.fillStyle = "black";
    for (let row = 0; row < level.nrows; row++) {
        for (let col = 0; col < level.ncols; col++) {
            ctx.drawImage(level.tileMap[row][col].image, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    // Intersecting tiles
    if (drawDebug) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(player.col0 * TILE_SIZE,
                       player.row0 * TILE_SIZE,
                       TILE_SIZE * (player.col1 - player.col0),
                       TILE_SIZE * (player.row1 - player.row0));
    }

    // Draw Checkpoints
    for (let i = 0; i < level.checkpoints.length; i++) {
        let checkpoint = level.checkpoints[i];
        checkpoint.draw(ctx);
    }

    // Draw goal
    level.goal.draw(ctx);

    // Draw death ball circles outline
    for (let i = 0; i < level.deathBalls.length; i++) {
        let ball = level.deathBalls[i];

        let circle = ball.getCircle()
        let rect = ball.getRectangle()

        if (drawDebug) {
            ctx.lineWidth = 2;
            ball.drawMovement(ctx)
        }

        if (drawColliders) {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(circle.c.x, circle.c.y, circle.r, 0, Math.PI * 2, false);
            ctx.strokeStyle = "red";
            ctx.stroke();
        }

        ctx.drawImage(assets.SPRITE_BALL, rect.x, rect.y, rect.w, rect.h);
    }

    //Draw player
    ctx.drawImage(assets.SPRITE_PLAYER, player.pos.x, player.pos.y, player.width, player.height);

    //Draw texts
    for (let i = 0; i < level.texts.length; i++) {
        let text = level.texts[i];
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.font = `bold ${text.pixelsize * TILE_SIZE / 16}px Courier`;

        ctx.textAlign = "center";
        let center = text.rectangle.center();
        ctx.strokeText(text.text, center.x, center.y);
        ctx.fillText(text.text, center.x, center.y);
    }
    

    // Draw player position and other debug information
    if (drawDebug) {
        // Draw status text
        ctx.font = "bold 15px Courier";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.textAlign = "left";
        
        let txt = level.name;
        ctx.strokeText(txt, 8, 20);
        ctx.fillText(txt, 8, 20);

        txt = `player: ${player.pos.x.toFixed(2)} ${player.pos.y.toFixed(2)} ${player.vel.x.toFixed(2)} ${player.vel.y.toFixed(2)} ${player.vel.length().toFixed(2)} ${player.friction.toFixed(2)}`;
        ctx.strokeText(txt, 8, 40);
        ctx.fillText(txt, 8, 40);

        txt = `FPS: ${(1/dT).toFixed(2)}`;
        ctx.strokeText(txt, 8, 60);
        ctx.fillText(txt, 8, 60);

        // Draw movement vectors
        ctx.lineWidth = 3;
        ctx.strokeStyle = "red";
        strokeVector(player.getRectangle().center(), player.vel.max(128));
        ctx.strokeStyle = "blue";
        strokeVector(player.getRectangle().center(), player.wish.setLength(50));
    }

    //Draw bounding boxes
    if (drawColliders) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.strokeRect(player.pos.x, player.pos.y, player.width, player.height);
    }
}