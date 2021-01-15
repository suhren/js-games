import {Vector, Rectangle, Circle} from './utils.js';
import {FRICTION_DEFAULT} from './assets.js';

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
        return new Rectangle(x, y, w, h);    
    }

    getCircle() {
        let x = this.center.x + Math.cos(this.angle) * this.radius;  
        let y = this.center.y + Math.sin(this.angle) * this.radius;
        return new Circle(new Vector(x, y), this.size);
    }

    update_position() {
        this.angle = this.angle + this.speed;
    }

    drawMovement(ctx) {
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, false);
        ctx.strokeStyle = "#CCC";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, 2, 0, Math.PI * 2, false);
        ctx.strokeStyle = "#CCC";
        ctx.stroke();
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

    getRectangle() {
        // t = 0.0: At start point, t = 1.0: At end point
        let pos = this.p1.add(this.delta.multiply(this.t));
        let x = pos.x - this.size;
        let y = pos.y - this.size;
        let w = 2 * this.size;
        let h = 2 * this.size;
        return new Rectangle(x, y, w, h);    
    }
    
    getCircle() {
        let pos = this.p1.add(this.delta.multiply(this.t));
        return new Circle(pos, this.size);
    }


    update_position() {
        if (this.t <= 0.0) {
            this.vel = this.speed;
        }
        if (this.t > 1.0) {
            this.vel = -this.speed;
        }
        this.t += this.vel;
    }

    drawMovement(ctx) {
        ctx.strokeStyle = "#CCC";
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.stroke();
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
    
    draw(ctx) {
        if (this.active) {
            ctx.fillStyle = "lime";
        }
        else {
            ctx.fillStyle = "darkgreen";
        }
        let rect = this.getRectangle();
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
}


export class Goal {

    constructor(rectangle){
        this.rectangle = rectangle;
        this.activated = false;
    }

    getRectangle() {
        return this.rectangle;    
    }
    
    draw(ctx) {
        if (this.activated) {
            ctx.fillStyle = "aqua";
        }
        else {
            ctx.fillStyle = "blue";
        }
        let rect = this.getRectangle();
        ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    }
}

export var TILE_SIZE = 32;

export class Level {
    constructor(name, playerStart, deathBalls, checkpoints, goal, tileMap) {
        this.name = name;
        this.playerStart = playerStart;
        this.deathBalls = deathBalls;
        this.checkpoints = checkpoints;
        this.goal = goal;
        this.tileMap = tileMap;
        this.nrows = this.tileMap.length;
        this.ncols = this.tileMap[0].length;        
        this.width = this.ncols * TILE_SIZE;
        this.height = this.nrows * TILE_SIZE;            
    }
}


export var ACCELERATION_DEFAULT = 1.2;

// Establish the Player, aka WHAT IS THE PLAYER!?
export class Player {
    constructor(start = new Vector()) {
        this.start = start;
        this.pos = start;
        this.width = 32;
        this.height = 32;
        this.vel = new Vector();
        this.wish = new Vector();
        this.maxSpeed = 4;
        this.acceleration = ACCELERATION_DEFAULT;
        this.friction = FRICTION_DEFAULT;
        this.activeCheckpoint = null;                 
    }

    respawn() {
        if (this.activeCheckpoint != null) {
            let pos = this.activeCheckpoint.getRectangle().center();
            pos.x -= this.width / 2;
            pos.y -= this.height / 2;
            this.pos = pos;
        }
        else {
            this.pos = this.start;
        }
        this.vel.x = 0;
        this.vel.y = 0;
    }

    getRectangle() {
        return new Rectangle(this.pos.x, this.pos.y, this.width, this.height);    
    }
}