import * as utils from './utils.js';
import * as cfg from './config.js';



export class Particle {
    
    constructor(size, pos, rot, vel, rotationSpeed, lifeTime, color, alpha=1.0, alphaDecay=true) {
        this.size = size;
        this.pos = pos;
        this.rot = rot;
        this.vel = vel;
        this.rotationSpeed = rotationSpeed;
        this.lifeTime = lifeTime;
        this.color = color;
        this.alpha = alpha;
        this.age = 0;
        this.dead = false;
        this.alphaDelta = alphaDecay ? this.alpha / this.lifeTime : 0;
    }

    update(dT) {
        
        this.pos = this.pos.add(this.vel.multiply(dT));
        this.rot += this.rotationSpeed * dT;
        this.alpha -= this.alphaDelta * dT;

        this.age += dT;
        if (this.age > this.lifeTime) {
            this.dead = true;
        }
    }

    getRectangle() {
        let x = this.pos.x - this.size / 2;
        let y = this.pos.y - this.size / 2;
        return new utils.Rectangle(x, y, this.size, this.size);    
    }
}


function random(min, max) {  
    return Math.random() * (max - min) + min; 
}  


export class ParticleEmitter {
    
    constructor(pos, rate, sizes, rotations, moveSpeeds, rotationSpeeds, lifeTimes, color, alphas, alphaDecay=true) {
        this.pos = pos;
        this.rate = rate;
        this.sizes = sizes;
        this.rotations = rotations;
        this.moveSpeeds = moveSpeeds;
        this.rotationSpeeds = rotationSpeeds;
        this.lifeTimes = lifeTimes;
        this.color = color;
        this.alphas = alphas;
        this.alphaDecay = alphaDecay;
        this.active = false;
        this.lastEmitTimer = 0;
        this.emitTime = 1 / rate;
        this.particles = [];
    }

    update(dT) {

        // Update particles
        let deadParticles = [];
        for (let i = 0; i < this.particles.length; i++) {
            let p = this.particles[i];
            p.update(dT);
            if (p.dead) {
                deadParticles.push(p);
            }
        }
        this.particles = this.particles.filter(p => !deadParticles.includes(p));
        
        if (!this.active)
            return;
        
        this.lastEmitTimer += dT;

        if (this.lastEmitTimer > this.emitTime) {
            this.lastEmitTimer = 0;
            this.emit();
        }
    }

    emit() {
        let size = random(this.sizes[0], this.sizes[1]);
        let rotation = random(this.rotations[0], this.rotations[1]);
        let moveSpeed = random(this.moveSpeeds[0], this.moveSpeeds[1]);
        let rotationSpeed = random(this.rotationSpeeds[0], this.rotationSpeeds[1]);
        let lifeTime = random(this.lifeTimes[0], this.lifeTimes[1]);
        let alpha = random(this.alphas[0], this.alphas[1]);
        let angle = random(0, Math.PI * 2);
        let vel = new utils.Vector(moveSpeed * Math.cos(angle), moveSpeed * Math.sin(angle));

        this.particles.push(
            new Particle(size, this.pos, rotation, vel, rotationSpeed, lifeTime, this.color, alpha, this.alphaDecay)
        );
    }
}


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


export class Key {

    constructor(rectangle, color, image) {
        this.rectangle = rectangle;
        this.color = color;
        this.image = image;
        this.collected = false;
    }
}


export class Door {

    constructor(rectangle, color, image) {
        this.rectangle = rectangle;
        this.color = color;
        this.image = image;
        this.open = false;
    }
}



export class Coin {

    constructor(rectangle) {
        this.rectangle = rectangle;
        this.circle = new utils.Circle(rectangle.center(), rectangle.w / 2);
        this.collected = false;
        this.frameIndex = 0;
        this.frameTimer = 0;
    }

    update(dT) {
        if (!this.collected) {
            this.frameTimer += dT;
            if (this.frameTimer >= cfg.COIN_FRAME_DURATION) {
                this.frameIndex = (this.frameIndex + 1) % 4;
                this.frameTimer = 0;
            }
        }
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
        this.unlocked = true;
    }

    getRectangle() {
        return this.rectangle;    
    }
}

export class Level {
    constructor(name, desciption, path, playerStart, deathBalls, checkpoints, coins, keys, doors, goal, texts, tileMap) {
        this.name = name;
        this.desciption = desciption;
        this.path = path;
        this.playerStart = playerStart;
        this.deathBalls = deathBalls;
        this.checkpoints = checkpoints;
        this.coins = coins;
        this.keys = keys;
        this.doors = doors;
        this.goal = goal;
        this.goal.unlocked = (this.coins.length == 0);
        this.num_coins = this.coins.length;
        this.texts = texts;
        this.tileMap = tileMap;
        this.nrows = this.tileMap.length;
        this.ncols = this.tileMap[0].length;        
        this.width = this.ncols * cfg.TILE_SIZE;
        this.height = this.nrows * cfg.TILE_SIZE;
        this.levelTimer = 0;
        this.showCard = true;
        this.cardDuration = 2;            
    }

