import * as utils from './utils.js';
import * as cfg from './config.js';


export class Text {
    
    constructor(text, pixelsize, rectangle, wrap) {
        this.text = text;
        this.pixelsize = (pixelsize != null) ? pixelsize : 16;
        this.rectangle = rectangle;
        this.wrap = wrap;
    }
}


export class DeathBallCircle {
    
    constructor(center, radius=75, speed=0.08, size=16, angle=0){
        this.size = size;
        this.radius = radius;
        this.center = center;
        this.angle = angle;
        this.speed = speed;
    }

    getRectangle() {
        let x = this.center.x + Math.cos(this.angle) * this.radius;  
        let y = this.center.y + Math.sin(this.angle) * this.radius;
        x = x - this.size;
        y = y - this.size;
        let w = 2 * this.size;
        let h = 2 * this.size;
        return new utils.Rectangle(x, y, w, h);    
    }

    getCircle() {
        let x = this.center.x + Math.cos(this.angle) * this.radius;  
        let y = this.center.y + Math.sin(this.angle) * this.radius;
        return new utils.Circle(new utils.Vector(x, y), this.size);
    }

    update(dT) {
        this.angle = this.angle + this.speed * dT;
    }
}


export class DeathBallLinear {

    constructor(p1, p2, speed=0.08, size=16, t=0.0){
        this.size = size;
        this.p1 = p1;
        this.p2 = p2;
        this.speed = Math.abs(speed);
        this.t = t; // Between 0.0 and 1.0
        this.vel = speed;
        this.delta = this.p2.subtract(this.p1);
    }

    getOffset() {
        // We want this to be a smooth transition from 0 to 1
        return 0.5 * (Math.cos((this.t + 1) * Math.PI) + 1);
    }

    getRectangle() {
        // t = 0.0: At start point, t = 1.0: At end point
        let pos = this.p1.add(this.delta.multiply(this.getOffset()));
        let x = pos.x - this.size;
        let y = pos.y - this.size;
        let w = 2 * this.size;
        let h = 2 * this.size;
        return new utils.Rectangle(x, y, w, h);    
    }
    
    getCircle() {
        let pos = this.p1.add(this.delta.multiply(this.getOffset()));
        return new utils.Circle(pos, this.size);
    }


    update(dT) {
        if (this.t <= 0.0) {
            this.vel = this.speed;
        }
        if (this.t > 1.0) {
            this.vel = -this.speed;
        }
        this.t += this.vel * dT;
    }
}


export class Checkpoint {

    constructor(rectangle){
        this.rectangle = rectangle;
        this.active = false;
    }
    getRectangle() {
        return this.rectangle;    
    }
}


export class Goal {

    constructor(rectangle) {
        this.rectangle = rectangle;
        this.activated = false;
    }

    getRectangle() {
        return this.rectangle;    
    }
}

export class Level {
    constructor(name, playerStart, deathBalls, checkpoints, goal, texts, tileMap) {
        this.name = name;
        this.playerStart = playerStart;
        this.deathBalls = deathBalls;
        this.checkpoints = checkpoints;
        this.goal = goal;
        this.texts = texts;
        this.tileMap = tileMap;
        this.nrows = this.tileMap.length;
        this.ncols = this.tileMap[0].length;        
        this.width = this.ncols * cfg.TILE_SIZE;
        this.height = this.nrows * cfg.TILE_SIZE;            
    }
}


function coordToTile(x) {
    return Math.floor(x / cfg.TILE_SIZE);
}

// Establish the Player, aka WHAT IS THE PLAYER!?
export class Player {
    constructor(start = new utils.Vector()) {
        this.start = start;
        this.pos = start;
        this.width = 16;
        this.height = 16;
        this.vel = new utils.Vector();
        this.wish = new utils.Vector();
        this.maxSpeed = cfg.PLAYER_MAX_SPEED;
        this.acceleration = cfg.PLAYER_ACCELERATION_DEFAULT;
        this.friction = cfg.FRICTION_DEFAULT;
        this.activeCheckpoint = null;    
        this.col0 = 0;
        this.row0 = 0;
        this.col1 = 0;
        this.row1 = 0;           
    }

    updateMovement(level, dT) {
        
        let speed = this.vel.length();

        // The impact of friction on the player acceleration.
        // There is a minimum level of this impact so that the player
        // can still retain some control when on e.g. ice
        let frictionAccFactor = utils.clamp(this.friction / cfg.FRICTION_DEFAULT, 0.1, 1.0);
        
        // The amount of acceleration (retardation) provided by the friction 
        // It is always pointed opposite to the current velocity
        let frictionAcc = this.vel.normalize().multiply(-this.friction);
        // The friction can not reduce the velocity below zero
        let frictionVel = frictionAcc.multiply(dT).max(speed);

        let movementAcc = this.wish.normalize().multiply(this.acceleration * frictionAccFactor);
        let movementVel = movementAcc.multiply(dT);
        
        this.vel = this.vel.add(movementVel.add(frictionVel));
        this.vel = this.vel.max(this.maxSpeed);

        this.displacement = this.vel.multiply(dT)
        this.pos = this.pos.add(this.displacement);

        // Make sure we stay within bounds
        if (this.pos.x < 0) {
            this.pos.x = 0;
            this.vel.x = 0;
        }
        if (this.pos.y < 0) {
            this.pos.y = 0;
            this.vel.y = 0;
        }
        if (this.pos.x > level.width - this.width) {
            this.pos.x = level.width - this.width;
            this.vel.x = 0;
        }
        if (this.pos.y > level.height - this.height) {
            this.pos.y = level.height - this.height;
            this.vel.y = 0;
        }

        // Check intersecting tiles
        // Perform after player movement update for collisions to work correctly
        this.col0 = coordToTile(this.pos.x);
        this.row0 = coordToTile(this.pos.y);
        this.col1 = coordToTile(this.pos.x + this.width) + 1;
        this.row1 = coordToTile(this.pos.y + this.height) + 1;
        this.col0 = Math.max(this.col0, 0);
        this.row0 = Math.max(this.row0, 0);
        this.col1 = Math.min(this.col1, level.ncols);
        this.row1 = Math.min(this.row1, level.nrows);

        // Check friciton: Always pick the highest friction
        let friction = 0.0;
        for (let row = this.row0; row < this.row1; row++) {
            for (let col = this.col0; col < this.col1; col++) {
                if (!level.tileMap[row][col].collision) {
                    friction = Math.max(friction, level.tileMap[row][col].friction);
                }
            }
        }
        this.friction = friction;
    }

    respawn() {
        if (this.activeCheckpoint != null) {
            this.pos = this.activeCheckpoint.getRectangle().center();
            this.pos.x -= this.width / 2;
            this.pos.y -= this.height / 2;
        }
        else {
            this.pos = this.start.copy();
            this.pos.x -= this.width / 2;
            this.pos.y -= this.height / 2;
        }
        this.vel.x = 0;
        this.vel.y = 0;
    }

    getRectangle() {
        return new utils.Rectangle(this.pos.x, this.pos.y, this.width, this.height);    
    }
}