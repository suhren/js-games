import * as utils from './utils.js';
import * as cfg from './config.js';
import * as assets from './assets.js';
import * as drawing from './drawing.js';


export class GameOject {
    constructor(pos, w = null, h = null) {
        this.pos = pos.copy();
        this.w = w;
        this.h = h;
        this.isDisposed = false;
    }

    get rect() {
        return new utils.Rectangle(this.pos.x, this.pos.y, this.w, this.h);
    }
    get circ() {
        let r = this.w / 2;
        let x = this.pos.x + r;
        let y = this.pos.y + r;
        return new utils.Circle(new utils.Vector(x, y), r);
    }

    update(level, dT) {
        return;
    }

    dispose() {
        this.isDisposed = true;
    }
}


export class Particle extends GameOject {
    
    constructor(size, pos, rot, vel, rotationSpeed, lifeTime, color, alpha=1.0, alphaDecay=true) {
        super(pos);
        this.size = size;
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
        if (this.dead)
            return;

        this.pos = this.pos.add(this.vel.multiply(dT));
        this.rot += this.rotationSpeed * dT;
        this.alpha -= this.alphaDelta * dT;

        this.age += dT;
        if (this.age > this.lifeTime) {
            this.dead = true;
        }
    }

    get rect() {
        let x = this.pos.x - this.size / 2;
        let y = this.pos.y - this.size / 2;
        return new utils.Rectangle(x, y, this.size, this.size);    
    }
}


export class ParticleEmitter extends GameOject {
    
    constructor(pos, rate, sizes, rotations, moveSpeeds, rotationSpeeds, lifeTimes, color, alphas, alphaDecay=true) {
        super(pos);
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
        let size = utils.random(this.sizes[0], this.sizes[1]);
        let rotation = utils.random(this.rotations[0], this.rotations[1]);
        let moveSpeed = utils.random(this.moveSpeeds[0], this.moveSpeeds[1]);
        let rotationSpeed = utils.random(this.rotationSpeeds[0], this.rotationSpeeds[1]);
        let lifeTime = utils.random(this.lifeTimes[0], this.lifeTimes[1]);
        let alpha = utils.random(this.alphas[0], this.alphas[1]);
        let angle = utils.random(0, Math.PI * 2);
        let vel = new utils.Vector(moveSpeed * Math.cos(angle), moveSpeed * Math.sin(angle));

        this.particles.push(
            new Particle(size, this.pos, rotation, vel, rotationSpeed, lifeTime, this.color, alpha, this.alphaDecay)
        );
    }
}


export class Text extends GameOject {
    
    constructor(text, pixelsize, rect, wrap) {
        super(new utils.Vector(rect.x, rect.y), rect.w, rect.h);
        this.text = text;
        this.pixelsize = (pixelsize != null) ? pixelsize : 16;
        this.wrap = wrap;
        this.renderer = new drawing.TextRenderer(this);
    }
}


export class DeathBallCircle extends GameOject {
    
    constructor(center, tile, radius=75, speed=0.08, size=16, angle=0) {
        super(center, 2 * size, 2 * size);
        this.size = size;
        this.radius = radius;
        this.center = center;
        this.angle = angle;
        this.speed = speed;
        this.renderer = new drawing.BallRenderer(this, tile, "circle");
    }

    update(level, dT) {
        this.renderer.update(dT);
        this.angle = this.angle + this.speed * dT;
        this.pos.x = this.center.x + Math.cos(this.angle) * this.radius - this.size;  
        this.pos.y = this.center.y + Math.sin(this.angle) * this.radius - this.size;
    }
}


export class DeathBallLinear extends GameOject{

    constructor(p1, p2, tile, speed=0.08, size=16, t=0.0) {
        super(p1, 2 * size, 2 * size);
        this.size = size;
        this.p1 = p1;
        this.p2 = p2;
        this.speed = Math.abs(speed);
        this.t = t; // Between 0.0 and 1.0
        this.vel = speed;
        this.delta = this.p2.subtract(this.p1);
        this.renderer = new drawing.BallRenderer(this, tile, "line");
    }

