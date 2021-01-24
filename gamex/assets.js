import * as utils from "./utils.js";
import * as go from "./objects.js";
import * as cfg from "./config.js";


function loadJson(path, callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", path, true);
    xobj.onreadystatechange = () => {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Callback as .open returns undefined in asynchronous mode
            callback(JSON.parse(xobj.responseText));
        }
    };
    xobj.send(null);
}



export var TILES = new Map();
export const SPRITE_PLAYER = getSprite("assets/images/Womp3.png");
export const SPRITESHEET_PLAYER = getSprite("assets/images/player.png");
export const SPRITESHEET_COIN = getSprite("assets/images/coin.png");
export const SPRITE_BALL = getSprite("assets/images/enemies/floaty_animation.png");


export const SPRITESHEET_PLAYER_IDLE_LEFT = getSprite("assets/images/player/playerIdleLeft.png");
export const SPRITESHEET_PLAYER_IDLE_RIGHT = getSprite("assets/images/player/playerIdleRight.png");
export const SPRITESHEET_PLAYER_RUN_LEFT = getSprite("assets/images/player/playerRunLeft.png");
export const SPRITESHEET_PLAYER_RUN_RIGHT = getSprite("assets/images/player/playerRunRight.png");
export const SPRITESHEET_PLAYER_DASH_LEFT = getSprite("assets/images/player/playerDashLeft.png");
export const SPRITESHEET_PLAYER_DASH_RIGHT = getSprite("assets/images/player/playerDashRight.png");

// Level files
export var LEVELS = [];
const LEVEL_FILES = [
    "./assets/levels/test0.json",
    "./assets/levels/test1.json",
    "./assets/levels/test2.json",
    "./assets/levels/test3.json",
    "./assets/levels/test4.json",
    "./assets/levels/test5.json",
    "./assets/levels/test6.json",
    "./assets/levels/test7.json"
];
export const NUM_LEVELS = LEVEL_FILES.length;
var LEVEL_JSONS = new Map();
LEVEL_FILES.forEach(path => loadJson(path, json => LEVEL_JSONS.set(path, json)));


// Tileset files
const ASSET_DIR = './assets/'
const TILESET_FILES = [
    "./assets/tileset_common.json",
    "./assets/tileset_forest.json",
    "./assets/tileset_dungeon.json"
];
var TILESETS = new Map();
var TILESET_JSONS = new Map();
TILESET_FILES.forEach(path => loadJson(path, json => TILESET_JSONS.set(path, json)));



function getSprite(path) {
    let image = new Image();
    image.src = path;
    return image
}

function getProperty(objs, property, value) {
    return objs.find(x => { return x[property]  == value; });
}

function tiledVector(obj) {
    return new utils.Vector(obj["x"], obj["y"]);
}

function tiledRectangle(obj, flipY=false) {
    let x = obj["x"];
    let y = obj["y"];
    let w = obj["width"];
    let h = obj["height"];
    let rot = obj["rotation"];

    // Tiled has a few weird quirks for object tiles:
    // https://discourse.mapeditor.org/t/rotating-things-on-object-layer-changes-xy-coordinates/166
    // 1. The origin is by default in the lower left (not top left)
    // 2. If rotation is applied, the origin (xy) is also rotated
    
    // We first need to undo the rotation of the origin
    // The rotation matrix for xy (relative to the center) is
    // [x'] = [cos v, -sin v] [x]
    // [y'] = [sin v,  cos v] [y]

    if (rot) {
        let centerX = w / 2;
        let centerY = flipY ? -h / 2 : h / 2;

        let cosRot = Math.cos(rot * Math.PI / 180);
        let sinRot = Math.sin(rot * Math.PI / 180);
        let rotCenterX = centerX * cosRot - centerY * sinRot;
        let rotCenterY = centerX * sinRot + centerY * cosRot;
        
        // We now have the tiled center 
        x += rotCenterX;
        y += rotCenterY;

        // Get the actual corner
        x = Math.round(x - centerX);
        y = Math.round(y - centerY);
    }

    if (flipY) {
        y -= h;
    }

    return new utils.Rectangle(x, y, w, h);
}


