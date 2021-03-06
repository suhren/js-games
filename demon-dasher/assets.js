import * as utils from "./utils.js";
import * as go from "./objects.js";
import * as cfg from "./config.js";


export var TILES = new Map();
export var SPRITESHEET_PLAYER_IDLE_LEFT = null;
export var SPRITESHEET_PLAYER_IDLE_RIGHT = null;
export var SPRITESHEET_PLAYER_RUN_LEFT = null;
export var SPRITESHEET_PLAYER_RUN_RIGHT = null;
export var SPRITESHEET_PLAYER_DASH_LEFT = null;
export var SPRITESHEET_PLAYER_DASH_RIGHT = null;
export var SPRITESHEET_PLAYER_EXPLODE = null;
export var SPRITESHEET_PLAYER_SPIRIT = null;


function getFileName(path) {
    return path.replace(/^.*[\\\/]/, "").replace(/\.[^/.]+$/, "");
}


function getDirectory(path) {
    return path.split("/").slice(0,-1).join("/");
}


async function getImage(url) {
    // https://stackoverflow.com/questions/52059596/loading-an-image-on-web-browser-using-promise
    return new Promise(function (resolve, reject) {
        let image = new Image();
        image.addEventListener("load", () => resolve(image));
        image.addEventListener("error", (err) => reject(err));
        image.src = url;
    });
}

async function getAudio(url) {
    return new Promise(function (resolve, reject) {
        let audio = new Audio(url);
        audio.addEventListener("canplaythrough", () => resolve(audio));
        audio.addEventListener("error", (err) => reject(err));
        audio.load();
    });
}


export var GAME_AUDIO = null;
export var GOAL_AUDIO = null;
export var DOOR_AUDIO = null;
export var PLAYER_DASH_AUDIO = null;
export var PLAYER_DEATH_AUDIO = null;
export var CHECKPOINT_AUDIO = null;
export var COIN_AUDIO = null;


export function playAudio(audio) {
    audio.currentTime = 0;
    audio.play();
}


