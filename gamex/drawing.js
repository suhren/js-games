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


var playerAnimations = null;
var ballAnimations = null;
var playerExplodeAnimation = null;

export function init(document) {
    documentCanvas = document.getElementById("gameCanvas");
    documentCtx = documentCanvas.getContext("2d");
    documentCanvas.width = cfg.WINDOW_WIDTH;
    documentCanvas.height = cfg.WINDOW_HEIGHT;
    canvas = document.createElement("canvas");
    canvas.id = "bufferCanvas"
    ctx = canvas.getContext("2d");
    canvas.width = cfg.WINDOW_WIDTH;
    canvas.height = cfg.WINDOW_HEIGHT;
}


var drawColliders = false;
var drawDebug = false;
var drawGrid = false;
var cameraX = 0;
var cameraY = 0;
var cameraLagX = 0.25;
var cameraLagY = 0.25;

export function toggleDebug() {
    drawDebug = !drawDebug;
    drawGrid = !drawGrid;
    drawColliders = !drawColliders;
    return drawDebug;
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
    let x = Math.floor(w2sX(rect.x));
    let y = Math.floor(w2sY(rect.y));
    let w = Math.floor(w2sS(rect.w));
    let h = Math.floor(w2sS(rect.h));
    return new utils.Rectangle(x, y, w, h);
}

function getScreenCircle(circle) {
    let x = Math.floor(w2sX(circle.c.x));
    let y = Math.floor(w2sY(circle.c.y));
    let r = Math.floor(w2sS(circle.r));
    return new utils.Circle(new utils.Vector(x, y), r);
}

function getScreenVector(vector) {
    let x = Math.floor(w2sX(vector.x));
    let y = Math.floor(w2sY(vector.y));
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

function drawRotatedImage(image, rect, rot) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    var rect = getScreenRect(rect);
    var center = rect.center();
    ctx.translate(center.x, center.y);
    ctx.rotate(rot);
    ctx.translate(-center.x, -center.y);
    ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
}


function drawParticles(particles) {
    for (let i = 0; i < particles.length; i++) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        let p = particles[i];
        var rect = getScreenRect(p.rect);
        var center = rect.center();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.translate(center.x, center.y);
        ctx.rotate(p.rot);
        ctx.translate(-center.x, -center.y);
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
    // Reset transformation matrix to the identity matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1.0;
}


function drawText(text, x, y, size, textBaseline="middle", textAlign="center", dropShadow=true) {
    ctx.font = `${size}px GameFont`;
    ctx.textBaseline = textBaseline;
    ctx.textAlign = textAlign;
    
    if (dropShadow) {
        ctx.fillStyle = "black";
        ctx.fillText(text, x + 4, y + 4);
    }
    ctx.fillStyle = "white";
    ctx.fillText(text, x, y);
}

function drawDropShadow(rect, color="#222222", alpha=0.3, xScale=1.0, yScale=0.2) {

    let radiusX = (rect.w * xScale) / 2;
    let radiusY = (rect.h * yScale) / 2;

    let x = rect.x + rect.w / 2;
    let y = rect.y + rect.h;

    let oldAlpha = ctx.globalAlpha;
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = oldAlpha;
}


export class Renderer {
    constructor(obj) {
        this.obj = obj;
    }

    update(dT) {
        return;
    }

    draw(obj) {
        return;
    }
}


export class CoinRenderer extends Renderer {
    constructor(obj, tile) {
        super(obj);
        this.tile = tile;
    }

    update(dT) {
        if (!this.obj.collected) {
            this.tile.update(dT);
        }
    }

    draw() {
        if (!this.obj.collected) {
            var rect = getScreenRect(this.obj.rect);
            drawDropShadow(rect);
            let image = this.tile.getImage()
            ctx.drawImage(image, rect.x, rect.y, rect.w, rect.h);

            if (drawColliders) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = "red";
                let circle = getScreenCircle(this.obj.circ);
                ctx.beginPath();
                ctx.arc(circle.c.x, circle.c.y, circle.r, 0, Math.PI * 2, false);
                ctx.stroke();
            }
        }
    }
}

export class ExplosionRenderer extends Renderer {
    constructor(obj) {
        super(obj);
        this.animation = new Animation(assets.SPRITESHEET_PLAYER_EXPLODE, 20, 64, false, false);
    }

    update(dT) {
        if (!this.obj.collected) {
            this.animation.update(dT);
        }
    }