    update(dT) {
        this.levelTimer += dT;
        if (this.levelTimer >= this.cardDuration) {
            this.showCard = false;
        }
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
        this.width = 15;
        this.height = 15;
        this.vel = new utils.Vector();
        this.wish = new utils.Vector();
        this.lastWish  = new utils.Vector(0, 1);
        this.maxSpeed = cfg.PLAYER_MAX_SPEED;
        this.maxSpeedSlow = cfg.PLAYER_MAX_SPEED_SLOW;
        this.acceleration = cfg.PLAYER_ACCELERATION_DEFAULT;
        this.accelerationSlow = cfg.PLAYER_ACCELERATION_SLOW;
        this.friction = cfg.FRICTION_DEFAULT;
        this.activeCheckpoint = null;    
        this.col0 = 0;
        this.row0 = 0;
        this.col1 = 0;
        this.row1 = 0;
        this.dashCooldownTimer = 0;
        this.isDashingTimer = 0;
        this.isDashAvailable = true;     
        this.isDashing = false;
        this.frameIndex = 0;
        this.frameTimer = 0;
        this.keys = [];
        this.sneaking = false;
        
        this.dashParticleEmitter = new ParticleEmitter(
            this.pos,
            128,
            [2, 6],
            [0, 0],
            [16, 32],
            [-0.5, 0.5],
            [0.5, 0.75],
            "white",
            [1.0, 1.0],
            true
        );
    }

    update(level, dT) {
        
        let speed = this.vel.length();

        // The impact of friction on the player acceleration.
        // There is a minimum level of this impact so that the player
        // can still retain some control when on e.g. ice
        let frictionAccFactor = utils.clamp(this.friction / cfg.FRICTION_DEFAULT, cfg.PLAYER_FRICTION_ACC_FACTOR_MIN, 1.0);
        
        // The amount of acceleration (retardation) provided by the friction 
        // It is always pointed opposite to the current velocity
        let frictionAcc = this.vel.normalize().multiply(-this.friction);
        // The friction can not reduce the velocity below zero
        let frictionVel = frictionAcc.multiply(dT).max(speed);

        let acc = this.sneaking ? this.accelerationSlow : this.acceleration;
        let movementAcc = this.wish.normalize().multiply(acc * frictionAccFactor);
        let movementVel = movementAcc.multiply(dT);

        let maxv = this.sneaking ? this.maxSpeedSlow : this.maxSpeed;
        movementVel = movementVel.max(Math.max(maxv - speed, 0));
        
        this.vel = this.vel.add(movementVel.add(frictionVel));
        // this.vel = this.vel.max(this.maxSpeed);

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
        
        if (this.wish.length() > 0) {

            if (this.wish.x == this.lastWish.x && this.wish.y == this.lastWish.y) {
                this.frameTimer += dT;
                if (this.frameTimer >= cfg.PLAYER_FRAME_DURATION) {
                    this.frameIndex = (this.frameIndex + 1) % 4;
                    this.frameTimer = 0;
                 }
            }
            this.lastWish = this.wish.copy();
        }
        else {
            this.frameTimer = 0;
            this.frameIndex = 0;
        }

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

        if (!this.isDashAvailable) {
            this.dashCooldownTimer += dT;
            if (this.dashCooldownTimer >= cfg.PLAYER_DASH_COOLDOWN) {
                this.isDashAvailable = true;
                this.dashCooldownTimer = 0;
            }
        }

        if (this.isDashing) {
            this.isDashingTimer += dT;
            if (this.isDashingTimer >= cfg.PLAYER_DASH_TIME) {
                this.isDashing = false;
                this.isDashingTimer = 0;
            }
        }

        this.dashParticleEmitter.active = this.isDashing;
        this.dashParticleEmitter.pos = this.getRectangle().center();
        this.dashParticleEmitter.update(dT);
    }

    dash() {
        if (this.isDashAvailable) {
            let dir = this.wish.normalize();    
            if (dir.length() > 0) {
                this.vel = this.vel.add(dir.multiply(cfg.PLAYER_DASH_SPEED));
                this.isDashAvailable = false;
                this.isDashing = true;
            }
        }
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

    getCollisionRectangle() {
        return new utils.Rectangle(this.pos.x + 1, this.pos.y + 1, this.width - 2, this.height - 2);    
    }

       
}