    getOffset() {
        // We want this to be a smooth transition from 0 to 1
        return 0.5 * (Math.cos((this.t + 1) * Math.PI) + 1);
    }

    update(level, dT) {
        this.renderer.update(dT);
        if (this.t <= 0.0) {
            this.vel = this.speed;
        }
        else if (this.t > 1.0) {
            this.vel = -this.speed;
        }
        this.t += this.vel * dT;
        this.pos = this.p1.add(this.delta.multiply(this.getOffset()));
        this.pos.x -= this.size;
        this.pos.y -= this.size;
    }
}



export class DeathBallPolygon extends GameOject{

    constructor(segments, startSegment, tStart, tile, loop=false, speed=0.08, size=16) {
        // Speed is ratio of total distance per second
        super(segments[0][0], 2 * size, 2 * size);
        this.loop = loop;
        this.size = size;
        this.segments = segments;
        this.t = tStart;
        this.semgentIdx = startSegment;
        this.fromPoint = segments[this.semgentIdx][0]
        this.toPoint = segments[this.semgentIdx][1]
        this.delta = this.toPoint.subtract(this.fromPoint);
        this.dists = this.segments.map(seg => seg[0].subtract(seg[1]).length());
        this.totalDist = this.dists.reduce((a, b) => a + b, 0)
        this.speed = Math.abs(speed * this.totalDist);
        // Ratio of each distance per second
        this.segmentSpeeds = this.dists.map(d => this.speed / d);
        this.vel = Math.sign(speed) * this.segmentSpeeds[this.semgentIdx];
        this.renderer = new drawing.BallRenderer(this, tile, "polygon");
    }

    update(level, dT) {
        this.renderer.update(dT);
        if (this.t < 0.0) {
            if (this.semgentIdx > 0 || this.loop) {
                this.semgentIdx  = (this.semgentIdx > 0) ? this.semgentIdx - 1 : this.segments.length - 1;
                this.fromPoint = this.segments[this.semgentIdx][0]
                this.toPoint = this.segments[this.semgentIdx][1]
                this.delta = this.toPoint.subtract(this.fromPoint);
                this.vel = -this.segmentSpeeds[this.semgentIdx];
                this.t = 1.0;
            }
            else {
                this.vel = this.segmentSpeeds[this.semgentIdx];
            }
        }
        else if (this.t >= 1.0) {
            if (this.semgentIdx < this.segments.length - 1  || this.loop) {
                this.semgentIdx = (this.semgentIdx + 1) % this.segments.length;
                this.fromPoint = this.segments[this.semgentIdx][0]
                this.toPoint = this.segments[this.semgentIdx][1]
                this.delta = this.toPoint.subtract(this.fromPoint);
                this.vel = this.segmentSpeeds[this.semgentIdx];
                this.t = 0;    
            }
            else {
                this.vel = -this.segmentSpeeds[this.semgentIdx];
            }
        }
        this.t += this.vel * dT;
        this.pos = this.fromPoint.add(this.delta.multiply(this.t));
        this.pos.x -= this.size;
        this.pos.y -= this.size;
    }
}


export class Key extends GameOject {
    constructor(rect, color, image) {
        super(new utils.Vector(rect.x, rect.y), rect.w, rect.h);
        this.color = color;
        this.collected = false;
        this.renderer = new drawing.KeyRenderer(this, image);
    }
}


export class Door extends GameOject {

    constructor(rect, color, image) {
        super(new utils.Vector(rect.x, rect.y), rect.w, rect.h);
        this.color = color;
        this.open = false;
        this.renderer = new drawing.DoorRenderer(this, image);
    }
}


export class Coin extends GameOject {

    constructor(rect, tile) {
        super(new utils.Vector(rect.x, rect.y), rect.w, rect.h);
        this.collected = false;
        this.renderer = new drawing.CoinRenderer(this, tile);
    }

