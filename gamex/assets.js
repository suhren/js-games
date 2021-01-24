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

function loadXml(path, callback) {   
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/xml");
    xobj.open("GET", path, true);
    xobj.onreadystatechange = () => {
        if (xobj.readyState == 4 && xobj.status == "200") {
            // Callback as .open returns undefined in asynchronous mode
            let parser = new DOMParser();
            callback(parser.parseFromString(xobj.responseText, "text/xml"));
        }
    };
    xobj.send(null);
}


function getFileName(path) {
    return path.replace(/^.*[\\\/]/, "").replace(/\.[^/.]+$/, "");
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
export const SPRITESHEET_PLAYER_EXPLODE = getSprite("assets/images/player/explosion.png");
export const SPRITESHEET_PLAYER_SPIRIT = getSprite("assets/images/player/spirit.png");

// Template XML (Tiled .tx) files
export var TEMPLATES = [];
const TEMPLATE_FILES = [
    "./assets/templates/ball.tx",
    "./assets/templates/checkpoint.tx",
    "./assets/templates/coin.tx",
    "./assets/templates/doorBlue.tx",
    "./assets/templates/doorGreen.tx",
    "./assets/templates/doorRed.tx",
    "./assets/templates/doorYellow.tx",
    "./assets/templates/goal.tx",
    "./assets/templates/keyBlue.tx",
    "./assets/templates/keyGreen.tx",
    "./assets/templates/keyRed.tx",
    "./assets/templates/keyYellow.tx",
    "./assets/templates/line.tx",
    "./assets/templates/position.tx",
    "./assets/templates/spawn.tx",
    "./assets/templates/spike.tx",
    "./assets/templates/text.tx"
];
var TEMPLATE_XMLS = new Map();
TEMPLATE_FILES.forEach(path => loadXml(path,
    xml => TEMPLATE_XMLS.set(getFileName(path), xml))
);


// Level XML (Tiled .tmx) files
export var LEVELS = [];
const LEVEL_FILES = [
    "./assets/levels/test7.tmx",
    "./assets/levels/test0.tmx",
    "./assets/levels/test1.tmx",
    "./assets/levels/test2.tmx",
    "./assets/levels/test3.tmx",
    "./assets/levels/test4.tmx",
    "./assets/levels/test5.tmx",
    "./assets/levels/test6.tmx"
];
export const NUM_LEVELS = LEVEL_FILES.length;
var LEVEL_XMLS = new Map();
LEVEL_FILES.forEach(path => loadXml(path, xml => LEVEL_XMLS.set(path, xml)));


// Tileset XML (Tiled .tsx) files
const ASSET_DIR = './assets/'
const TILESET_FILES = [
    "./assets/tileset_common.tsx",
    "./assets/tileset_forest.tsx",
    "./assets/tileset_dungeon.tsx"
];
var TILESETS = new Map();
var TILESET_XMLS = new Map();
TILESET_FILES.forEach(path => loadXml(path, xml => TILESET_XMLS.set(path, xml)));


function getSprite(path) {
    let image = new Image();
    image.src = path;
    return image
}

function tiledVector(obj) {
    return new utils.Vector(parseInt(obj.getAttribute("x")),
                            parseInt(obj.getAttribute("y")));
}

function tiledRectangle(x, y, w, h, rot=0, flipY=false) {
    // Tiled has a few weird quirks for object tiles:
    // https://discourse.mapeditor.org/t/rotating-things-on-object-layer-changes-xy-coordinates/166
    // 1. The origin is by default in the lower left (not top left)
    // 2. If rotation is applied, the origin (xy) is also rotated
    
    // We first need to undo the rotation of the origin
    // The rotation matrix for xy (relative to the center) is
    // [x'] = [cos v, -sin v] [x]
    // [y'] = [sin v,  cos v] [y]

    if (rot != null && !isNaN(rot) && rot > 0) {
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



function getAttribute(name, object, template) {
    var x = object.getAttribute(name);
    if (x == null) {
        x = template.getAttribute(name);
    }
    return x;
}


function getProperty(name, object, template) {
    var x = object.querySelectorAll(`property[name='${name}']`)[0];
    if (x == null) {
        x = template.querySelectorAll(`property[name='${name}']`)[0];
    }
    return x.getAttribute("value");
}


function getTile(object, template) {
    var x = object.querySelectorAll(`property[name='${name}']`)[0];
    if (x == null) {
        x = template.querySelectorAll(`property[name='${name}']`)[0];
    }
    return x.getAttribute("value");
}



function levelFromXml(xml, path) {

    let root = xml.getElementsByTagName("map")[0];
    let backgroundcolor = root.getAttribute("backgroundcolor");

    let name = root.querySelectorAll("property[name='name']")[0];
    if (name != null) {
        name = name.getAttribute("value");
    }
    let description = root.querySelectorAll("property[name='description']")[0];
    if (description != null) {
        description = description.getAttribute("value");
    }

    // Naively select the first tile layer. Change if more layers are neeed.
    let tileLayer = root.getElementsByTagName("layer")[0];
    let ncols = parseInt(tileLayer.getAttribute("width"));
    let nrows = parseInt(tileLayer.getAttribute("height"))
    let dataString = tileLayer.getElementsByTagName("data")[0].firstChild.data;
    let data = dataString.split(",").map(x => parseInt(x));;
    
    // Setup level-specific tileset lookups
    let levelTileLookup = new Map();
    let tilesetSpecs = root.getElementsByTagName("tileset");
    for (let i = 0; i < tilesetSpecs.length; i++) {
        let spec = tilesetSpecs[i];
        let name = getFileName(spec.getAttribute("source"))
        let firstGid = parseInt(spec.getAttribute("firstgid"));
        let tileset = TILESETS.get(name);
        for (const [id, tile] of tileset.tiles.entries()) {
            levelTileLookup.set(firstGid + id, tile);
        }
    }

    // Setup template-specific tileset lookups
    let templateTileLookups = new Map();

    for (const [templateName, xml] of TEMPLATE_XMLS) {
        let template = xml.getElementsByTagName("template")[0];
        let specs = template.getElementsByTagName("tileset");
        if (specs != null && specs.length > 0) {
            var lookup = new Map();
            for (let i = 0; i < specs.length; i++) {
                var spec = specs[i];
                var tilesetName =  getFileName(spec.getAttribute("source"));
                var firstGid = parseInt(spec.getAttribute("firstgid"));
                var tileset = TILESETS.get(tilesetName);
                for (const [id, tile] of tileset.tiles.entries()) {
                    lookup.set(firstGid + id, tile);
                }
            }
            templateTileLookups.set(templateName, lookup);
        }
    }

    let tileMap = Array(nrows).fill(null).map(()=>Array(ncols).fill(null));
    
    for (let i = 0; i < data.length; i++) {
        let row = Math.floor(i / ncols);
        let col = i % ncols;
        let tile = levelTileLookup.get(data[i]);
        if (tile != null && tile.animated) {
            tileMap[row][col] = tile.copy();
        }
        else {
            tileMap[row][col] = tile;
        }
    }

    // Naively select the first object layer. Change if more layers are neeed.
    let objectLayer = root.getElementsByTagName("objectgroup")[0];
    let objects = objectLayer.getElementsByTagName("object");

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
        
        let template = null;
        let templateName = null;
        let templateObject = null;
        let type = null;
        let templatePath = obj.getAttribute("template");

        if (templatePath == null) {
            type = obj.getAttribute("type");
            if (type == null) {
                continue;
            }
        }
        else {
            templateName = getFileName(templatePath);
            template = TEMPLATE_XMLS.get(templateName);
            template = template.getElementsByTagName("template")[0];
            templateObject = template.getElementsByTagName("object")[0];
            type = templateObject.getAttribute("type");
        }

        switch (type) {

            case "spawn":
                var x = parseInt(getAttribute("x", obj, templateObject));
                var y = parseInt(getAttribute("y", obj, templateObject));
                spawn = new utils.Vector(x, y);
                break;

            case "checkpoint":
                var x = parseInt(getAttribute("x", obj, templateObject));
                var y = parseInt(getAttribute("y", obj, templateObject));
                var w = parseInt(getAttribute("width", obj, templateObject));
                var h = parseInt(getAttribute("height", obj, templateObject));
                checkpoints.push(new go.Checkpoint(tiledRectangle(x, y, w, h)));
                break;

            case "goal":
                var x = parseInt(getAttribute("x", obj, templateObject));
                var y = parseInt(getAttribute("y", obj, templateObject));
                var w = parseInt(getAttribute("width", obj, templateObject));
                var h = parseInt(getAttribute("height", obj, templateObject));
                goal = new go.Goal(tiledRectangle(x, y, w, h));
                break;

            case "text":
                var x = parseInt(getAttribute("x", obj, templateObject));
                var y = parseInt(getAttribute("y", obj, templateObject));
                var w = parseInt(getAttribute("width", obj, templateObject));
                var h = parseInt(getAttribute("height", obj, templateObject));
                var rect = tiledRectangle(x, y, w, h);

                var textObj = obj.getElementsByTagName("text")[0];

                if (textObj == null) {
                    textObj = templateObject.getElementsByTagName("text")[0];
                }
                var text = textObj.firstChild.data;
                let pixelsize = parseInt(textObj.getAttribute("pixelsize"));
                let wrap = parseInt(textObj.getAttribute("wrap"));
                texts.push(new go.Text(text, pixelsize, rect, wrap));
                break;
            
            case "coin":
                var x = parseInt(getAttribute("x", obj, templateObject));
                var y = parseInt(getAttribute("y", obj, templateObject));
                var w = parseInt(getAttribute("width", obj, templateObject));
                var h = parseInt(getAttribute("height", obj, templateObject));
                var rect = tiledRectangle(x, y, w, h, 0, true);
                coins.push(new go.Coin(rect));
                break;

            case "key":
                var x = parseInt(getAttribute("x", obj, templateObject));
                var y = parseInt(getAttribute("y", obj, templateObject));
                var w = parseInt(getAttribute("width", obj, templateObject));
                var h = parseInt(getAttribute("height", obj, templateObject));
                var rect = tiledRectangle(x, y, w, h, 0, true);
                var color = getProperty("color", obj, templateObject);
                var gid = parseInt(getAttribute("gid", obj, templateObject));
                var templateTileLookup = templateTileLookups.get(templateName);
                var image = null;
                if (templateTileLookup != null) {
                    image = templateTileLookup.get(gid).image;
                }
                else {
                    image = levelTileLookup.get(gid).image;
                }
                keys.push(new go.Key(rect, color, image));
                break;

            case "door":
                var x = parseInt(getAttribute("x", obj, templateObject));
                var y = parseInt(getAttribute("y", obj, templateObject));
                var w = parseInt(getAttribute("width", obj, templateObject));
                var h = parseInt(getAttribute("height", obj, templateObject));
                var rect = tiledRectangle(x, y, w, h, 0, true);
                var color = getProperty("color", obj, templateObject);
                var gid = parseInt(getAttribute("gid", obj, templateObject));
                
                var templateTileLookup = templateTileLookups.get(templateName);
                var image = null;
                if (templateTileLookup != null) {
                    image = templateTileLookup.get(gid).image;
                }
                else {
                    image = levelTileLookup.get(gid).image;
                }

                doors.push(new go.Door(rect, color, image));
                break;

            case "spike":
                var x = parseInt(getAttribute("x", obj, templateObject));
                var y = parseInt(getAttribute("y", obj, templateObject));
                var w = parseInt(getAttribute("width", obj, templateObject));
                var h = parseInt(getAttribute("height", obj, templateObject));
                var rot = parseFloat(getAttribute("rotation", obj, templateObject));
                if (rot == null || isNaN(rot)) {
                    rot = 0;
                }
                var rect = tiledRectangle(x, y, w, h, rot, true);
                // Rotation: 0 degrees -> up, 90 degrees -> right, ...
                var imageRot = rot * Math.PI / 180;
                // Convert to javascript canvas radians (0 right, pi/2 down, etc.)
                // NOTE: Not radians where pi/2 is up (canvas has positive y down)
                // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/rotate
                var spikeRot = (rot - 90) * Math.PI / 180;
                var gid = parseInt(getAttribute("gid", obj, templateObject));
                
                var templateTileLookup = templateTileLookups.get(templateName);
                var image = null;
                if (templateTileLookup != null) {
                    image = templateTileLookup.get(gid).image;
                }
                else {
                    image = levelTileLookup.get(gid).image;
                }
                spikes.push(new go.Spike(rect, imageRot, spikeRot, image));
                break;

                    
            case "ball":
                var x = parseInt(getAttribute("x", obj, templateObject));
                var y = parseInt(getAttribute("y", obj, templateObject));
                var w = parseInt(getAttribute("width", obj, templateObject));
                var h = parseInt(getAttribute("height", obj, templateObject));
                var rect = tiledRectangle(x, y, w, h, 0, true);

                var pos = rect.center();
                let size = rect.w / 2;

                var speed = getProperty("speed", obj, templateObject);
                var centerIdx = getProperty("center", obj, templateObject);
                var lineIdx = getProperty("line", obj, templateObject);

                if (centerIdx != null && centerIdx != 0) {
                    // Ball rotating around some center
                    var centerObj = root.querySelectorAll(`object[id='${centerIdx}']`)[0]

                    var x = parseInt(getAttribute("x", obj, templateObject));
                    var y = parseInt(getAttribute("y", obj, templateObject));
                    
                    var center = tiledVector(centerObj);
                    let radius = pos.subtract(center).length();
                    let angle = Math.atan2(pos.y - center.y, pos.x - center.x);
                    speed = speed / 180 * Math.PI;
                    balls.push(new go.DeathBallCircle(center, radius, speed, size, angle));
                }
                else {
                    // Ball moving along some line
                    if (lineIdx != 0) {
                        var lineObj = root.querySelectorAll(`object[id='${lineIdx}']`)[0]
                        var polyline = lineObj.getElementsByTagName("polyline")[0];
                        var pointsString = polyline.getAttribute("points");
                        var pairs = pointsString.split(" ");
                        var points = pairs.map(
                            str => str.split(",").map(s => parseFloat(s))
                        );
                        
                        let p = tiledVector(lineObj);
                        let p1 = new utils.Vector(points[0][0], points[0][1]);
                        let p2 = new utils.Vector(points[1][0], points[1][1]);
                        
                        p1 = p.add(p1);
                        p2 = p.add(p2);
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

    
    let level = new go.Level(name, description, path, spawn, balls, spikes, checkpoints, coins, keys, doors, goal, texts, tileMap, backgroundcolor);
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
        this.animated = false;
    }

    getImage() {
        return this.image;
    }
}


export class AnimatedTile {
    constructor(images, imagePaths, durations, id, collision=false, friction=null, randomize=true){
        this.images = images;
        this.durations = durations;
        this.imagePaths = imagePaths;
        this.id = id;
        this.collision = (collision == null) ? false : collision;
        this.friction = (friction == null || friction < 0) ? cfg.FRICTION_DEFAULT : friction;
        this.numFrames = this.images.length;
        this.index = randomize ? utils.randomInt(0, this.numFrames) : 0;
        this.currentDuration = this.durations[this.index];
        this.currentImage = this.images[this.index];
        this.timer = randomize ? utils.random(0, this.currentDuration) : 0;
        this.animated = true;
    }

    update(dT) {
        this.timer += dT;
        if (this.timer >= this.currentDuration) {
            this.index = (this.index + 1) % this.numFrames;
            this.timer = this.timer % this.currentDuration;
            this.currentDuration = this.durations[this.index];
            this.currentImage = this.images[this.index];
        }
    }

    getImage() {
        return this.currentImage;
    }

    copy() {
        return new AnimatedTile(this.images, this.imagePaths, this.durations, this.id, this.collision, this.friction, true);
    }
}


export class Tileset {
    constructor(name){
        this.name = name;
        this.tiles = new Map();
    }
}

export class TilemapTileset extends Tileset {
    constructor(name, path, image, tileWidth=16, tileHeight=16, root) {
        super(name);
        this.image = image;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.ncols = Math.round(image.width / tileWidth);
        this.nrows = Math.round(image.height / tileHeight);

        let tempCanvas = document.createElement("canvas");
        let tempCtx = tempCanvas.getContext("2d");
        tempCtx.drawImage(image, 0, 0, image.width, image.height);

        // We must handle the animations after ALL tile images have been loaded
        let animationCandidates = new Map();

        for (let row = 0; row < this.nrows; row++) {
            for (let col = 0; col < this.ncols; col++) {
                let id = row * this.ncols + col;
                let x = col * this.tileWidth;
                let y = row * this.tileHeight;
                let data = tempCtx.getImageData(x, y, tileHeight, tileWidth, tileHeight);
                let tileImage = dataToImage(data);

                let spec = root.querySelectorAll(`tile[id='${id}']`)[0];
                if (spec == null) {
                    continue;
                }

                let collision = spec.querySelectorAll("property[name='collision']")[0];
                if (collision != null) {
                    collision = (collision.getAttribute("value") == "true");
                }
                let friction = spec.querySelectorAll("property[name='friction']")[0];
                if (friction != null) {
                    friction = friction.getAttribute("value");
                }

                let animation = spec.getElementsByTagName("animation")[0];
                if (animation != null) {
                    animationCandidates.set(id, spec);
                }

                let tile = new Tile(tileImage, path, id, collision, friction);
                this.tiles.set(id, tile);
            }
        }

        let animationTiles = new Map();

        for (const [id, spec] of animationCandidates) {
            let tile = this.tiles.get(id);
            let animation = spec.getElementsByTagName("animation")[0];
            let images = [];
            let durations = [];
            let imagePaths = [];

            let frames = animation.getElementsByTagName("frame");

            for (let i = 0; i < frames.length; i++) {
                let frame = frames[i];
                let refId = parseInt(frame.getAttribute("tileid"));
                // Tiled uses milliseconds, we use seconds
                let duration = parseFloat(frame.getAttribute("duration")) / 1000;

                let refTile = this.tiles.get(refId);
                images.push(refTile.image);
                durations.push(duration);
                imagePaths.push(refTile.path)
            }

            animationTiles.set(id, new AnimatedTile(images, imagePaths, durations, id, tile.collision, tile.friction));
        }

        for (const [id, animatedTile] of animationTiles) {
            this.tiles.set(id, animatedTile);
        }
    }
}


export class ImageTileset extends Tileset {
    constructor(name, root){
        super(name);

        let specs = root.getElementsByTagName("tile");

        // We must handle the animations after ALL tile images have been loaded
        let animationCandidates = new Map();

        for (let i = 0; i < specs.length; i++) {
            let spec = specs[i];
            let id = parseInt(spec.getAttribute("id"));
            let imageSpec = spec.getElementsByTagName("image")[0]
            let imagePath = ASSET_DIR + imageSpec.getAttribute("source");
            let image = getSprite(imagePath);

            let collision = spec.querySelectorAll("property[name='collision']")[0];
            if (collision != null) {
                collision = (collision.getAttribute("value") == "true");
            }
            let friction = spec.querySelectorAll("property[name='friction']")[0];
            if (friction != null) {
                friction = friction.getAttribute("value");
            }
            
            let animation = spec.getElementsByTagName("animation")[0];
            if (animation != null) {
                animationCandidates.set(id, spec);
            }

            let tile = new Tile(image, imagePath, id, collision, friction);
            this.tiles.set(id, tile);
        }
        
        let animationTiles = new Map();

        for (const [id, spec] of animationCandidates) {
            let tile = this.tiles.get(id);
            let animation = spec.getElementsByTagName("animation")[0];
            let images = [];
            let durations = [];
            let imagePaths = [];

            let frames = animation.getElementsByTagName("frame");

            for (let i = 0; i < frames.length; i++) {
                let frame = frames[i];
                let refId = parseInt(frame.getAttribute("tileid"));
                // Tiled uses milliseconds, we use seconds
                let duration = parseFloat(frame.getAttribute("duration")) / 1000;

                let refTile = this.tiles.get(refId);
                images.push(refTile.image);
                durations.push(duration);
                imagePaths.push(refTile.path)
            }

            animationTiles.set(id, new AnimatedTile(images, imagePaths, durations, id, tile.collision, tile.friction));
        }

        for (const [id, animatedTile] of animationTiles) {
            this.tiles.set(id, animatedTile);
        }
    }
}


export function loadLevelFromIndex(index) {
    let path = LEVEL_FILES[index];
    let xml = LEVEL_XMLS.get(path);
    return levelFromXml(xml, path);
}


export async function init() {
    // Initialize the tileset object

    for (const [path, xml] of TILESET_XMLS.entries()) {
        // https://www.w3schools.com/jsref/met_document_queryselector.asp
        let root = xml.getElementsByTagName("tileset")[0];

        let name = root.getAttribute("name");
        // Check if the tileset is a collection of images or a single image
        let image = root.querySelectorAll("tileset > image")[0];
        let imagePath = (image != null) ? image.getAttribute("source") : null;

        if (imagePath) {
            // If there is an image, we have a single tilemap tileset
            imagePath = ASSET_DIR + imagePath;
            let image = getSprite(imagePath);
            await image.decode();
            let tileWidth = root.getAttribute("tilewidth");
            let tileHeight = root.getAttribute("tileheight");
            let tileset = new TilemapTileset(name, imagePath, image, tileWidth, tileHeight, root);
            TILESETS.set(name, tileset);
        }
        else {
            // Otherwise, the tileset is a collection of separate image files
            let tileset = new ImageTileset(name, root);
            TILESETS.set(name, tileset);
        }
    }
}
