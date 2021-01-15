import * as utils from "./utils.js";
import * as go from "./objects.js";
import {TILE_SIZE} from "./objects.js";


function getSprite(path) {
    let image = new Image();
    image.src = path;
    return image
}

export var TILES = new Map();

export const SPRITE_PLAYER = getSprite("assets/images/Womp3.png");
export const SPRITE_BALL = getSprite("assets/images/DeathBot.png");

const LEVEL_FILES = [
    "./assets/levels/test1.json",
    "./assets/levels/test2.json"
];

const ASSET_DIR = './assets/'
const TILESET_JSON_FILE = ASSET_DIR + 'tileset.json'

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

loadJson(TILESET_JSON_FILE, json => TILESET_JSON = json);


function getProperty(objs, property, value) {
    return objs.find(x => { return x[property]  == value; });
}

function tiledVector(obj) {
    return new utils.Vector(TILE_SIZE * obj["x"] / 16, TILE_SIZE * obj["y"] / 16);
}

function tiledRectangle(obj) {
    return new utils.Rectangle(TILE_SIZE * obj["x"] / 16,
                               TILE_SIZE * obj["y"] / 16,
                               TILE_SIZE * obj["width"] / 16,
                               TILE_SIZE * obj["height"] / 16);
}

function levelFromJson(json, path) {

    // Load the tile data
    let tileLayer = getProperty(json["layers"], "type", "tilelayer");
    let data = tileLayer['data'];
    let ncols = tileLayer['width'];
    let nrows = tileLayer['height'];

    let tileMap = Array(nrows).fill(null).map(()=>Array(ncols).fill(null))
    

    for (let i = 0; i < data.length; i++) {
        let row = Math.floor(i / ncols);
        let col = i % ncols;
        tileMap[row][col] = TILES.get(data[i]);
    }

    // Load the object data
    let objectLayer = getProperty(json["layers"], "type", "objectgroup");
    let objects = objectLayer["objects"];

    let spawn = null;
    let checkpoints = [];
    let balls = [];
    let texts = [];
    let goal = null;

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
    
            case "ball":
                var rect = new tiledRectangle(obj);
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
                        // Relative to p1
                        let lineVector = p2.subtract(p1);
                        let proj =  pos.subtract(p1).project(lineVector);                    
                        let t = proj.length() / lineVector.length();
                        balls.push(new go.DeathBallLinear(p1, p2, speed, size, t));
                    }
                }
                break;
        }
    }
    let level = new go.Level(path, spawn, balls, checkpoints, goal, texts, tileMap);
    return level;
}


export const FRICTION_DEFAULT = 2000.0;

export class Tile {
    constructor(image, imagePath, id, collision=false, friction=null){
        this.image = image;
        this.imagePath = imagePath;
        this.id = id;
        this.collision = collision;
        this.friction = (friction == null || friction < 0) ? FRICTION_DEFAULT : friction;
    }
}


export function loadAllLevels() {
    
    // Initialize the tileset object
    TILESET_JSON["tiles"].forEach(tile => {
        let id = tile["id"];
        let imagePath = ASSET_DIR + tile["image"];
        let image = getSprite(imagePath);
        let properties = tile["properties"];
        let collision = getProperty(properties, "name", "collision")["value"];
        let friction = getProperty(properties, "name", "friction")["value"];
        TILES.set(id + 1, new Tile(image, imagePath, id, collision, friction));
    })
    
    // Sort level jsons by their name
    LEVEL_JSONS = new Map([...LEVEL_JSONS.entries()].sort());
    LEVEL_JSONS.forEach((json, path) => LEVELS.push(levelFromJson(json, path)));
}
