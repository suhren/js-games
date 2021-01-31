import * as go from "./objects.js";
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


// Major game states
const states = {
    LOADING: "loading",
    SPLASH_SCREEN: "splash_screen",
    RUNNING: "running",
    LEVEL_CHANGE: "level_change",
    END_SCREEN: "end_screen",
    END_SCREEN_TIMEOUT: "end_screen_timeout"
};
var state = states.LOADING; 

// Flag true used in RUNNING state to indicate level change
var changingLevel = false;

var player = null;
var level;
var levelIndex = 0;
var menu = null;
var spaceDown = false;

var debugButton;
var musicButton;

// Keeep track of various time-related variables
var startTime = 0;
var levelTime = 0;
let totalTime = 0;
var lastLoopTime = new Date();
var dT = 0;


function mousemove(e) {
    if (state == states.RUNNING) {
        menu.hover(e.offsetX, e.offsetY);
    }
}


function click(e) {
    if (state == states.RUNNING) {
        menu.click(e.offsetX, e.offsetY);
    }
}


function keyDown(e) {
    if (state == states.SPLASH_SCREEN) {
        start();
    }
    else if (state == states.RUNNING) {
        // Up arrow (38) or w (87)
        if (e.keyCode == 38 || e.keyCode == 87) {
            player.wish.y = -1;
        }
        // Down arrow (40) or s (83)
        else if (e.keyCode == 40 || e.keyCode == 83) {
            player.wish.y = 1;
        }
        // Left arrow (37) or a (65)
        else if (e.keyCode == 37 || e.keyCode == 65) {
            player.wish.x = -1;
        }
        // Right arrow (39) or d (68)
        else if (e.keyCode == 39 || e.keyCode == 68) {
            player.wish.x = 1;
        }
        // space key (32)
        else if (e.keyCode == 32) {
            if (!spaceDown) {
                player.dash();
            }
            spaceDown = true;
        }
        // shift key (16)
        else if (e.keyCode == 16) {
            player.sneaking = true;
        }
    }
    else if (state == states.END_SCREEN) {
        state = states.END_SCREEN_TIMEOUT;
        setTimeout(showSplashScreen, 1000);
    }
}

function keyUp(e) {
    if (state == states.RUNNING) {
        // Up arrow
        if (e.keyCode == 38 || e.keyCode == 87) {
            if (player.wish.y < 0) {
                player.wish.y = 0;
            }
        }
        // Down arrow
        else if (e.keyCode == 40 || e.keyCode == 83) {
            if (player.wish.y > 0) {
                player.wish.y = 0;
            }
        }
        // Left arrow
        else if (e.keyCode == 37 || e.keyCode == 65) {
            if (player.wish.x < 0) {
                player.wish.x = 0;
            }
        }
        // Right arrow
        else if (e.keyCode == 39 || e.keyCode == 68) {
            if (player.wish.x > 0) {
                player.wish.x = 0;
            }
        }
        // x key (88)
        else if (e.keyCode == 88) {
            toggleDebug();
        }
        // m key (77)
        else if (e.keyCode == 77) {
            toggleMusic();
        }
        // r key (82)
        else if (e.keyCode == 82) {
            restart();
        }
        // ESC key (27)
        else if (e.keyCode == 27) {
            menu.active = !menu.active;
        }
        // c key (67)
        else if (e.keyCode == 67) {
            prevLevel();
        }
        // v key (86)
        else if (e.keyCode == 86) {
            nextLevel();
        }
        // space key (32)
        else if (e.keyCode == 32) {
            spaceDown = false;
        }
        // shift key (16)
        else if (e.keyCode == 16) {
            player.sneaking = false;
        }
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

function showEndScreen() {
    state = states.END_SCREEN;
    totalTime = new Date(new Date() - startTime);
    changingLevel = false;
}

function prevLevel() {
    levelIndex = (levelIndex > 0) ? levelIndex - 1 : assets.NUM_LEVELS - 1;
    loadLevel(assets.loadLevelFromIndex(levelIndex));
    menu.active = false;
}

function toggleDebug() {
    let debug = drawing.toggleDebug();
    debugButton.text = debug ? "x: Debug: ON" : "x: Debug: OFF";
    player.invincible = debug;
}

function toggleMusic() {
    setMusicEnabled(assets.GAME_AUDIO.paused);
}

function setMusicEnabled(enabled) {
    if (enabled) {
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

    // Wait for assets to load (avoid null references)
    await assets.init();

    menu = new inter.Menu();
    musicButton = new inter.Button("m: Music: OFF", toggleMusic, 0, 0, 250, 32);
    debugButton = new inter.Button("x: Debug: OFF", toggleDebug, 0, 0, 250, 32);
    let buttons = [
        new inter.Button("Resume", buttonResume, 0, 0, 250, 32),
        new inter.Button("r: Restart level", restart, 0, 0, 250, 32),
        debugButton,
        musicButton,
        new inter.Button("c: Prev level", prevLevel, 0, 0, 250, 32),
        new inter.Button("v: Next level", nextLevel, 0, 0, 250, 32),
        new inter.Button("Restart game", start, 0, 0, 250, 32),
    ];
    menu.init(buttons);
    menu.x = (canvas.width - menu.w) / 2;
    menu.y = (canvas.height - menu.h) / 2;
    
    levelIndex = 0;
    showSplashScreen();
    setInterval(gameLoop, 1000 / cfg.FPS);
}

function showSplashScreen() {
    state = states.SPLASH_SCREEN;
    setMusicEnabled(false);
    assets.GAME_AUDIO.currentTime = 0;
}


function start() {
    levelIndex = 0;
    player = new go.Player();
    loadLevel(assets.loadLevelFromIndex(levelIndex));
    startTime = new Date();
    menu.active = false;
    state = states.RUNNING;
    setMusicEnabled(true);
}

function gameLoop() {
    if (state == states.RUNNING) {
        let currentTime = new Date();
        levelTime = new Date(currentTime - startTime);
        dT = (currentTime - lastLoopTime) / 1000;
        update(dT);
        lastLoopTime = new Date();
        if (level != null) {
            drawing.draw(dT, level, menu, levelTime);
        }
    }
    else if (state == states.SPLASH_SCREEN) {
        drawing.drawSplashScreen();
        return;
    }
    else if (state == states.END_SCREEN || state == states.END_SCREEN_TIMEOUT) {
        drawing.drawEndScreen(totalTime, player.numDeaths);
        return;
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
    player.alive = true;
    player.spiritParticleEmitter.active = false;
}


function update(dT) {
    if (level != null) {
        level.update(dT);
        if (!changingLevel && level.goal.activated) {
            changingLevel = true;
            if (levelIndex < assets.NUM_LEVELS - 1) {
                setTimeout(nextLevel, 1000);
            }
            else {
                setTimeout(showEndScreen, 1000);
            }
            
        }
    }
}