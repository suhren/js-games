import * as go from "./objects.js";
import * as utils from "./utils.js";
import * as cfg from "./config.js";
import * as assets from "./assets.js";


// The actual canvas in the document
var documentCanvas = null;
var documentCtx = null;

// The buffer canvas which will the copied to the document canvas
var canvas = null;
var ctx = null;


export function init(document) {
    documentCanvas = document.getElementById("canvas");
    documentCtx = documentCanvas.getContext("2d");
    documentCanvas.width = cfg.WINDOW_WIDTH;
    documentCanvas.height = cfg.WINDOW_HEIGHT;
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
    canvas.width = cfg.WINDOW_WIDTH;
    canvas.height = cfg.WINDOW_HEIGHT;
}


var drawColliders = true;
var drawDebug = true;
var drawGrid = true;


var cameraX = 0;
var cameraY = 0;
var cameraLagX = 0.25;
var cameraLagY = 0.25;

export function toggleDebug() {
    drawDebug = !drawDebug;
    drawGrid = !drawGrid;
    drawColliders = !drawColliders;
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


function s2wS(v) {
    return cfg.TILE_SIZE * v / cfg.WINDOW_TILE_SIZE;
}

function w2sS(v) {
    return cfg.WINDOW_TILE_SIZE * v / cfg.TILE_SIZE;
}

function w2sX(x) {
    return w2sS(x - cameraX) + canvas.width / 2;
}

function w2sY(y) {
    return w2sS(y - cameraY)  + canvas.height / 2;
}


function getScreenRect(rect) {
    let x = w2sX(rect.x);
    let y = w2sY(rect.y);
    let w = w2sS(rect.w);
    let h = w2sS(rect.h);
    return new utils.Rectangle(x, y, w, h);
}

function getScreenCircle(circle) {
    let x = w2sX(circle.c.x);
    let y = w2sY(circle.c.y);
    let r = w2sS(circle.r);
    return new utils.Circle(new utils.Vector(x, y), r);
}

function getScreenVector(vector) {
    let x = w2sX(vector.x);
    let y = w2sY(vector.y);
    return new utils.Vector(x, y);
}


function strokeGrid(level) {
    
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#aaaaaa";

    // Draw vertical lines
    for (let i = 0; i < level.ncols; i++) {
        ctx.beginPath();
        let x = w2sX(i * cfg.TILE_SIZE);
        let y0 = w2sY(0);
        let y1 = w2sY(level.height);
        ctx.moveTo(x, y0);
        ctx.lineTo(x, y1);
        ctx.stroke();
    }
    // Draw horizontal lines

    for (let i = 0; i < level.nrows; i++) {
        ctx.beginPath();
        let y = w2sY(i * cfg.TILE_SIZE);
        let x0 = w2sX(0);
        let x1 = w2sX(level.width);
        ctx.moveTo(x0, y);
        ctx.lineTo(x1, y);
        ctx.stroke();
    }
}


export function draw(dT, level, player, menu) {

    var playerPos = player.getRectangle().center();

    // The camera should only follow the player if the screen-space distance
    // between the current camera distance and the player is greater than
    // the camera lag (ratio) times half the screen size
    // Player in center -> lag = 0.0
    // Player at edge of screen -> lag = 1.0

    let screenDistX = w2sS(playerPos.x - cameraX);
    let screenLagX = Math.abs(screenDistX) / (canvas.width / 2);
    // Check the maximum allowed camera screen distance
    if (screenLagX > cameraLagX) {
        let allowedScreenDistX = Math.sign(screenDistX) * cameraLagX * (canvas.width / 2);
        let cameraMoveX = screenDistX - allowedScreenDistX;
        cameraX += cameraMoveX * 0.1;
    }
    

    let screenDistY = w2sS(playerPos.y - cameraY);
    let screenLagY = Math.abs(screenDistY) / (canvas.height / 2);
    // Check the maximum allowed camera screen distance
    if (screenLagY > cameraLagY) {
        let allowedScreenDistY = Math.sign(screenDistY) * cameraLagY * (canvas.height / 2);
        let cameraMoveY = screenDistY - allowedScreenDistY;
        cameraY += cameraMoveY * 0.1;
    }
    
    // If the level is smaller than the canvas, center it
    if (w2sS(level.width) <= canvas.width) {
        cameraX = level.width / 2;
    } 
    // Otherwise, clamp the camera range to not go beyond the level
    else {
        cameraX = utils.clamp(cameraX, s2wS(canvas.width / 2), level.width - s2wS(canvas.width / 2));
    }
    if (w2sS(level.height) <= canvas.height) {
        cameraY = level.height / 2;
    } 
    else {
        cameraY = utils.clamp(cameraY, s2wS(canvas.height / 2), level.height - s2wS(canvas.height / 2));
    }


    
    ctx.imageSmoothingEnabled = false;
    
    // (Clear) draw background color on the entire screen
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Tile Map
    ctx.fillStyle = "black";
    for (let row = 0; row < level.nrows; row++) {
        for (let col = 0; col < level.ncols; col++) {
            let x = w2sX(col * cfg.TILE_SIZE);
            let y = w2sY(row * cfg.TILE_SIZE);
            let s = w2sS(cfg.TILE_SIZE);
            ctx.drawImage(level.tileMap[row][col].image, x, y, s, s);
        }
    }

    // Draw grid
    if (drawGrid)
        strokeGrid(level);

    // Intersecting tiles
    if (drawDebug) {
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        let x = w2sX(cfg.TILE_SIZE * player.col0);
        let y = w2sY(cfg.TILE_SIZE * player.row0);
        let w = w2sS(cfg.TILE_SIZE * (player.col1 - player.col0));
        let h = w2sS(cfg.TILE_SIZE * (player.row1 - player.row0));
        ctx.strokeRect(x, y, w, h);
    }

    // Draw Checkpoints
    for (let i = 0; i < level.checkpoints.length; i++) {
        let checkpoint = level.checkpoints[i];
        
        let rect = getScreenRect(checkpoint.getRectangle());
        ctx.lineWidth = 3;

        if (checkpoint.active) {
            ctx.strokeStyle = "#FFD700";
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "#FFD700";
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            ctx.globalAlpha = 1;
        }
        else {
            ctx.strokeStyle = "#DAA520";
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        }

    }

    // Draw goal
    var rect = getScreenRect(level.goal.getRectangle());
    ctx.lineWidth = 3;
    if (level.goal.activated) {
        ctx.strokeStyle = "#7FFF00";
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "#7FFF00";
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
        ctx.globalAlpha = 1;
    }
    else {
        ctx.strokeStyle = "#228B22";
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }

    // Draw death ball circles outline
    for (let i = 0; i < level.deathBalls.length; i++) {
        let ball = level.deathBalls[i];

        if (drawDebug) {

            if (ball instanceof go.DeathBallCircle) {

                var x = w2sX(ball.center.x);
                var y = w2sY(ball.center.y);
                var r = w2sS(ball.radius);
                
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2, false);
                ctx.strokeStyle = "#CCC";
                ctx.stroke();
        
                ctx.beginPath();
                ctx.arc(x, y, 2, 0, Math.PI * 2, false);
                ctx.strokeStyle = "#CCC";
                ctx.stroke();
            }

            if (ball instanceof go.DeathBallLinear) {

                var p1 = getScreenVector(ball.p1);
                var p2 = getScreenVector(ball.p2);

                ctx.strokeStyle = "#CCC"; 
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }

        if (drawColliders) {
            ctx.lineWidth = 2;
            ctx.beginPath();
            let circle = getScreenCircle(ball.getCircle());
            ctx.arc(circle.c.x, circle.c.y, circle.r, 0, Math.PI * 2, false);
            ctx.strokeStyle = "red";
            ctx.stroke();
        }

        var rect = getScreenRect(ball.getRectangle());
        ctx.drawImage(assets.SPRITE_BALL, rect.x, rect.y, rect.w, rect.h);
    }

    //Draw player
    var rect = getScreenRect(player.getRectangle());
    ctx.drawImage(assets.SPRITE_PLAYER, rect.x, rect.y, rect.w, rect.h);

    //Draw texts
    for (let i = 0; i < level.texts.length; i++) {
        let text = level.texts[i];
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.font = `bold ${w2sS(text.pixelsize)}px Courier`;

        ctx.textAlign = "center";
        let center = getScreenVector(text.rectangle.center());
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

        txt = "Press 'x' to toggle debug mode";
        ctx.strokeText(txt, 8, 80);
        ctx.fillText(txt, 8, 80);

        // Draw movement vectors
        var rect = getScreenRect(player.getRectangle());
        ctx.lineWidth = 3;
        ctx.strokeStyle = "red";
        strokeVector(rect.center(), player.vel.max(w2sS(64)));
        ctx.strokeStyle = "blue";
        strokeVector(rect.center(), player.wish.setLength(w2sS(32)));
    }

    //Draw bounding boxes
    if (drawColliders) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = "red";
        ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    }


    // Draw menu

    if (menu.active) {
        ctx.fillStyle = "black";
        ctx.fillRect(menu.x, menu.y, menu.w, menu.h);
        
        for (let i = 0; i < menu.buttons.length; i++) {
            drawButton(menu.x, menu.y, menu.buttons[i]);
        }
    }

    // Render the buffer canvas onto the document canvas
    documentCtx.drawImage(canvas, 0, 0);
}

function drawButton(x0, y0, button) {
    ctx.fillStyle = "red";
    let x = x0 + button.x;
    let y = y0 + button.y;
    ctx.fillRect(x, y, button.w, button.h);

    if (button.hover) {
        ctx.strokeStyle = "green";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, button.w, button.h);
    }

    ctx.font = "bold 15px Courier";
    ctx.fillStyle = "white";
    ctx.strokeStyle = "black";
    ctx.textAlign = "center";
    ctx.strokeText(button.text, x + button.w / 2, y + button.h / 2);
    ctx.fillText(button.text, x + button.w / 2, y + button.h / 2);
}