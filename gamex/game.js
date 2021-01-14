import {Player, DeathBallCircle, DeathBallLinear, Checkpoint, Goal, Level, TILE_SIZE, FRICTION_DEFAULT, FRICTION_ICE, ACCELERATION_DEFAULT, ACCELERATION_ICE} from './objects.js';
import {Vector, Rectangle, solve, clamp, rectIntersect, rectCircleInterset} from './utils.js';


// Load levels

const LEVEL_FILES = [
    'test.json'
];

const TILESET_JSON_FILE = './assets/MyTileset.json'

var LEVEL_JSONS = [];
var TILESET_JSON = null;
var LEVELS = [];

function loadJSON(callback, fileName) {   

    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', fileName, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
}

for (let i = 0; i < LEVEL_FILES.length; i++) {
    loadJSON(function(response) {
        let levelJson = JSON.parse(response);
        LEVEL_JSONS.push(levelJson);
    }, `./levels/${LEVEL_FILES[i]}`)
}


loadJSON(function(response) {
    TILESET_JSON = JSON.parse(response);
}, TILESET_JSON_FILE)


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
    init();
    setInterval(gameLoop, 1000/60);
}


var drawColliders = false;
var drawDebug = false;
var drawGrid = false;

var playerSprite = new Image();
playerSprite.src = "assets/Womp3.png";
playerSprite = playerSprite;

var ballSprite= new Image();
ballSprite.src = "assets/DeathBot.png"
var wallSprite= new Image();
wallSprite.src = "assets/Wall2.png"
var floorSprite= new Image();
floorSprite.src = "assets/Floor1.png"
var iceSprite= new Image();
iceSprite.src = "assets/ice.png"


var TILE_FLOOR = 1;
var TILE_WALL = 2;
var TILE_ICE = 3;


var col0 = 0;
var row0 = 0;
var col1 = 0;
var row1 = 0;

var tightCol0 = 0;
var tightRow0 = 0;
var tightCol1 = 0;
var tightRow1 = 0;


function tileRectangleToCoords(x, y, w, h) {
    x = x * TILE_SIZE;
    y = y * TILE_SIZE;
    w = w * TILE_SIZE;
    h = h * TILE_SIZE;
    return  new Rectangle(x, y, w, h);
}


var player = new Player(new Vector(128, 128));


// Level 1

var nrows = 16; // Maximum 24
var ncols = 32; // Maximum 48

var tileMap = Array(nrows).fill(null).map(()=>Array(ncols).fill(TILE_FLOOR))
tileMap[10][10] = TILE_WALL;
tileMap[10][11] = TILE_WALL;

for (let row = 0; row < nrows; row++) {
    tileMap[row][0] = TILE_WALL;
    tileMap[row][ncols-1] = TILE_WALL;
}
for (let col = 0; col < ncols; col++) {
    tileMap[0][col] = TILE_WALL;
    tileMap[nrows-1][col] = TILE_WALL;
}

for (let row = 3; row < nrows-1; row++) {
    for (let col = TILE_WALL; col < 10; col++) {
        tileMap[row][col] = TILE_ICE;
    }
}
for (let col = 0; col < ncols; col++) {
    tileMap[0][col] = TILE_WALL;
    tileMap[nrows-1][col] = TILE_WALL;
}


var level1 = new Level(
    new Vector(128, 128),
    [
        new DeathBallCircle(new Vector(900, 400), 20),
        new DeathBallCircle(new Vector(400, 200), 150, 0.01),
        new DeathBallCircle(new Vector(600, 400)),
        new DeathBallLinear(new Vector(50, 350), new Vector(300, 350), 0.01)
    ],
    [
        new Checkpoint(tileRectangleToCoords(1, 1, 1, 1)),
        new Checkpoint(tileRectangleToCoords(20, 3, 2, 2)),
        new Checkpoint(tileRectangleToCoords(23, 12, 3, 2))
    ],
    new Goal(tileRectangleToCoords(28, 8, 2, 2)),
    tileMap
)

var level;
var levelIndex = 0;

var nrows = 8; // Maximum 24
var ncols = 16; // Maximum 48

var tileMap = Array(nrows).fill(null).map(()=>Array(ncols).fill(TILE_FLOOR))
tileMap[4][10] = TILE_WALL;
tileMap[4][11] = TILE_WALL;