function levelFromJson(json, path) {

    // Load the tile data
    let tileLayer = getProperty(json["layers"], "name", "Tile Layer 1");
    let data = tileLayer["data"];
    let ncols = tileLayer["width"];
    let nrows = tileLayer["height"];
    let tilesetSpecifications = json["tilesets"];
    let backgroundcolor = json["backgroundcolor"];

    let tileLookup = new Map();

    for (let i = 0; i < tilesetSpecifications.length; i++) {
        let spec = tilesetSpecifications[i];
        let name = spec["source"].replace(/^.*[\\\/]/, "").replace(/\.[^/.]+$/, "");
        let firstGid = spec["firstgid"];
        let tileset = TILESETS.get(name);
        for (const [id, tile] of tileset.tiles.entries()) {
            tileLookup.set(firstGid + id, tile);
        }
    }

    let tileMap = Array(nrows).fill(null).map(()=>Array(ncols).fill(null));
    
    for (let i = 0; i < data.length; i++) {
        let row = Math.floor(i / ncols);
        let col = i % ncols;
        let tile = tileLookup.get(data[i]);
        tileMap[row][col] = tile;
    }

    // Load the object data
    let objectLayer = getProperty(json["layers"], "type", "objectgroup");
    let objects = objectLayer["objects"];

    let name = null;
    let desciption = null;

    if (json["properties"] != null) {
        name = getProperty(json["properties"], "name", "name")["value"];
        desciption = getProperty(json["properties"], "name", "description")["value"];
    }
    
    let spawn = null;
    let checkpoints = [];
    let balls = [];
    let texts = [];
    let goal = null;
    let coins = [];
    let keys = [];
    let doors = [];
    let spikes = [];

    for (let i = 0; i < objects.length; i++) {
        
        let obj = objects[i];
        let type = objects[i]["type"];
        let properties = objects[i]["properties"];

        switch (type) {

            case "spawn":
                spawn = tiledVector(obj);
                break;

            case "checkpoint":
                checkpoints.push(new go.Checkpoint(tiledRectangle(obj)));
                break;

            case "goal":
                goal = new go.Goal(tiledRectangle(obj));
                break;

            case "text":
                var rect = tiledRectangle(obj);
                let text = obj["text"]["text"];
                let pixelsize = obj["text"]["pixelsize"];
                let wrap = obj["text"]["wrap"];
                texts.push(new go.Text(text, pixelsize, rect, wrap));
                break;
            
            case "coin":
                coins.push(new go.Coin(tiledRectangle(obj, true)));
                break;

            case "key":
                var color = getProperty(properties, "name", "color")["value"];
                var gid = objects[i]["gid"];
                keys.push(new go.Key(tiledRectangle(obj, true), color, tileLookup.get(gid).image));
                break;

            case "door":
                var color = getProperty(properties, "name", "color")["value"];
                var gid = objects[i]["gid"];
                doors.push(new go.Door(tiledRectangle(obj, true), color, tileLookup.get(gid).image));
                break;

            case "spike":
                // Rotation: 0 degrees -> up, 90 degrees -> right, ...
                var imageRot = obj["rotation"] * Math.PI / 180;
                // Convert to javascript canvas radians (0 right, pi/2 down, etc.)
                // NOTE: Not radians where pi/2 is up (canvas has positive y down)
                // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate
                var spikeRot = (obj["rotation"] - 90) * Math.PI / 180;
                var gid = objects[i]["gid"];
                spikes.push(new go.Spike(tiledRectangle(obj, true), imageRot, spikeRot, tileLookup.get(gid).image));
                break;

                    
            case "ball":
                var rect = new tiledRectangle(obj, true);
                var pos = rect.center();
                let size = rect.w / 2;

                var speed = getProperty(properties, "name", "speed")["value"];
                var centerIdx = getProperty(properties, "name", "center")["value"];
                
                if (centerIdx != 0) {
                    var centerObj = getProperty(objects, "id", centerIdx);
                    var center = tiledVector(centerObj);
                    let radius = pos.subtract(center).length();
                    let angle = Math.atan2(pos.y - center.y, pos.x - center.x);
                    speed = speed / 180 * Math.PI;
                    balls.push(new go.DeathBallCircle(center, radius, speed, size, angle));
                }
                else {
                    var lineIdx = getProperty(properties, "name", "line")["value"];
                    if (lineIdx != 0) {
                        var lineObj = getProperty(objects, "id", lineIdx);
                        let p = tiledVector(lineObj);
                        let p1 = p.add(tiledVector(lineObj["polyline"][0]));
                        let p2 = p.add(tiledVector(lineObj["polyline"][1]));
                        speed = speed / 100;

                        // Relative to p1: the length from p1 to the projection
                        // should be proportional to t
                        let lineVector = p2.subtract(p1);
                        let proj =  pos.subtract(p1).project(lineVector);                    
                        let t = proj.length() / lineVector.length();
                        balls.push(new go.DeathBallLinear(p1, p2, speed, size, t));
                    }
                }
                break;
        }
    }

    
    let level = new go.Level(name, desciption, path, spawn, balls, spikes, checkpoints, coins, keys, doors, goal, texts, tileMap, backgroundcolor);
    return level;
}


