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
var context = canvas.getContext("2d");

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

var TILE_MAP = Array(GAME_ROWS).fill(null).map(()=>Array(GAME_COLS).fill(0))
TILE_MAP[10][10] = 1
TILE_MAP[10][11] = 1

for (row = 0; row < GAME_ROWS; row++) {
    TILE_MAP[row][0] = 1
    TILE_MAP[row][GAME_COLS-1] = 1
}
for (col = 0; col < GAME_COLS; col++) {
    TILE_MAP[0][col] = 1
    TILE_MAP[GAME_ROWS-1][col] = 1
}

//Tile size is bound to the canvas size
context.canvas.width = GAME_WIDTH;
context.canvas.height = GAME_HEIGHT;

var playerSprite = new Image();
playerSprite.src = "images/Womp3.png";
playerSprite = playerSprite;

var ballSprite= new Image();
ballSprite.src = "images/DeathBot.png"
var wallSprite= new Image();
wallSprite.src = "images/Wall2.png"



function solve(box, epsilon=0) {

    // Moving to the right
    if (player.velX > 0) {
        // Moving down to the right
        if (player.velY > 0) {
            ox = player.x - player.velX 
            oy = player.y - player.velY
            tx = Math.abs((box.x - (ox + player.width)) / player.velX);
            ty = Math.abs((box.y - (oy + player.height)) / player.velY);
            
            // Horizontal collision
            if (tx < ty) {
                player.velX = 0;
                player.x = box.x - player.width - epsilon;
            }
            // Vertical collision
            else {
                player.velY = 0;
                player.y = box.y - player.height - epsilon;
            }
        }
        // Moving up to the right
        else if (player.velY < 0) {
            ox = player.x - player.velX 
            oy = player.y - player.velY
            tx = Math.abs((box.x - (ox + player.width)) / player.velX);
            ty = Math.abs((box.y + box.h - oy) / player.velY);
            
            // Horizontal collision
            if (tx < ty) {
                player.velX = 0;
                player.x = box.x - player.width - epsilon;
            }
            // Vertical collision
            else {
                player.velY = 0;
                player.y = box.y + box.h + epsilon;
            }
        }
        else {
            player.velX = 0;
            player.x = box.x - player.width + epsilon;
        }
    }

    // Moving to the left
    else if (player.velX < 0) {

        // Moving down to the left
        if (player.velY > 0) {
            ox = player.x - player.velX 
            oy = player.y - player.velY
            tx = Math.abs((box.x + box.w - ox) / player.velX);
            ty = Math.abs((box.y - (oy + player.height)) / player.velY);
            
            // Horizontal collision
            if (tx < ty) {
                player.velX = 0;
                player.x = box.x + box.w + epsilon;
            }
            // Vertical collision
            else {
                player.velY = 0;
                player.y = box.y - player.height - epsilon;
            }
        }
        // Moving up to the left
        else if (player.velY < 0) {
            ox = player.x - player.velX 
            oy = player.y - player.velY
            tx = Math.abs((box.x + box.w - ox) / player.velX);
            ty = Math.abs((box.y + box.h - oy) / player.velY);
            
            // Horizontal collision
            if (tx < ty) {
                player.velX = 0;
                player.x = box.x + box.w + epsilon;
            }
            // Vertical collision
            else {
                player.velY = 0;
                player.y = box.y + box.h + epsilon;
            }
        }
        else {
            player.velX = 0;
            player.x = box.x + box.w + epsilon;
        }
    }

    // Not moving horizontally
    else {
        // Moving down
        if (player.velY > 0) {
            player.velY = 0;
            player.y = box.y - player.height - epsilon;
        }
        // Moving up
        else if(player.velY < 0) {
            player.velY = 0;
            player.y = box.y + box.h + epsilon;
        }
    }
}


class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;                
    }
}



class DeathBallCircle {
    
    constructor(centerX, centerY, radius=75, speed=0.08){
        this.size_radius = 32;
        this.radius = radius;
        this.centerX = centerX;
        this.centerY = centerY;
        this.angle = 0;
        this.speed = speed;
    }