    update(level, dT) {
        this.renderer.update(dT);
    }
}


export class Checkpoint extends GameOject {
    constructor(rect) {
        super(new utils.Vector(rect.x, rect.y), rect.w, rect.h);
        this.active = false;
        this.renderer = new drawing.CheckpointRenderer(this);
    }
}


export class Goal extends GameOject {
    constructor(rect) {
        super(new utils.Vector(rect.x, rect.y), rect.w, rect.h);
        this.activated = false;
        this.unlocked = true;
        this.renderer = new drawing.GoalRenderer(this);
    }
}


export class Spike extends GameOject {
    constructor(rect, rot, spikeRot, image) {
        super(new utils.Vector(rect.x, rect.y), rect.w, rect.h);
        this.rot = rot;
        this.spikeRot = spikeRot;
        this.renderer = new drawing.SpikeRenderer(this, image);
    }
}

export class Spawn extends GameOject {
    constructor(pos) {
        super(pos);
    }
}


export class Level {
    constructor(name, desciption, path, playerStart, deathBalls, spikes, checkpoints, coins, keys, doors, goal, texts, tileMap, backgroundColor) {
        this.name = name;
        this.desciption = desciption;
        this.path = path;
        this.playerStart = playerStart;
        this.deathBalls = deathBalls;
        this.spikes = spikes;
        this.checkpoints = checkpoints;
        this.coins = coins;
        this.keys = keys;
        this.doors = doors;
        this.goal = goal;
        if (this.goal) {
            this.goal.unlocked = (this.coins.length == 0);
        }
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
        
        this.animatedTiles = [];
        for (let row = 0; row < this.nrows; row++) {
            for (let col = 0; col < this.ncols; col++) {
                let tile = this.tileMap[row][col];
                if (tile != null && tile.animated) {
                    this.animatedTiles.push(tile);
                }
            }
        }

        this.objects = [];
        this.objects.push.apply(this.objects, deathBalls);
        this.objects.push.apply(this.objects, checkpoints);
        this.objects.push.apply(this.objects, coins);
        this.objects.push.apply(this.objects, keys);
        this.objects.push.apply(this.objects, doors);
        this.objects.push.apply(this.objects, texts);
        if (this.goal) {
            this.objects.push(goal);
        }
        this.backgroundColor = (backgroundColor != null) ? backgroundColor : "#000000";
    }

    setPlayer(player) {
        this.player = player;
        this.objects.push(player);
    }

    update(dT) {
        this.levelTimer += dT;
        if (this.levelTimer >= this.cardDuration) {
            this.showCard = false;
        }
        for (let i = 0; i < this.objects.length; i++) {
            this.objects[i].update(this, dT);
        }
        this.objects = this.objects.filter(obj => !obj.isDisposed);
        this.animatedTiles.forEach(tile => tile.update(dT));
    }
}


function coordToTile(x) {
    return Math.floor(x / cfg.TILE_SIZE);
}


// Establish the Player, aka WHAT IS THE PLAYER!?
export class Player extends GameOject {
    constructor(start = new utils.Vector()) {
        super(start, 14, 14);
        this.start = start;
        this.vel = new utils.Vector();
        this.wish = new utils.Vector();
        this.lastWish  = new utils.Vector(0, 1);
        this.lastWishHorizontal  = 1
        this.lastWishVertical  = 1
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
        this.keys = [];
        this.sneaking = false;
        this.alive = true;
        this.spiritTime = 0.2;
        this.renderer = new drawing.PlayerRenderer(this);

        this.coinsSinceLastCheckpoint = new Array()

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
        this.spiritParticleEmitter = new ParticleEmitter(
            this.pos,
            128,
            [1, 2],
            [0, 0],
            [16, 32],
            [-0.5, 0.5],
            [0.5, 0.75],
            "white",
            [1.0, 1.0],
            true
        );
    }