function dataToImage(data) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = data.width;
    canvas.height = data.height;
    ctx.putImageData(data, 0, 0);
    var image = new Image();
    image.src = canvas.toDataURL();
    return image;
}


export class Tile {
    constructor(image, imagePath, id, collision=false, friction=null){
        this.image = image;
        this.imagePath = imagePath;
        this.id = id;
        this.collision = (collision == null) ? false : collision;
        this.friction = (friction == null || friction < 0) ? cfg.FRICTION_DEFAULT : friction;
    }
}


export class Tileset {
    constructor(name){
        this.name = name;
        this.tiles = new Map();
    }
}

export class TilemapTileset extends Tileset {
    constructor(name, path, image, tileWidth=16, tileHeight=16, tilesSpecs) {
        super(name);
        this.image = image;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;

        this.ncols = Math.round(image.width / tileWidth);
        this.nrows = Math.round(image.height / tileHeight);

        let tempCanvas = document.createElement("canvas");
        let tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(image, 0, 0, image.width, image.height);

        
        for (let row = 0; row < this.nrows; row++) {
            for (let col = 0; col < this.ncols; col++) {
                let id = row * this.ncols + col;
                let x = col * this.tileWidth;
                let y = row * this.tileHeight;
                let data = tempCtx.getImageData(x, y, tileHeight, tileWidth, tileHeight);
                let tileImage = dataToImage(data);

                // Check if there are furhter tile properties
                let collision = null;
                let friction = null;
                
                let spec = getProperty(tilesSpecs, "id", id);

                if (spec != null) {
                    let pCollision = getProperty(spec["properties"], "name", "collision");
                    let pFriction = getProperty(spec["properties"], "name", "friction");
                    collision = pCollision == null ? null : pCollision["value"];
                    friction = pFriction == null ? null : pFriction["value"];
                }
                
                let tile = new Tile(tileImage, path, id, collision, friction);
                
                this.tiles.set(id, tile);
            }
        }
    }
}


export class ImageTileset extends Tileset {
    constructor(name, tilesSpecs){
        super(name);

        tilesSpecs.forEach(spec => {
            let id = spec["id"];
            let imagePath = ASSET_DIR + spec["image"];
            let image = getSprite(imagePath);
            let properties = spec["properties"];
            let collision = null;
            let friction = null;
            let object = null;
            
            if (properties != null) {
                let pCollision = getProperty(properties, "name", "collision");
                let pFriction = getProperty(properties, "name", "friction");
                let pObject = getProperty(properties, "name", "object");
                collision = pCollision == null ? null : pCollision["value"];
                friction = pFriction == null ? null : pFriction["value"];
                object = pObject == null ? null : pObject["value"];
            }
            
            let tile = new Tile(image, imagePath, id, collision, friction);

            this.tiles.set(id, tile);
        });

    }
}


export function loadLevelFromIndex(index) {
    let path = LEVEL_FILES[index];
    let json = LEVEL_JSONS.get(path);
    return levelFromJson(json, path);
}


export async function init() {
    // Initialize the tileset object

    for (const [path, json] of TILESET_JSONS.entries()) {
        
        // Check if the tileset is a collection of images or a single image
        let imagePath = json["image"];
        let tileSpecs = json["tiles"];
        let name = json["name"];


        if (imagePath) {
            // If there is an image, we have a single tilemap tileset
            imagePath = "assets/" + imagePath;
            let image = getSprite(imagePath);
            await image.decode();
            let tileWidth = json["tilewidth"];
            let tileHeight = json["tileheight"];
            let tileset = new TilemapTileset(name, imagePath, image, tileWidth, tileHeight, tileSpecs);
            TILESETS.set(name, tileset);
        }
        else {
            // Otherwise, the tileset is a collection of separate image files
            let tileset = new ImageTileset(name, tileSpecs);
            TILESETS.set(name, tileset);
        }
    }
    // Sort level jsons by their name
    // LEVEL_JSONS = new Map([...LEVEL_JSONS.entries()].sort());
    //LEVEL_JSONS.forEach((json, path) => LEVELS.push(levelFromJson(json, path)));
}
