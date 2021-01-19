import * as go from "./objects.js";
import {Vector, Rectangle, solve, clamp, rectIntersect, rectCircleInterset} from "./utils.js";
import * as cfg from "./config.js";
import * as assets from "./assets.js";
import * as drawing from "./drawing.js";
import * as inter from "./interface.js";


var audio = document.getElementById("sounds");
var canvas = document.getElementById("canvas")


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


var player = new go.Player(new Vector(128, 128));
var level;
var levelIndex = 0;

var menu = null;


function mousemove(e) {
    menu.hover(e.offsetX, e.offsetY);
}


function click(e) {
    menu.click(e.offsetX, e.offsetY);
}

var spaceDown = false;

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
    // space key (32)
    if (e.keyCode == 32) {
        if (!spaceDown) {
            player.dash();
        }
        spaceDown = true;
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
        toggleDebug();
    }
    // m key (77)
    if (e.keyCode == 77) {
        toggleMusic();
    }
    // r key (82)
    if (e.keyCode == 82) {
        restart();
    }
    // ESC key (27)
    if (e.keyCode == 27) {
        menu.active = !menu.active;
    }
    // c key (67)
    if (e.keyCode == 67) {
        prevLevel();
    }
    // v key (86)
    if (e.keyCode == 86) {
        nextLevel();
    }
    // space key (32)
    if (e.keyCode == 32) {
        spaceDown = false;
    }
}


function buttonResume() {
    menu.active = false;
}


function restart() {
    loadLevel(assets.LEVELS[levelIndex]);
    menu.active = false;
}

var debugButton;
var musicButton;

function toggleDebug() {
    let debug = drawing.toggleDebug();
    debugButton.text = debug ? "x: Debug: ON" : "x: Debug: OFF";
}


function toggleMusic() {
    if(audio.paused){
        audio.play();
        musicButton.text = "m: Music: ON";
    } else {
        audio.pause();
        musicButton.text = "m: Music: OFF";
    }
}


function nextLevel() {
    levelIndex = (levelIndex + 1) % assets.LEVELS.length;
    loadLevel(assets.LEVELS[levelIndex]);
    menu.active = false;
}

function prevLevel() {
    levelIndex = (levelIndex > 0) ? levelIndex - 1 : assets.LEVELS.length - 1;
    loadLevel(assets.LEVELS[levelIndex]);
    menu.active = false;
}

function init() {
    drawing.init(document);
    menu = new inter.Menu();
    menu.x = (canvas.width - menu.w) / 2;
    menu.y = (canvas.height - menu.h) / 2;

    musicButton = new inter.Button("m: Music: OFF", toggleMusic, 0, 0, 200, 32);
    debugButton = new inter.Button("x: Debug: OFF", toggleDebug, 0, 0, 200, 32);

    let buttons = [
        new inter.Button("Resume", buttonResume, 0, 0, 200, 32),
        new inter.Button("r: Restart", restart, 0, 0, 200, 32),
        debugButton,
        musicButton,
        new inter.Button("c: Prev level", nextLevel, 0, 0, 200, 32),
        new inter.Button("v: Next level", prevLevel, 0, 0, 200, 32),
    ];

    menu.init(buttons);

    assets.loadAllLevels();
    levelIndex = 0;
    loadLevel(assets.LEVELS[levelIndex]);
    // Set up to call the function "gameLoop" 60 times/second
    setInterval(gameLoop, 1000 / cfg.FPS);
}


var lastLoopTime = new Date();
var dT = 0;

function gameLoop() {
    // ms -> s
    dT = (new Date() - lastLoopTime) / 1000;
    update(dT);
    lastLoopTime = new Date();
    drawing.draw(dT, level, player, menu);

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
    
    // Update player
    player.update(level, dT);
    
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
        setTimeout(nextLevel, 1000);
        
    }
    
    // Check death ball collisions
    for (let i = 0; i < level.deathBalls.length; i++) {
        let ball = level.deathBalls[i];
        ball.update(dT);
        if (rectCircleInterset(player.getCollisionRectangle(), ball.getCircle())) {
            player.respawn();
        }
    }
}