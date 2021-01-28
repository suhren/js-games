import * as go from "./objects.js";
import * as utils from "./utils.js";
import * as cfg from "./config.js";
import * as assets from "./assets.js";
import * as drawing from "./drawing.js";
import * as inter from "./interface.js";

var canvas = document.getElementById("gameCanvas")


// Entry point of program
window.onload = function() {
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);
    canvas.addEventListener("click", click);
    canvas.addEventListener("mousemove", mousemove);
    // Force the game font to load first
    // Will only load the first time it is used otherwise.
    // https://hacks.mozilla.org/2016/06/webfont-preloading-for-html5-games/
    document.fonts.load('10px GameFont');
    document.fonts.ready.then(() => init());
}


var player = null;
var level;
var levelIndex = 0;
var changingLevel = false;
var menu = null;
var started = false;
var initialized = false;


function mousemove(e) {
    menu.hover(e.offsetX, e.offsetY);
}


function click(e) {
    menu.click(e.offsetX, e.offsetY);
}

var spaceDown = false;

function keyDown(e) {
    if (!initialized) {
        return;
    }
    if (showSplashScreen) {
        start();
    }
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
    if (!started) {
        return;
    }
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
    if(assets.GAME_AUDIO.paused){
        assets.GAME_AUDIO.play();
        musicButton.text = "m: Music: ON";
    } else {
        assets.GAME_AUDIO.pause();
        musicButton.text = "m: Music: OFF";
    }
}


async function init() {
    drawing.init(document);
    drawing.drawLoadingScreen();

    menu = new inter.Menu();

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
    await assets.init();

    menu.x = (canvas.width - menu.w) / 2;
    menu.y = (canvas.height - menu.h) / 2;
    
    initialized = true;
    setInterval(gameLoop, 1000 / cfg.FPS);
}

function start() {
    levelIndex = 0;
    player = new go.Player();
    loadLevel(assets.loadLevelFromIndex(levelIndex));
    // Set up to call the function "gameLoop" 60 times/second
    started = true;
    startTime = new Date();
    showSplashScreen = false;
}


var startTime = 0;
var elapsedTime = 0;
var lastLoopTime = new Date();
var dT = 0;
var showSplashScreen = true;

function gameLoop() {
    // ms -> s
    let currentTime = new Date();
    elapsedTime = new Date(currentTime - startTime);
    dT = (currentTime - lastLoopTime) / 1000;
    update(dT);
    lastLoopTime = new Date();
    if (level != null) {
        drawing.draw(dT, level, menu, elapsedTime);
    }
    if (showSplashScreen) {
        drawing.drawSplashScreen();
    }
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
    player.coinsSinceLastCheckpoint = new Array();
}


function update(dT) {
    if (level != null) {
        level.update(dT);
        if (!changingLevel && level.goal.activated) {
            changingLevel = true;
            setTimeout(nextLevel, 1000);
        }
    }
}