for (let row = 0; row < nrows; row++) {
    tileMap[row][0] = TILE_WALL;
    tileMap[row][ncols-1] = TILE_WALL;
}
for (let col = 0; col < ncols; col++) {
    tileMap[0][col] = TILE_WALL;
    tileMap[nrows-1][col] = TILE_WALL;
}

var level2 = new Level(
    new Vector(128, 128),
    [
        new DeathBallCircle(new Vector(64, 196), 32)
    ],
    [
    ],
    new Goal(tileRectangleToCoords(13, 5, 2, 2)),
    tileMap
)


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


function getTiledVector(obj) {
    return new Vector(TILE_SIZE * obj["x"] / 16, TILE_SIZE * obj["y"] / 16);
}

function getTiledRectangle(obj) {
    return new Rectangle(TILE_SIZE * obj["x"] / 16,
                         TILE_SIZE * obj["y"] / 16,
                         TILE_SIZE * obj["width"] / 16,
                         TILE_SIZE * obj["height"] / 16);
}

function loadLevelFromJson(json, tileLookup) {

    // Load the tile data
    let tileLayer = json['layers'].find(x => {
        return x['type']  == 'tilelayer';
    })
    let data = tileLayer['data'];
    let ncols = tileLayer['width'];
    let nrows = tileLayer['height'];

    let tileMap = Array(nrows).fill(null).map(()=>Array(ncols).fill(0))
    

    for (let i = 0; i < data.length; i++) {
        let row = Math.floor(i / ncols);
        let col = i % ncols;
        tileMap[row][col] = tileLookup.get(data[i]);
    }

    // Load the object data
    let objectLayer = json['layers'].find(x => {
        return x['type']  == 'objectgroup';
    })
    let objects = objectLayer["objects"];

    let spawn = null;
    let checkpoints = [];
    let deathBalls = [];
    let goal = null;

    for (let i = 0; i < objects.length; i++) {
        let o = objects[i];

        switch (o["type"]) {

            case "spawn":
                spawn = getTiledVector(o);
                break;

            case "checkpoint":
                
                checkpoints.push(new Checkpoint(getTiledRectangle(o)));
                break;

            case "goal":
                goal = new Goal(getTiledRectangle(o));
                break;

            case "ball":
                var rect = new getTiledRectangle(o);
                var position = rect.center();
                let size = rect.w / 2;

                var speed = o['properties'].find(x => {
                    return x['name']  == 'speed';
                })["value"];
                
                var centerIdx = o['properties'].find(x => {
                    return x['name']  == 'center';
                })["value"];
                
                if (centerIdx != 0) {
                    var centerObj = objects.find(x => {
                        return x['id']  == centerIdx;
                    });
    
                    var center = getTiledVector(centerObj);
                    let radius = position.subtract(center).length();
                    let angle = Math.atan2(position.y - center.y, position.x - center.x);
                    deathBalls.push(new DeathBallCircle(center, radius, speed, angle, size));
                }
                else {

                    console.log(o);

                    var lineIdx = o['properties'].find(x => {
                        return x['name']  == 'line';
                    })["value"];

                    if (lineIdx != 0) {
                        var lineObj = objects.find(x => {
                            return x['id']  == lineIdx;
                        });
                    }

                    let p = getTiledVector(lineObj);
                    let p1 = p.add(getTiledVector(lineObj["polyline"][0]));
                    let p2 = p.add(getTiledVector(lineObj["polyline"][1]));

                    deathBalls.push(new DeathBallLinear(p1, p2, speed, size));
                    

                } 
                
                break;
        }
    }

    return new Level(
        spawn,
        deathBalls,
        checkpoints,
        goal,
        tileMap
    );
}


function loadAllLevels() {
    let data = json['layers'][0]['data'];
    let ncols = json['layers'][0]['width'];
    let nrows = json['layers'][0]['height'];

    let tileMap = [];
    
    for (let row = 0; row < nrows; row++) {
        tileMap.push(data.slice(row * ncols, (row + 1) * ncols));
    }
    
    return new Level(
        new Vector(128, 128),
        [],
        [],
        new Goal(tileRectangleToCoords(13, 5, 2, 2)),
        tileMap
    );
}