    draw() {
        var rect = getScreenRect(this.obj.rect);
        this.animation.drawImage(ctx, rect.x, rect.y, rect.w, rect.h);
    }
}



export class DoorRenderer extends Renderer {
    constructor(obj, image) {
        super(obj);
        this.image = image;
    }

    draw() {
        if (!this.obj.open) {
            let rect = getScreenRect(this.obj.rect);
            ctx.drawImage(this.image, rect.x, rect.y, rect.w, rect.h);
        }
    }
}

export class KeyRenderer extends Renderer {
    constructor(obj, image) {
        super(obj);
        this.image = image;
    }

    draw() {
        if (!this.obj.collected) {
            let rect = getScreenRect(this.obj.rect);
            ctx.drawImage(this.image, rect.x, rect.y, rect.w, rect.h);
        }
    }
}

export class SpikeRenderer extends Renderer {
    constructor(obj, image) {
        super(obj);
        this.image = image;
    }

    draw() {
        let rect = getScreenRect(this.obj.rect);
        ctx.drawImage(this.image, rect.x, rect.y, rect.w, rect.h);
    }
}


export class CheckpointRenderer extends Renderer {
    constructor(obj) {
        super(obj);
    }

    draw() {
        let rect = getScreenRect(this.obj.rect);
        ctx.lineWidth = 3;

        if (this.obj.active) {
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
}


export class GoalRenderer extends Renderer {
    constructor(obj) {
        super(obj);
    }

    draw() {
        var rect = getScreenRect(this.obj.rect);
        ctx.lineWidth = 3;
        if (this.obj.activated) {
            ctx.strokeStyle = "#7FFF00";
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = "#7FFF00";
            ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
            ctx.globalAlpha = 1;
        }
        else if (this.obj.unlocked) {
            ctx.strokeStyle = "#228B22";
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
        }
    }
}

export class TextRenderer extends Renderer {
    constructor(obj) {
        super(obj);
    }

    draw() {
        let center = getScreenVector(this.obj.rect.center());
        drawText(this.obj.text, center.x, center.y, w2sS(this.obj.pixelsize), "middle", "center", true);
    }
}



export class BallRenderer extends Renderer {
    constructor(obj, tile, type) {
        super(obj);
        this.tile = tile;
        this.type = type;
    }

    update(dT) {
        this.tile.update(dT);
    }

    draw() {
        if (drawDebug) {
            if (this.type == "circle") {
                var x = w2sX(this.obj.center.x);
                var y = w2sY(this.obj.center.y);
                var r = w2sS(this.obj.radius);
                ctx.lineWidth = 3;
                ctx.strokeStyle = "#CCC";
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2, false);
                ctx.arc(x, y, 2, 0, Math.PI * 2, false);
                ctx.strokeStyle = "#CCC";
                ctx.stroke();
            }
            else if (this.type === "line") {
                var p1 = getScreenVector(this.obj.p1);
                var p2 = getScreenVector(this.obj.p2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#CCC"; 
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
        if (drawColliders) {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.beginPath();
            let circle = getScreenCircle(this.obj.circ);
            ctx.arc(circle.c.x, circle.c.y, circle.r, 0, Math.PI * 2, false);
            ctx.stroke();
        }
        var rect = getScreenRect(this.obj.rect);
        drawDropShadow(rect);
        ctx.drawImage(this.tile.getImage(), rect.x, rect.y, rect.w, rect.h);
    }
}


export class Animation {
    constructor(image, frameWidth, fps, loop=true, randomStartFrame=false, callback=null) {
        this.image = image;
        this.timer = 0;
        this.duration = 1 / fps;
        this.loop = loop;
        this.active = true;
        this.frameWidth = frameWidth;
        this.height = image.height;
        this.numFrames = Math.floor(image.width / this.frameWidth);
        this.index = randomStartFrame ? utils.randomInt(0, this.numFrames) : 0;
        this.callback = callback;
    }

    update(dT) {
        if (this.active) {       
            this.timer += dT;
            if (this.timer >= this.duration) {
                this.index += 1;
                if (this.index >= this.numFrames) {
                    if (this.loop) {
                        this.index = 0;
                    }
                    else {
                        this.active = false;
                    }
                    if (this.callback != null) {
                        this.callback();
                    } 
                }
                this.timer = 0;
            }
        }
    }

    drawImage(c, x, y, w, h) {
        c.drawImage(this.image, this.index * this.frameWidth, 0, this.frameWidth, this.height, x, y, w, h);
    }
}


export class PlayerRenderer extends Renderer {
    constructor(obj) {
        super(obj);
        this.aRunLeft = new Animation(assets.SPRITESHEET_PLAYER_RUN_LEFT, 16, 6),
        this.aRunRight = new Animation(assets.SPRITESHEET_PLAYER_RUN_RIGHT, 16, 6),
        this.aIdleLeft = new Animation(assets.SPRITESHEET_PLAYER_IDLE_LEFT, 16, 1),
        this.aIdleRight = new Animation(assets.SPRITESHEET_PLAYER_IDLE_RIGHT, 16, 1),
        this.aDashLeft = new Animation(assets.SPRITESHEET_PLAYER_DASH_LEFT, 16, 1),
        this.aDashRight = new Animation(assets.SPRITESHEET_PLAYER_DASH_RIGHT, 16, 1),
        this.aSpirit = new Animation(assets.SPRITESHEET_PLAYER_SPIRIT, 16, 6),
        this.aCurrent = this.aIdleLeft;
        this.aLast = this.aCurrent;
        this.lastWish  = new utils.Vector(0, 1);
        this.lastWishHorizontal  = 1
        this.lastWishVertical  = 1
    }

    update(dT) {
        
        this.aCurrent.update(dT);

        if (!this.obj.alive) {
            this.aCurrent = this.aSpirit;
        }
        else if (this.obj.wish.length() > 0) {
            // The player is trying to move   
            if (this.obj.wish.x != 0) {
                this.lastWishHorizontal = this.obj.wish.x
            }
            if (this.obj.wish.y != 0) {
                this.lastWishVertical = this.obj.wish.y
            }
            if (this.lastWishHorizontal == 1) {
                if (this.obj.isDashing) {
                    this.aCurrent = this.aDashRight;
                }
                else {
                    this.aCurrent = this.aRunRight;
                }
            }
            else if (this.lastWishHorizontal == -1) {
                if (this.obj.isDashing) {
                    this.aCurrent = this.aDashLeft;
                }
                else {
                    this.aCurrent = this.aRunLeft;
                }
            }
            this.lastWish = this.obj.wish.copy();
        }
        else {
            // The player is not trying to move
            // Idle in the last direciton the player tried to move
            if (this.lastWishHorizontal == 1) {
                this.aCurrent = this.aIdleRight;
            }
            else if (this.lastWishHorizontal == -1) {
                this.aCurrent = this.aIdleLeft;
            }
        }
        if (this.aLast != this.aCurrent) {
            this.aCurrent.timer = 0;
            this.aCurrent.índex = 0;
        }
        this.aLast = this.aCurrent;
    }

    draw() {
        drawParticles(this.obj.dashParticleEmitter.particles);
        drawParticles(this.obj.spiritParticleEmitter.particles);
        var rect = this.obj.rect.copy();
        rect.y -= (20 - rect.h);
        rect.h = 20;
        rect = getScreenRect(rect);
        drawDropShadow(rect);
        this.aCurrent.drawImage(ctx, rect.x, rect.y, rect.w, rect.h)

        if (drawDebug) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            let x = w2sX(cfg.TILE_SIZE * this.obj.col0);
            let y = w2sY(cfg.TILE_SIZE * this.obj.row0);
            let w = w2sS(cfg.TILE_SIZE * (this.obj.col1 - this.obj.col0));
            let h = w2sS(cfg.TILE_SIZE * (this.obj.row1 - this.obj.row0));
            ctx.strokeRect(x, y, w, h);

            var rect = getScreenRect(this.obj.rect);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "red";
            strokeVector(rect.center(), this.obj.vel.max(w2sS(64)));
            ctx.strokeStyle = "blue";
            strokeVector(rect.center(), this.obj.wish.setLength(w2sS(32)));            
        }
        
        if (drawColliders) {
            let rect = getScreenRect(this.obj.getCollisionRectangle());
            let circ = getScreenCircle(this.obj.getCollisionCircle());
            ctx.lineWidth = 2;
            ctx.strokeStyle = "red";
            ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
            ctx.beginPath();
            ctx.arc(circ.c.x, circ.c.y, circ.r, 0, Math.PI * 2, false);
            ctx.stroke();
        }

    }
}

export function draw(dT, level, menu) {

    let player = level.player;
    var playerPos = player.rect.center();

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
    ctx.fillStyle = level.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Tile Map
    for (let row = 0; row < level.nrows; row++) {
        for (let col = 0; col < level.ncols; col++) {
            let tile = level.tileMap[row][col];
            if (tile != null) {
                let x = w2sX(col * cfg.TILE_SIZE);
                let y = w2sY(row * cfg.TILE_SIZE);
                let s = w2sS(cfg.TILE_SIZE);
                ctx.drawImage(level.tileMap[row][col].getImage(), x, y, s, s);
            }
        }
    }

    // Draw grid
    if (drawGrid)
        strokeGrid(level);

    // Draw game objects
    for (let i = 0; i < level.objects.length; i++) {
        let renderer = level.objects[i].renderer;
        if (renderer != null) {
            renderer.draw();
        }
    }
    
    // Draw player dash cooldown
    let t = player.isDashAvailable ? 1 : player.dashCooldownTimer / cfg.PLAYER_DASH_COOLDOWN;
    ctx.fillStyle = "#555555";
    ctx.fillRect(16, 16, 150, 20);
    ctx.fillStyle = "#DAA520";
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, t * 150, 20);
    ctx.fillRect(16, 16, t * 150, 20);
    ctx.strokeStyle = "#000000";
    ctx.strokeRect(16, 16, 150, 20);
    
    // Draw keys
    for (let i = 0; i < player.keys.length; i++) {
        ctx.drawImage(player.keys[i].renderer.image, 180 + i * 45, 16, 32, 32);
    }
    
    // Draw coins
    if (level.num_coins > 0) {
        drawText(`Coins: ${level.num_coins - level.coins.length}/${level.num_coins}`, 16, 60, 20, "middle", "left", true);
    }

    // Draw spikes
    for (let i = 0; i < level.spikes.length; i++) {
        level.spikes[i].renderer.draw();
    }

    // Draw menu
    if (menu.active) {
        ctx.fillStyle = "black";
        ctx.fillRect(menu.x, menu.y, menu.w, menu.h);
        
        for (let i = 0; i < menu.buttons.length; i++) {
            drawButton(menu.x, menu.y, menu.buttons[i]);
        }
    }

    // Draw player position and other debug information
    if (drawDebug) {
        // Draw status text
        ctx.font = "12px GameFont";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.textAlign = "left";
        
        let txt = level.path;
        ctx.strokeText(txt, 8, 20);
        ctx.fillText(txt, 8, 20);

        txt = level.name + ": " + level.desciption;
        ctx.strokeText(txt, 8, 40);
        ctx.fillText(txt, 8, 40);
        
        txt = `player: ${player.pos.x.toFixed(2)} ${player.pos.y.toFixed(2)} ${player.vel.x.toFixed(2)} ${player.vel.y.toFixed(2)} ${player.vel.length().toFixed(2)} ${player.friction.toFixed(2)} ${player.dashCooldownTimer.toFixed(2)} ${player.isDashing}`;
        ctx.strokeText(txt, 8, 60);
        ctx.fillText(txt, 8, 60);

        txt = `Level objects: ${level.objects.length}`;
        ctx.strokeText(txt, 8, 80);
        ctx.fillText(txt, 8, 80);

        txt = `FPS: ${(1/dT).toFixed(2)}`;
        ctx.strokeText(txt, 8, 100);
        ctx.fillText(txt, 8, 100);

        txt = "Press 'x' to toggle debug mode";
        ctx.strokeText(txt, 8, 120);
        ctx.fillText(txt, 8, 120);
    }

    // Draw level name and description card
    if (level.showCard) {
        ctx.font = "32px GameFont";
        ctx.textBaseline = 'middle';
        ctx.textAlign = "center";
        if (level.name != null) {
            ctx.fillStyle = "black";
            ctx.fillText(level.name, canvas.width / 2, canvas.height / 2 - 16);
            ctx.fillStyle = "white";
            ctx.fillText(level.name, canvas.width / 2 - 4, canvas.height / 2 - 16 - 4);
        }
        if (level.desciption != null) {
            ctx.fillStyle = "black";
            ctx.fillText(level.desciption, canvas.width / 2, canvas.height / 2 + 16);
            ctx.fillStyle = "white";
            ctx.fillText(level.desciption, canvas.width / 2 - 4, canvas.height / 2 + 16 - 4);
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
    else {
        ctx.lineWidth = 2;
    }

    ctx.font = "bold 15px GameFont";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(button.text, x + button.w / 2, y + button.h / 2);
}