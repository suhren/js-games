import {Vector, Rectangle, Circle} from './utils.js';


export class DeathBallCircle {
    
    constructor(center, radius=75, speed=0.08){
        this.size_radius = 16;
        this.radius = radius;
        this.center = center;
        this.angle = 0;
        this.speed = speed;
    }

    getRectangle() {
        let x = this.center.x + Math.cos(this.angle) * this.radius;  
        let y = this.center.y + Math.sin(this.angle) * this.radius;
        x = x - this.size_radius;
        y = y - this.size_radius;
        let w = 2 * this.size_radius;
        let h = 2 * this.size_radius;
        return new Rectangle(x, y, w, h);    
    }

    getCircle() {
        let x = this.center.x + Math.cos(this.angle) * this.radius;  
        let y = this.center.y + Math.sin(this.angle) * this.radius;
        return new Circle(new Vector(x, y), this.size_radius);
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

    constructor(start, end, speed=0.08){
        this.size_radius = 16;
        this.start = start;
        this.end = end;
        this.speed = speed;
        this.t = 0.0; // Between 0.0 and 1.0
        this.vel = 1.0;
        this.delta = this.end.subtract(this.start);
    }

    getRectangle() {
        // If t = 0.0 -> At start point, t = 1.0 -> At end point
        let pos = this.start.add(this.delta.multiply(this.t));
        let x = pos.x - this.size_radius;
        let y = pos.y - this.size_radius;
        let w = 2 * this.size_radius;
        let h = 2 * this.size_radius;
        return new Rectangle(x, y, w, h);    
    }
    
    getCircle() {
        let pos = this.start.add(this.delta.multiply(this.t));
        return new Circle(pos, this.size_radius);
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
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(this.end.x, this.end.y);
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
        this.acceleration = 1;
        this.friction = 0.5;
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