    updateMovement(level, dT) {
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
        if (this.pos.x > level.width - this.w) {
            this.pos.x = level.width - this.w;
            this.vel.x = 0;
        }
        if (this.pos.y > level.height - this.h) {
            this.pos.y = level.height - this.h;
            this.vel.y = 0;
        }

        // Check intersecting tiles
        // Perform after player movement update for collisions to work correctly
        this.col0 = coordToTile(this.pos.x);
        this.row0 = coordToTile(this.pos.y);
        this.col1 = coordToTile(this.pos.x + this.w) + 1;
        this.row1 = coordToTile(this.pos.y + this.h) + 1;
        this.col0 = Math.max(this.col0, 0);
        this.row0 = Math.max(this.row0, 0);
        this.col1 = Math.min(this.col1, level.ncols);
        this.row1 = Math.min(this.row1, level.nrows);
        
        // Check friciton: Always pick the highest friction
        let friction = 0.0;
        for (let row = this.row0; row < this.row1; row++) {
            for (let col = this.col0; col < this.col1; col++) {
                let tile = level.tileMap[row][col];
                if (tile != null && !tile.collision) {
                    friction = Math.max(friction, tile.friction);
                }
            }
        }
        this.friction = friction;
    }

    updateDash(dT) {
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
        this.dashParticleEmitter.pos = this.rect.center();
        this.dashParticleEmitter.update(dT);
    }

    updateSprit(level, dT) {
        this.spiritProgress += this.spiritRate * dT;
        this.pos = this.spiritTarget.subtract(this.spiritDelta.multiply(1 - this.spiritProgress));

        if (this.spiritProgress >= 1) {
            this.alive = true;
            this.spiritParticleEmitter.active = false;
            this.pos = this.spiritTarget.copy();
        }
    }

    update(level, dT) {
        this.renderer.update(dT);

        this.spiritParticleEmitter.pos = this.rect.center();
        this.spiritParticleEmitter.update(dT);

        if (!this.alive) {
            this.updateSprit(level, dT);
            return
        }

        this.updateMovement(level, dT);
        this.updateDash(dT);
        
        // Check collisions
        for (let row = this.row0; row < this.row1; row++) {
            for (let col = this.col0; col < this.col1; col++) {
                let tile = level.tileMap[row][col];
                if (tile != null && tile.collision) {
                    let tileRect = new utils.Rectangle(col * cfg.TILE_SIZE,
                                                       row * cfg.TILE_SIZE,
                                                       cfg.TILE_SIZE,
                                                       cfg.TILE_SIZE);
                    if (utils.rectIntersect(this.rect, tileRect)) {
                        utils.solve(this, tileRect);
                    }
                }
            }
        }
        
        // Check door collisions
        for (let i = 0; i < level.doors.length; i++) {
            let door = level.doors[i];

            if (door.open)
                continue;
            
            if (utils.rectIntersect(this.rect, door.rect)) {
                for (let j = 0; j < this.keys.length; j++) {
                    if (this.keys[j].color === door.color) {
                        level.doors[i].open = true;
                        assets.playAudio(assets.DOOR_AUDIO);
                        break;
                    }
                }
                utils.solve(this, door.rect);
            }
        }
        
        let pRect = this.rect;

        // Check checkpoints
        for (let i = 0; i < level.checkpoints.length; i++) {
            let cp = level.checkpoints[i];
            if (utils.rectIntersect(pRect, cp.rect)) {
                if (!cp.active) {
                    cp.active = true;
                    this.activeCheckpoint = cp;
                    assets.playAudio(assets.CHECKPOINT_AUDIO);
                    this.coinsSinceLastCheckpoint = new Array();
                    for (let j = 0; j < level.checkpoints.length; j++) {
                        level.checkpoints[j].active = (i == j);
                    }
                }
            }
        }

        level.goal.unlocked = (level.coins.length == 0);
        if (level.goal.unlocked &&
            !level.goal.activated &&
            utils.rectIntersect(pRect, level.goal.rect)) {
            level.goal.activated = true;
            assets.playAudio(assets.GOAL_AUDIO);
        }
        
        // Update coins
        for (let i = 0; i < level.coins.length; i++) {
            let coin = level.coins[i];
            if (utils.rectCircleInterset(pRect, coin.circ)) {
                this.coinsSinceLastCheckpoint.push(coin);
                level.coins.splice(i, 1);
                const j = level.objects.indexOf(coin);
                level.objects.splice(j, 1);
                assets.playAudio(assets.COIN_AUDIO);
            }
        }

        // Update keys
        for (let i = 0; i < level.keys.length; i++) {
            let key = level.keys[i];
            if (!key.collected && utils.rectIntersect(pRect, key.rect)) {
                level.keys[i].collected = true;
                assets.playAudio(assets.COIN_AUDIO);
                this.keys.push(key);
            }
        }

        // Check death ball collisions
        for (let i = 0; i < level.deathBalls.length; i++) {
            let ball = level.deathBalls[i];
            if (utils.circleIntersect(this.getCollisionCircle(), ball.circ)) {
                this.die(level);
            }
        }

        // Check spike collisions
        for (let i = 0; i < level.spikes.length; i++) {
            let spike = level.spikes[i];
            if (utils.rectIntersect(this.getCollisionRectangle(), spike.rect)) {
                this.die(level);
            }
        }

    }