    getRectangle() {
        var x = this.centerX + Math.cos(this.angle) * this.radius;  
        var y = this.centerY + Math.sin(this.angle) * this.radius;
        x = x - this.size_radius * 1 / Math.sqrt(2);
        y = y - this.size_radius * 1 / Math.sqrt(2);
        var w = 2 * this.size_radius * 1 / Math.sqrt(2);
        var h = 2 * this.size_radius * 1 / Math.sqrt(2);
        return new Rectangle(x, y, w, h);    
    }

    update_position() {
        this.angle = this.angle + this.speed;
    }

    drawMovement(ctx) {
        ctx.beginPath();
        ctx.arc(x=this.centerX, y=this.centerY, radius=this.radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = "#CCC";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x=this.centerX, y=this.centerY, radius=2, 0, Math.PI * 2, false);
        ctx.strokeStyle = "#CCC";
        ctx.stroke();
    }
}

class DeathBallLinear {

    constructor(startX, startY, enxX, endY, speed=0.08){
        this.size_radius = 32;
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.speed = speed;
        this.t = 0.0; // Between 0.0 and 1.0
        this.vel = 1.0;
        this.dx = this.endX - this.startX;
        this.dy = this.endY - this.startY;
    }

    getRectangle() {

        // If t = 0.0 -> At start point
        // If t = 0.5 -> At middle point
        // If t = 1.0 -> At end point

        var x = this.startX + this.dx * this.t
        var y = this.startY + this.dy * this.t

        x = x - this.size_radius * 1 / Math.sqrt(2);
        y = y - this.size_radius * 1 / Math.sqrt(2);
        var w = 2 * this.size_radius * 1 / Math.sqrt(2);
        var h = 2 * this.size_radius * 1 / Math.sqrt(2);
        
        return new Rectangle(x, y, w, h);    
    }

    update_position() {
        if (this.t <= 0.0) {
            this.vel = this.speed;
        }
        if (this.t > 1.0) {
            this.vel = -this.speed;
        }
        this.t = this.t + this.vel;
    }

    drawMovement(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.startX, this.startY);
        ctx.lineTo(this.endX, this.endY);
        ctx.stroke();
    }
}


class Checkpoint {

    constructor(startX, startY, enxX, endY){
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.active = false;
    }

    getRectangle() {
        var x = this.startX * TILE_SIZE;
        var y = this.startY * TILE_SIZE;
        var w = (this.endX - this.startX) * TILE_SIZE;
        var h = (this.endY - this.startY) * TILE_SIZE;
        return new Rectangle(x, y, w, h);    
    }
    

    draw(ctx) {
        if (this.active) {
            ctx.fillStyle = "lime";
        }
        else {
            ctx.fillStyle = "darkgreen";
        }
        var rect = this.getRectangle();
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
}


// Establish the Player, aka WHAT IS THE PLAYER!?
class Player {
    constructor(startX, startY) {
        this.startX = startX;
        this.startY = startY;
        this.x = startX;
        this.y = startY;
        this.width = 32;
        this.height = 32;
        this.velX = 0;
        this.velY = 0;
        this.wishX = 0;
        this.wishY = 0;
        this.maxSpeed = 4;
        this.acceleration = 1;
        this.friction = 0.5;
        this.activeCheckpoint = null;                 
    }

    respawn() {
        if (this.activeCheckpoint != null) {
            var r = this.activeCheckpoint.getRectangle();
            var centerX = r.x + r.w / 2;
            var centerY = r.y + r.h / 2;
            this.x = centerX - this.width / 2;
            this.y = centerY - this.height / 2;
        }
        else {
            this.x = this.startX;
            this.y = this.startY;
        }
        this.velX = 0;
        this.velY = 0;
    }