// Template XML (Tiled .tx) files
export var TEMPLATES = [];
export const TEMPLATE_FILES = [
    "./assets/templates/ball.tx",
    "./assets/templates/ball2.tx",
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
export var TEMPLATE_XMLS = new Map();

// Level XML (Tiled .tmx) files
export var LEVELS = [];
export const LEVEL_FILES = [
    "./assets/levels/level01.tmx",
    "./assets/levels/level02.tmx",
    "./assets/levels/level03.tmx",
    "./assets/levels/level04.tmx",
    "./assets/levels/level05.tmx",
    "./assets/levels/level06.tmx",
    "./assets/levels/level07.tmx",
    "./assets/levels/level08.tmx",
    "./assets/levels/level09.tmx",
    "./assets/levels/level10.tmx",
    "./assets/levels/level11.tmx",
    "./assets/levels/level12.tmx",
    "./assets/levels/level13.tmx",
    "./assets/levels/level14.tmx",
    "./assets/levels/level15.tmx",
    "./assets/levels/level16.tmx",
    "./assets/levels/level17.tmx",
    "./assets/levels/level18.tmx",
    "./assets/levels/level19.tmx",
    "./assets/levels/level20.tmx"
];
export var LEVEL_XMLS = new Map();
export const NUM_LEVELS = LEVEL_FILES.length;

// Tileset XML (Tiled .tsx) files
const TILESET_FILES = [
    "./assets/images/tileset_common/tileset_common.tsx",
    "./assets/images/tileset_dungeon/tileset_dungeon.tsx",
    "./assets/images/tileset_floaty/tileset_floaty.tsx",
    "./assets/images/tileset_floaty/tileset_floaty2.tsx",
    "./assets/images/tileset_talisman/tileset_talisman.tsx"
];
export var TILESET_XMLS = new Map();
export var TILESETS = new Map();


export async function init() {

    // Initialize the assets
    GAME_AUDIO = await getAudio("assets/sounds/GameX_2021_extended.mp3");
    GAME_AUDIO.volume = 0.15;
    GAME_AUDIO.playbackRate = 1;
    GAME_AUDIO.loop = true;

    GOAL_AUDIO = await getAudio("assets/sounds/mixkit-retro-arcade-casino-notification-211.wav");
    GOAL_AUDIO.volume = 0.25;
    GOAL_AUDIO.playbackRate = 1;
    GOAL_AUDIO.loop = false;

    DOOR_AUDIO = await getAudio("assets/sounds/mixkit-mechanical-crate-pick-up-3154.wav");
    DOOR_AUDIO.volume = 0.25;
    DOOR_AUDIO.playbackRate = 4;
    DOOR_AUDIO.loop = false;

    PLAYER_DASH_AUDIO = await getAudio("assets/sounds/mixkit-arcade-retro-jump-223.wav");
    PLAYER_DASH_AUDIO.volume = 0.20;
    PLAYER_DASH_AUDIO.playbackRate = 4;
    PLAYER_DASH_AUDIO.loop = false;

    PLAYER_DEATH_AUDIO = await getAudio("assets/sounds/mixkit-sci-fi-laser-in-space-sound-2825.wav");
    PLAYER_DEATH_AUDIO.volume = 0.4;
    PLAYER_DEATH_AUDIO.playbackRate = 2;
    PLAYER_DEATH_AUDIO.loop = false;

    CHECKPOINT_AUDIO = await getAudio("assets/sounds/mixkit-player-jumping-in-a-video-game-2043.wav")
    CHECKPOINT_AUDIO.volume = 0.25;
    CHECKPOINT_AUDIO.playbackRate = 0.5;
    CHECKPOINT_AUDIO.loop = false;

    COIN_AUDIO = await getAudio("assets/sounds/mixkit-explainer-video-game-alert-sweep-236.wav")
    COIN_AUDIO.volume = 0.25;
    COIN_AUDIO.playbackRate = 1;
    COIN_AUDIO.loop = false;


    // First load XML files
    for (let i = 0; i < TEMPLATE_FILES.length; i++) {
        let path = TEMPLATE_FILES[i];
        let xml = await getXML(path);
        TEMPLATE_XMLS.set(getFileName(path), xml);
    }
    for (let i = 0; i < LEVEL_FILES.length; i++) {
        let path = LEVEL_FILES[i];
        let xml = await getXML(path);
        LEVEL_XMLS.set(path, xml);
    }
    for (let i = 0; i < TILESET_FILES.length; i++) {
        let path = TILESET_FILES[i];
        let xml = await getXML(path);
        TILESET_XMLS.set(path, xml);
    }

    SPRITESHEET_PLAYER_IDLE_LEFT = await getImage("assets/images/tileset_player/playerIdleLeft.png");
    SPRITESHEET_PLAYER_IDLE_RIGHT = await getImage("assets/images/tileset_player/playerIdleRight.png");
    SPRITESHEET_PLAYER_RUN_LEFT = await getImage("assets/images/tileset_player/playerRunLeft.png");
    SPRITESHEET_PLAYER_RUN_RIGHT = await getImage("assets/images/tileset_player/playerRunRight.png");
    SPRITESHEET_PLAYER_DASH_LEFT = await getImage("assets/images/tileset_player/playerDashLeft.png");
    SPRITESHEET_PLAYER_DASH_RIGHT = await getImage("assets/images/tileset_player/playerDashRight.png");
    SPRITESHEET_PLAYER_EXPLODE = await getImage("assets/images/tileset_player/explosion.png");
    SPRITESHEET_PLAYER_SPIRIT = await getImage("assets/images/tileset_player/spirit.png");
    
    for (const [path, xml] of TILESET_XMLS.entries()) {
        // https://www.w3schools.com/jsref/met_document_queryselector.asp
        let root = xml.getElementsByTagName("tileset")[0];
        let name = getFileName(path); //root.getAttribute("name");
        // Check if the tileset is a collection of images or a single image
        let image = root.querySelectorAll("tileset > image")[0];
        let xmlDir = getDirectory(path)
        let imagePath = (image != null) ? xmlDir + "/" + image.getAttribute("source") : null;
        let specs = root.getElementsByTagName("tile");

        if (imagePath) {
            // If there is an image, we have a single tilemap tileset
            let image = await getImage(imagePath);
            let w = root.getAttribute("tilewidth");
            let h = root.getAttribute("tileheight");
            let ncols = Math.round(image.width / w);
            let nrows = Math.round(image.height / h);
            
            let tempCanvas = document.createElement("canvas");
            let tempCtx = tempCanvas.getContext("2d");
            tempCtx.drawImage(image, 0, 0, image.width, image.height);
            
            let tileImages = new Map();
            for (let row = 0; row < nrows; row++) {
                for (let col = 0; col < ncols; col++) {
                    let id = row * ncols + col;
                    let data = tempCtx.getImageData(col * w, row * h, w, h);
                    let tileImage = dataToImage(data);
                    tileImages.set(id, tileImage);
                }
            }

            TILESETS.set(name, new Tileset(name, tileImages, specs));
        }
        else {
            // Otherwise, the tileset is a collection of separate image files
            let tileImages = new Map();
            for (let i = 0; i < specs.length; i++) {
                let spec = specs[i];
                let id = parseInt(spec.getAttribute("id"));
                let imageSpec = spec.getElementsByTagName("image")[0]
                let imagePath = xmlDir + "/" + imageSpec.getAttribute("source");
                let image = await getImage(imagePath);
                tileImages.set(id, image);
            }
            TILESETS.set(name, new Tileset(name, tileImages, specs));
        }
    }
}


export class Tileset {
    constructor(name, tileImages, specs) {
        this.name = name;
        this.tiles = new Map();
        tileImages.forEach((image, id) => this.tiles.set(id, new Tile(image, id, null, null)));

        // We must handle the animations after ALL tile images have been loaded
        let animationCandidates = new Map();

        for (let i = 0; i < specs.length; i++) {
            let spec = specs[i];
            let id = parseInt(spec.getAttribute("id"));
            let tile = this.tiles.get(id);
            if (tile == null) {
                continue;
            }
            let collisionSpec = spec.querySelectorAll("property[name='collision']")[0];
            if (collisionSpec != null) {
                tile.collision = (collisionSpec.getAttribute("value") == "true");
            }
            let frictionSpec = spec.querySelectorAll("property[name='friction']")[0];
            if (frictionSpec != null) {
                let friction = frictionSpec.getAttribute("value");
                if (friction >= 0) {
                    tile.friction = friction;
                }
            }
            let animation = spec.getElementsByTagName("animation")[0];
            if (animation != null) {
                animationCandidates.set(id, spec);
            }
        }
        
        let animationTiles = new Map();

        for (const [id, spec] of animationCandidates) {
            let tile = this.tiles.get(id);
            let animation = spec.getElementsByTagName("animation")[0];
            let images = [];
            let durations = [];

            let frames = animation.getElementsByTagName("frame");

            for (let i = 0; i < frames.length; i++) {
                let frame = frames[i];
                let refId = parseInt(frame.getAttribute("tileid"));
                // Tiled uses milliseconds, we use seconds
                let duration = parseFloat(frame.getAttribute("duration")) / 1000;
                let refTile = this.tiles.get(refId);
                images.push(refTile.image);
                durations.push(duration);
            }
            
            animationTiles.set(id, new AnimatedTile(images, durations, id, tile.collision, tile.friction));
        }

        for (const [id, animatedTile] of animationTiles) {
            this.tiles.set(id, animatedTile);
        }
    }
}


function getXML(url) {
    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseXML
    // https://stackoverflow.com/questions/48969495/in-javascript-how-do-i-should-i-use-async-await-with-xmlhttprequest
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.overrideMimeType("application/xml");
        xhr.onload = function () {
            var status = xhr.status;
            if (status == 200) {
                resolve(xhr.responseXML);
            } else {
                reject(status);
            }
        };
        xhr.send();
    });
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



