import * as go from "./objects.js";
import * as utils from "./utils.js";
import * as cfg from "./config.js";
import * as assets from "./assets.js";
import * as drawing from "./drawing.js";
import * as inter from "./interface.js";


var audio = document.getElementById("sounds");
var canvas = document.getElementById("gameCanvas")


// Entry point of program
window.onload = function() {
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    canvas.addEventListener("click", click);
    canvas.addEventListener("mousemove", mousemove);
    init();
}


var player = new go.Player();
var level;
var levelIndex = 0;
var changingLevel = false;
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
    // shift key (16)
    if (e.keyCode == 16) {
        player.sneaking = true;
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
    // shift key (16)
    if (e.keyCode == 16) {
        player.sneaking = false;
    }
}


function buttonResume() {
    menu.active = false;
}


function restart() {
    loadLevel(assets.loadLevelFromIndex(levelIndex));
    menu.active = false;
}

function nextLevel() {
    levelIndex = (levelIndex + 1) % assets.NUM_LEVELS;
    loadLevel(assets.loadLevelFromIndex(levelIndex));
    menu.active = false;
    changingLevel = false;
}

function prevLevel() {
    levelIndex = (levelIndex > 0) ? levelIndex - 1 : assets.NUM_LEVELS - 1;
    loadLevel(assets.loadLevelFromIndex(levelIndex));
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


function init() {
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
    // Wait for level JSONs to load (avoid null references)
    setTimeout(assets.init, 200);
    setTimeout(drawing.init, 1000, document);
    setTimeout(start, 1000);
}


function start() {
    levelIndex = 0;
    loadLevel(assets.loadLevelFromIndex(levelIndex));
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
    lvl.setPlayer(player);
    if (lvl.goal != null) {
        lvl.goal.activated = false;
    }
    if (player.activeCheckpoint != null) {
        player.activeCheckpoint.active = false;
        player.activeCheckpoint = null;   
    }
    level = lvl;
    player.pos = level.playerStart.copy();
    player.pos.x -= player.w / 2;
    player.pos.y -= player.h / 2;
    player.start = level.playerStart.copy();
    player.keys = [];
}


function update(dT) {
    
    level.update(dT);
    
    if (!changingLevel && level.goal.activated) {
        changingLevel = true;
        setTimeout(nextLevel, 1000);
    }
}