    getRectangle() {
        return new Rectangle(this.x, this.y, this.width, this.height);    
    }
}

var player = new Player(startX=128, startY=128);

var deathBalls = [
    new DeathBallCircle(centerX=900, centerY=400, radius=20),
    new DeathBallCircle(centerX=400, centerY=200, radius=150, speed=0.01),
    new DeathBallCircle(centerX=600, centerY=400),
    new DeathBallLinear(startX=50, startY=350, endX=300, endY=350, speed=0.01)
];

var checkpoints = [
    new Checkpoint(startX=1, startY=1, endX=2, endY=2),
    new Checkpoint(startX=20, startY=3, endX=22, endY=5),
    new Checkpoint(startX=23, startY=12, endX=26, endY=14)
];


function drawGrid(ctx) {
    
    ctx.strokeStyle = "#ccc";

    for (i = 0; i < GAME_COLS; i++) {
        ctx.beginPath();
        ctx.moveTo(i * TILE_SIZE, 0);
        ctx.lineTo(i * TILE_SIZE, GAME_HEIGHT);
        ctx.stroke();
    }

    for (i = 0; i < GAME_ROWS; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * TILE_SIZE);
        ctx.lineTo(GAME_WIDTH, i * TILE_SIZE);
        ctx.stroke();
    }
}


//Check how two rectangles (Player & Deathball for example) collide with each other
function intersect(r1, r2) {
    return  (r1.x + r1.w > r2.x && r1.x < r2.x + r2.w &&
             r1.y + r1.h > r2.y && r1.y < r2.y + r2.h)
}

function keyDown(e) {
    // Up arrow (38) or w (87)
    if (e.keyCode == 38 || e.keyCode == 87) {
        player.wishY = -1;
    }
    // Down arrow (40) or s (83)
    if (e.keyCode == 40 || e.keyCode == 83) {
        player.wishY = 1;
    }
    // Left arrow (37) or a (65)
    if (e.keyCode == 37 || e.keyCode == 65) {
        player.wishX = -1;
    }
    // Right arrow (39) or d (68)
    if (e.keyCode == 39 || e.keyCode == 68) {
        player.wishX = 1;
    }
}

function keyUp(e) {
    // Up arrow
    if (e.keyCode == 38 || e.keyCode == 87) {
        if (player.wishY < 0) {
            player.wishY = 0;
        }
    }
    // Down arrow
    if (e.keyCode == 40 || e.keyCode == 83) {
        if (player.wishY > 0) {
            player.wishY = 0;
        }
    }
    // Left arrow
    if (e.keyCode == 37 || e.keyCode == 65) {
        if (player.wishX < 0) {
            player.wishX = 0;
        }
    }
    // Right arrow
    if (e.keyCode == 39 || e.keyCode == 68) {
        if (player.wishX > 0) {
            player.wishX = 0;
        }
    }
}    