function init() {
    
    let tileLookup = new Map();
    
    for (let i = 0; i < TILESET_JSON['tiles'].length; i++) {
        let tile = TILESET_JSON['tiles'][i];

        let tileIdProperty = tile['properties'].find(x => {
            return x['name']  == 'tileId';
        })

        let tileId = tileIdProperty['value'];
        tileLookup.set(i + 1, tileId);
    }

    for (let i = 0; i < LEVEL_JSONS.length; i++) {
        LEVELS.push(loadLevelFromJson(LEVEL_JSONS[i], tileLookup))
    }
    LEVELS.push(level1);
    LEVELS.push(level2);
    level = LEVELS[0];
    levelIndex = 0;
    loadLevel(level);
    
}

function gameLoop() {
    update();
    draw();
}

function coordToTile(x) {
    return Math.floor(x / TILE_SIZE);
}



function changeLevel() {
    levelIndex = (levelIndex + 1) % LEVELS.length;
    loadLevel(LEVELS[levelIndex])
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
    player.pos = level.playerStart;
    player.pos.x -= player.width / 2;
    player.pos.y -= player.height / 2;
    player.start = level.playerStart;
}


function update() {
    
    tightCol0 = coordToTile(player.pos.x);
    tightRow0 = coordToTile(player.pos.y);
    tightCol1 = coordToTile(player.pos.x + player.width) + 1;
    tightRow1 = coordToTile(player.pos.y + player.height) + 1;

    // Check intersecting tiles
    col0 = tightCol0 - 1;
    row0 = tightRow0 - 1;
    col1 = tightCol1;
    row1 = tightRow1;
    col0 = Math.max(col0, 0);
    row0 = Math.max(row0, 0);
    col1 = Math.min(col1, level.ncols);
    row1 = Math.min(row1, level.nrows);

    // Update player movement
    let speed = player.vel.length();
    let friction = player.vel.normalize().multiply(-player.friction).limit(speed);
    let acc = player.wish.normalize().multiply(player.acceleration);
    let resultant = acc.add(friction);
    player.vel = player.vel.add(resultant);
    player.vel = player.vel.limit(player.maxSpeed);
    player.pos = player.pos.add(player.vel);

    // Make sure we stay within bounds
    player.pos.x = clamp(player.pos.x, 0, level.width - player.width);
    player.pos.y = clamp(player.pos.y, 0, level.height - player.height);

    // Check collisions
    for (let row = row0; row < row1; row++) {
        for (let col = col0; col < col1; col++) {
            if (level.tileMap[row][col] == TILE_WALL) {
                let tileRect = new Rectangle(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                let collide = rectIntersect(player.getRectangle(), tileRect);
                if (collide) {
                    solve(player, tileRect);
                }
            }
        }
    }
    
    // Check collisions
    let all_ice = true;

    for (let row = tightRow0; row < row1; row++) {
        for (let col = tightCol0; col < col1; col++) {
            if (level.tileMap[row][col] == TILE_FLOOR) {
                all_ice = false;
                break;
            }
        }
    }
    if (all_ice) {
        player.friction = FRICTION_ICE;
        player.acceleration = ACCELERATION_ICE;
    }
    else {
        player.friction = FRICTION_DEFAULT;
        player.acceleration = ACCELERATION_DEFAULT;
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
            let tile = level.tileMap[row][col];
            if (tile == TILE_WALL) {
                ctx.drawImage(wallSprite, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
            else if (tile == TILE_FLOOR) {
                ctx.drawImage(floorSprite, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
            else if (tile == TILE_ICE) {
                ctx.drawImage(iceSprite, col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Intersecting tiles
    if (drawDebug) {
        ctx.strokeStyle = "red";
        ctx.strokeRect(col0 * TILE_SIZE, row0 * TILE_SIZE, TILE_SIZE * (col1 - col0), TILE_SIZE * (row1 - row0));
        ctx.strokeStyle = "green";
        ctx.strokeRect(tightCol0 * TILE_SIZE, tightRow0 * TILE_SIZE, TILE_SIZE * (tightCol1 - tightCol0), TILE_SIZE * (tightRow1 - tightRow0));
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