    dash() {
        if (this.isDashAvailable) {
            let dir = this.wish.normalize();    
            if (dir.length() > 0) {
                this.vel = this.vel.add(dir.multiply(cfg.PLAYER_DASH_SPEED));
                this.isDashAvailable = false;
                this.isDashing = true;
                assets.playAudio(assets.PLAYER_DASH_AUDIO);
            }
        }
    }


    die(level) {
        level.objects = level.objects.concat(this.coinsSinceLastCheckpoint);
        level.coins = level.coins.concat(this.coinsSinceLastCheckpoint);
        this.coinsSinceLastCheckpoint = new Array();

        this.alive = false;
        this.spiritTarget = null;
        if (this.activeCheckpoint != null) {
            this.spiritTarget = this.activeCheckpoint.rect.center();
        }
        else {
            this.spiritTarget = this.start.copy();
        }
        this.spiritTarget.x -= this.rect.w / 2;
        this.spiritTarget.y -= this.rect.h / 2;

        this.spiritDelta = this.spiritTarget.subtract(this.pos);
        this.spiritDistance = this.spiritDelta.length();
        // The spirit should take a maximum of 1 second to get to the target
        this.spiritSpeed = Math.max(this.maxSpeed, this.spiritDistance / this.spiritTime);
        // Ratio of the total distance per second
        this.spiritRate = this.spiritSpeed / this.spiritDistance;
        this.spiritTimer = 0;
        this.spiritProgress = 0;
        this.spiritParticleEmitter.active = true;
        this.vel.x = 0;
        this.vel.y = 0;
        assets.playAudio(assets.PLAYER_DEATH_AUDIO);
        level.objects.push(new Explosion(this.rect.center(), 32));
    }

    getCollisionRectangle() {
        return new utils.Rectangle(this.pos.x + 3, this.pos.y + 3, this.w - 6, this.h - 6);    
    }

    getCollisionCircle() {
        let rect = this.getCollisionRectangle();
        return new utils.Circle(rect.center(), rect.w / 2);    
    }
}


export class Explosion extends GameOject {
    constructor(pos, size) {
        let topleft = new utils.Vector(pos.x - size / 2, pos.y - size /2);
        super(topleft, size, size);
        this.renderer = new drawing.ExplosionRenderer(this);
        // https://stackoverflow.com/questions/27232157/pass-class-function-as-parameter-to-another-class-to-use-as-callback-in-javascri
        this.renderer.animation.callback = this.dispose.bind(this);
    }

    update(level, dT) {
        this.renderer.update(dT);
    }
}