function levelFromXml(index, xml, path) {

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
        let tilesetSpecs = template.getElementsByTagName("tileset");
        if (tilesetSpecs != null && tilesetSpecs.length > 0) {
            var lookup = new Map();
            for (let i = 0; i < tilesetSpecs.length; i++) {
                var spec = tilesetSpecs[i];
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

    let objectLayers = root.getElementsByTagName("objectgroup");

    let spawn = null;
    let checkpoints = [];
    let balls = [];
    let texts = [];
    let goal = null;
    let coins = [];
    let keys = [];
    let doors = [];
    let spikes = [];

    for (let objLayerIdx = 0; objLayerIdx < objectLayers.length; objLayerIdx++) {
        let objectLayer = objectLayers[objLayerIdx];
        let objects = objectLayer.getElementsByTagName("object");

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
                    var gid = parseInt(getAttribute("gid", obj, templateObject));
                    var templateTileLookup = templateTileLookups.get(templateName);
                    var tile = null;
                    if (templateTileLookup != null) {
                        tile = templateTileLookup.get(gid);
                    }
                    else {
                        tile = levelTileLookup.get(gid);
                    }
                    coins.push(new go.Coin(rect, tile.copy()));
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
                case "ball2":
                    var x = parseInt(getAttribute("x", obj, templateObject));
                    var y = parseInt(getAttribute("y", obj, templateObject));
                    var w = parseInt(getAttribute("width", obj, templateObject));
                    var h = parseInt(getAttribute("height", obj, templateObject));
                    var rect = tiledRectangle(x, y, w, h, 0, true);

                    var gid = parseInt(getAttribute("gid", obj, templateObject));
                    var templateTileLookup = templateTileLookups.get(templateName);
                    var tile = null;
                    if (templateTileLookup != null) {
                        tile = templateTileLookup.get(gid);
                    }
                    else {
                        tile = levelTileLookup.get(gid);
                    }

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
                        balls.push(new go.DeathBallCircle(center, tile.copy(), radius, speed, size, angle));
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
                            
                            // Origin point of the lien object
                            let origin = tiledVector(lineObj);

                            if (points.length == 2) {
                                // Two points forming a single line
                                let p1 = new utils.Vector(points[0][0], points[0][1]);
                                let p2 = new utils.Vector(points[1][0], points[1][1]);
                                
                                p1 = origin.add(p1);
                                p2 = origin.add(p2);
                                speed = speed / 100;
    
                                // Relative to p1: the length from p1 to the projection
                                // should be proportional to t
                                let lineVector = p2.subtract(p1);
                                let proj =  pos.subtract(p1).project(lineVector);                    
                                let t = proj.length() / lineVector.length();
                                balls.push(new go.DeathBallLinear(p1, p2, tile.copy(), speed, size, t));
                            }
                            else if (points.length > 2) {
                                // More than Two points forming a polygon
                                
                                // First determine if the polygon is closed.
                                // I.e. if the coordinate of the final point is the same as the first point
                                // (Close enough according to some epsilon distance)
                                let n = points.length;
                                let vecs = points.map(p => new utils.Vector(origin.x + p[0], origin.y + p[1]));
                                let firstPoint = vecs[0];
                                let lastPoint = vecs[n-1];
                                speed = speed / 100;
                                
                                let d = lastPoint.subtract(firstPoint).length();
                                let loop = (d < 0.5);

                                let segments = []
                                // Skip last vector if it is in same position as first
                                if (loop) {
                                    for (let idx = 1; idx < vecs.length-1; idx++) {
                                        segments.push([vecs[idx-1], vecs[idx]]);
                                    }
                                    segments.push([vecs[n-2], vecs[0]]);
                                }
                                else {
                                    for (let idx = 1; idx < vecs.length; idx++) {
                                        segments.push([vecs[idx-1], vecs[idx]]);
                                    }
                                }

                                // First figure out which line segment is closest
                                let smallestDist = 9999999;
                                let smallestIdx = 0;
                                let tStart = 0;
                                let posStart = null;

                                for (let idx = 0; idx < segments.length; idx++) {
                                    let p1 = segments[idx][0];
                                    let p2 = segments[idx][1];
                                    let xMin = Math.min(p1.x, p2.x);
                                    let yMin = Math.min(p1.y, p2.y);
                                    let xMax = Math.max(p1.x, p2.x);
                                    let yMax = Math.max(p1.y, p2.y);
                                    let lineVector = p2.subtract(p1);
                                    let proj =  pos.subtract(p1).project(lineVector).add(p1);                    
                                    proj.x = utils.clamp(proj.x, xMin, xMax);
                                    proj.y = utils.clamp(proj.y, yMin, yMax);
                                    let t = proj.subtract(p1).length() / lineVector.length();
                                    
                                    let dist = proj.subtract(pos).length();
                                    if (dist < smallestDist) {
                                        smallestIdx = idx;
                                        smallestDist = dist;
                                        tStart = t;
                                        posStart = proj;
                                    }
                                }
                                balls.push(new go.DeathBallPolygon(segments, smallestIdx, tStart, tile.copy(), loop, speed, size));
                            }
                        }
                    }
                    break;
            }
        }
    }

    
    let level = new go.Level(index, name, description, path, spawn, balls, spikes, checkpoints, coins, keys, doors, goal, texts, tileMap, backgroundcolor);
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
    constructor(image, id, collision=false, friction=null){
        this.image = image;
        this.id = id;
        this.collision = (collision == null) ? false : collision;
        this.friction = (friction == null || friction < 0) ? cfg.FRICTION_DEFAULT : friction;
        this.animated = false;
    }

    update(dT) {
        return;
    }

    getImage() {
        return this.image;
    }
}