function gameLoop() {
    //posX = posX + 1;
    context.imageSmoothingEnabled = false;
    
    // Update deathball positions
    for (i = 0; i < deathBalls.length; i++) {
        deathBalls[i].update_position();
    }

    // (Clear) draw background color on the entire screen
    context.fillStyle = "#fff";
    context.fillRect(x=0, y=0, width=canvas.width, height=canvas.height);

    drawGrid(context);

    // Check intersecting tiles
    var col0 = Math.floor(player.x / TILE_SIZE) - 1;
    var row0 = Math.floor(player.y / TILE_SIZE) - 1;
    var col1 = Math.ceil((player.x + player.width) / TILE_SIZE) + 1;
    var row1 = Math.ceil((player.y + player.height) / TILE_SIZE) + 1;

    if (col0 < 0) {
        col0 = 0;
    }
    if (row0 < 0) {
        row0 = 0;
    }
    if (col1 > GAME_COLS) {
        col1 = GAME_COLS;
    }
    if (row1 > GAME_ROWS) {
        row1 = GAME_ROWS;
    }

    //context.strokeStyle = "red";
    //context.strokeRect(x=col0 * TILE_SIZE, y=row0 * TILE_SIZE, w=TILE_SIZE * (col1 - col0), h=TILE_SIZE * (row1 - row0));

    // Update player position
    var wishLength = Math.sqrt(player.wishX * player.wishX + player.wishY * player.wishY);
    
    var dirX = 0;
    var dirY = 0;

    if (wishLength > 0) {    
        dirX = player.wishX / wishLength;
        dirY = player.wishY / wishLength;   
    }   

    if (player.velX > 0) {
        player.velX -= player.friction;
        if (player.velX < 0) {
            player.velX = 0;
        }
    }
    else if (player.velX < 0) {
        player.velX += player.friction;
        if (player.velX > 0) {
            player.velX = 0;
        }
    }
    if (player.velY > 0) {
        player.velY -= player.friction;
        if (player.velY < 0) {
            player.velY = 0;
        }
    }
    else if (player.velY < 0) {
        player.velY += player.friction;
        if (player.velY > 0) {
            player.velY = 0;
        }
    }

    player.velX += dirX * player.acceleration; 
    player.velY += dirY * player.acceleration;

    var velLength = Math.sqrt(player.velX * player.velX + player.velY * player.velY);
    
    if (velLength > player.maxSpeed) {
        var velScaling = player.maxSpeed / velLength;
        player.velX *= velScaling; 
        player.velY *= velScaling;
    }

    var playerSpeed = Math.sqrt(player.velX * player.velX + player.velY * player.velY);

    player.x = player.x + player.velX;
    player.y = player.y + player.velY;

    // Check if we are within bounds
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.y < 0) {
        player.y = 0;
    }
    if (player.x > GAME_WIDTH - player.width) {
        player.x = GAME_WIDTH - player.width;
    }
    if (player.y > GAME_HEIGHT - player.height) {
        player.y = GAME_HEIGHT - player.height;
    }

    // Check collisions
    for (row = row0; row < row1; row++) {
        for (col = col0; col < col1; col++) {
            if (TILE_MAP[row][col] == 1) {
                var tileRect = new Rectangle(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                var collide = intersect(player.getRectangle(), tileRect);
                if (collide) {
                    // Collision detected!
                    solve(tileRect);
                }
            }
        }
    }

    // Check checkpoints
    for (i = 0; i < checkpoints.length; i++) {
        var checkpoint = checkpoints[i];
        var checkpointRect = checkpoint.getRectangle();
        var collide = intersect(player.getRectangle(), checkpointRect);
        if (collide) {
            checkpoint.active = true;
            player.activeCheckpoint = checkpoint;
            for (j = 0; j < checkpoints.length; j++) {
                if (i != j) {
                    checkpoints[j].active = false;
                }
            }
        }
    }
    



    // Draw Tile Map
    context.fillStyle = "black";
    for (row = 0; row < GAME_ROWS; row++) {
        for (col = 0; col < GAME_COLS; col++) {
            if (TILE_MAP[row][col] == 1) {
                context.drawImage(wallSprite, x=col * TILE_SIZE, y=row*TILE_SIZE, w=TILE_SIZE, h=TILE_SIZE);
            }
        }
    }

    // Draw Checkpoints
    for (i = 0; i < checkpoints.length; i++) {
        var checkpoint = checkpoints[i];
        checkpoint.draw(context);
    }


    // Draw death ball circles outline
    for (i = 0; i < deathBalls.length; i++) {

        ball = deathBalls[i];

        var rect = ball.getRectangle()

        //ball.drawMovement(context)
        context.drawImage(ballSprite, x=rect.x, y=rect.y, rect.w, rect.h);

        var r1 = player.getRectangle();
        var r2 = ball.getRectangle();
        var collide = intersect(r1, r2);

        // Check if the player rectangle has collided with the circle rectangle
        if (collide) {
            player.respawn();
        }
    }

    var r1 = player.getRectangle();
    // Draw player position and other debug information
    /*
    context.font = "bold 16px Courier";
    context.fillStyle = "black";
    context.textAlight = "start";
    context.textAlign = "left";
    context.fillText(`player: ${r1.x.toFixed(2)} ${r1.y.toFixed(2)} ${player.velX.toFixed(2)} ${player.velY.toFixed(2)} ${playerSpeed.toFixed(2)}`, 8, 20);
    */

    //Draw player
    context.drawImage(playerSprite, x=player.x, y=player.y, player.width, player.height);
    context.strokeStyle = "red";
    context.strokeRect(x=r1.x, y=r1.y, w=r1.w, h=r1.h);

    //context.fillStyle = "black";
    //context.fillRect(x=player.x, y=player.y, width=player.width, height=player.height);

    // Convert from polar (angle, radius) coordinates to cartesian (xy) coordinates 
    


    //var rect = deathBall.getRectangle();
    //context.strokeStyle = "black";
    //context.strokeRect(x=rect.x, y=rect.y, width=rect.w, height=rect.h);
    
    

    
}