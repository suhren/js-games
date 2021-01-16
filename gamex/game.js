import {Player, DeathBallCircle, DeathBallLinear, Checkpoint, Goal, Level} from "./objects.js";
import {Vector, Rectangle, solve, clamp, rectIntersect, rectCircleInterset} from "./utils.js";
import * as cfg from "./config.js";
import * as assets from "./assets.js";
import * as drawing from "./drawing.js";
import * as inter from "./interface.js";

var button = document.getElementById("play");
var audio = document.getElementById("sounds");
var canvas = document.getElementById("canvas")

button.addEventListener("click", function(){
    if(audio.paused){
        audio.play();
        button.innerHTML = "■";
    } else {
        audio.pause();
        button.innerHTML = "►";
    }
});


// Entry point of program
window.onload = function() {
    // Set up a listener to call the function "keyDown" when a key is pressed down
    document.addEventListener("keydown", keyDown);
    // Set up a listener to call the function "keyUp" when a key is let go
    document.addEventListener("keyup", keyUp);
    // Mouse click event for the canvas element
    canvas.addEventListener("click", click);
    // Mouse move event for the canvas element
    canvas.addEventListener("mousemove", mousemove);
    // Call the init function before the loop
    init();
}


var player = new Player(new Vector(128, 128));
var level;
var levelIndex = 0;

var menu = null;


function mousemove(e) {
    menu.hover(e.offsetX, e.offsetY);
}


function click(e) {
    menu.click(e.offsetX, e.offsetY);
}


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
        drawing.toggleDebug();
    }
    // ESC key (27)
    if (e.keyCode == 27) {
        menu.active = !menu.active;
    }
}


function buttonResume() {
    menu.active = false;
}


function buttonRestart() {
    player.respawn();
    menu.active = false;
}

function buttonDebug() {
    drawing.toggleDebug();
}


function init() {
    drawing.init(document);
    menu = new inter.Menu();
    menu.x = (canvas.width - menu.w) / 2;
    menu.y = (canvas.height - menu.h) / 2;

    let buttons = [
        new inter.Button("Resume", buttonResume, 0, 0, 200, 50),
        new inter.Button("Restart", buttonRestart, 0, 150, 200, 50),
        new inter.Button("Toggle Debug", buttonDebug, 0, 150, 200, 50)
    ];

    menu.init(buttons);

    assets.loadAllLevels();
    levelIndex = 0;
    loadLevel(assets.LEVELS[levelIndex]);
    // Set up to call the function "gameLoop" 60 times/second
    setInterval(gameLoop, 1000 / cfg.FPS);
}

var startTime, endTime;


var lastLoopTime = new Date();
var dT = 0;

function gameLoop() {
    // ms -> s
    dT = (new Date() - lastLoopTime) / 1000;
    update(dT);
    lastLoopTime = new Date();
    drawing.draw(dT, level, player, menu);

}


function changeLevel() {
    levelIndex = (levelIndex + 1) % assets.LEVELS.length;
    loadLevel(assets.LEVELS[levelIndex])
}


function loadLevel(lvl) {
    lvl.goal.activated = false;
    if (player.activeCheckpoint != null) {
        player.activeCheckpoint.active = false;
        player.activeCheckpoint = null;   
    }
    level = lvl;
    player.pos = level.playerStart.copy();
    player.pos.x -= player.width / 2;
    player.pos.y -= player.height / 2;
    player.start = level.playerStart.copy();
}


function update(dT) {
    
    // Update player movement
    player.updateMovement(level, dT);
    
    // Check collisions
    for (let row = player.row0; row < player.row1; row++) {
        for (let col = player.col0; col < player.col1; col++) {
            if (level.tileMap[row][col].collision) {
                let tileRect = new Rectangle(col * cfg.TILE_SIZE,
                                             row * cfg.TILE_SIZE,
                                             cfg.TILE_SIZE,
                                             cfg.TILE_SIZE);

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