export class AnimatedTile {
    constructor(images, durations, id, collision=false, friction=null, randomize=true){
        this.images = images;
        this.durations = durations;
        this.id = id;
        this.collision = (collision == null) ? false : collision;
        this.friction = (friction == null || friction < 0) ? cfg.FRICTION_DEFAULT : friction;
        this.numFrames = this.images.length;
        this.index = randomize ? utils.randomInt(0, this.numFrames) : 0;
        this.currentDuration = this.durations[this.index];
        this.currentImage = this.images[this.index];
        this.timer = randomize ? utils.random(0, this.currentDuration) : 0;
        this.animated = true;
        this.redraw = false;
    }

    update(dT) {
        this.timer += dT;
        if (this.timer >= this.currentDuration) {
            this.index = (this.index + 1) % this.numFrames;
            this.timer = this.timer % this.currentDuration;
            this.currentDuration = this.durations[this.index];
            this.currentImage = this.images[this.index];
            this.redraw = true;
        }
    }

    set drawRequired(value) {
        this.redraw = value;
    }

    get drawRequired() {
        return this.redraw;
    }

    getImage() {
        return this.currentImage;
    }

    copy() {
        return new AnimatedTile(this.images, this.durations, this.id, this.collision, this.friction, true);
    }
}

export function loadLevelFromIndex(index) {
    let path = LEVEL_FILES[index];
    let xml = LEVEL_XMLS.get(path);
    return levelFromXml(index, xml, path);
}
