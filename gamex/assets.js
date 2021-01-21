import * as utils from "./utils.js";
import * as go from "./objects.js";
import * as cfg from "./config.js";


function getSprite(path) {
    let image = new Image();
    image.src = path;
    return image
}

export var TILES = new Map();

export const SPRITE_PLAYER = getSprite("assets/images/Womp3.png");
export const SPRITESHEET_PLAYER = getSprite("assets/images/player.png");
export const SPRITESHEET_COIN = getSprite("assets/images/coin.png");
export const SPRITE_BALL = getSprite("assets/images/DeathBot.png");

const LEVEL_FILES = [
    "./assets/levels/test1.json",
    "./assets/levels/test2.json",
    "./assets/levels/test3.json",
    "./assets/levels/test4.json",
    "./assets/levels/test5.json",
    "./assets/levels/test6.json"
];
export const NUM_LEVELS = LEVEL_FILES.length;
var LEVEL_JSONS = new Map();
var TILESET_JSON = null;


export var LEVELS = [];


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

LEVEL_FILES.forEach(path => loadJson(path, json => LEVEL_JSONS.set(path, json)));

loadJson(cfg.TILESET_JSON_FILE, json => TILESET_JSON = json);


function getProperty(objs, property, value) {
    return objs.find(x => { return x[property]  == value; });
}

function tiledVector(obj) {
    return new utils.Vector(obj["x"], obj["y"]);
}

function tiledRectangle(obj, yFlip=false) {
    let x = obj["x"];
    let w = obj["width"];
    let h = obj["height"];
    let y = yFlip ? obj["y"] - h : obj["y"];
    return new utils.Rectangle(x, y, w, h);
}

function levelFromJson(json, path) {

    // Load the tile data
    let tileLayer = getProperty(json["layers"], "name", "Tile Layer 1");
    let data = tileLayer["data"];
    let ncols = tileLayer["width"];
    let nrows = tileLayer["height"];

    let tileMap = Array(nrows).fill(null).map(()=>Array(ncols).fill(null));
    

    for (let i = 0; i < data.length; i++) {
        let row = Math.floor(i / ncols);
        let col = i % ncols;
        let tile = TILES.get(data[i]);
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
                keys.push(new go.Key(tiledRectangle(obj, true), color, TILES.get(gid).image));
                break;

            case "door":
                var color = getProperty(properties, "name", "color")["value"];
                var gid = objects[i]["gid"];
                doors.push(new go.Door(tiledRectangle(obj, true), color, TILES.get(gid).image));
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

    let level = new go.Level(name, desciption, path, spawn, balls, checkpoints, coins, keys, doors, goal, texts, tileMap);
    return level;
}


export class Tile {
    constructor(image, imagePath, id, collision=false, friction=null, object=null){
        this.image = image;
        this.imagePath = imagePath;
        this.id = id;
        this.collision = (collision == null) ? false : collision;
        this.friction = (friction == null || friction < 0) ? cfg.FRICTION_DEFAULT : friction;
        this.object = object;
    }
}


export function loadLevelFromIndex(index) {
    let path = LEVEL_FILES[index];
    let json = LEVEL_JSONS.get(path);
    return levelFromJson(json, path);
}


export function init() {
    // Initialize the tileset object
    TILESET_JSON["tiles"].forEach(tile => {
        let id = tile["id"];
        let imagePath = cfg.ASSET_DIR + tile["image"];
        let image = getSprite(imagePath);
        let properties = tile["properties"];

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
        
        TILES.set(id + 1, new Tile(image, imagePath, id, collision, friction, object));
    })
    
    // Sort level jsons by their name
    // LEVEL_JSONS = new Map([...LEVEL_JSONS.entries()].sort());
    //LEVEL_JSONS.forEach((json, path) => LEVELS.push(levelFromJson(json, path)));
}
