export class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;                
    }
    center() {
        return new Vector(this.x + this.w / 2, this.y + this.h / 2);
    }
    copy() {
        return new Rectangle(this.x, this.y, this.w, this.h);
    }
}


export class Circle {
    constructor(c, r) {
        this.c = c;
        this.r = r;                
    }
}


export class Vector {
    constructor(x=0, y=0) {
        this.x = x;
        this.y = y;                
    }

    copy() {
        return new Vector(this.x, this.y);
    }

    add(v) {
        return new Vector(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector(this.x - v.x, this.y - v.y);
    }

    multiply(r) {
        return new Vector(this.x * r, this.y * r);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        let length = this.length();
        return length > 0 ? this.multiply(1 / length) : this;        
    }

    dot(v) {
        return this.x * v.x + this.y * v.y;
    }
    
    project(v) {
        // Project this vector onto the given vetor v
        return v.multiply(this.dot(v) / v.dot(v)); 
    }

    max(max) {
        let length = this.length();
        return length > max ? this.multiply(max / length) : this;        
    }

    min(min) {
        let length = this.length();
        return length < min ? this.multiply(min / length) : this;        
    }

    setLength(length) {
        return this.normalize().multiply(length);        
    }
}


export function random(min, max) {  
    return Math.random() * (max - min) + min; 
}  


//Check how two rectangles (Player & Deathball for example) collide with each other
export function rectIntersect(r1, r2) {
    return  (r1.x + r1.w > r2.x && r1.x < r2.x + r2.w &&
             r1.y + r1.h > r2.y && r1.y < r2.y + r2.h)
}


//Check how two rectangles (Player & Deathball for example) collide with each other
export function circleIntersect(c1, c2) {
    return c1.c.subtract(c2.c).length() < c1.r + c2.r;
}

export function rectCircleInterset(rect, circle) {
    let rectCenter = rect.center();
    let distX = Math.abs(circle.c.x - rectCenter.x);
    let distY = Math.abs(circle.c.y - rectCenter.y);

    if (distX > (rect.w / 2 + circle.r)) { return false; }
    if (distY > (rect.h / 2 + circle.r)) { return false; }

    if (distX < (rect.w / 2)) { return true; } 
    if (distY < (rect.h / 2)) { return true; }

    let dx = distX - rect.w / 2;
    let dy = distY - rect.h / 2;
    return (dx * dx + dy * dy < (circle.r * circle.r));
}


export function inBounds(px, py, x, y, w, h) {
    return px > x && px < x + w && py > y && py < y + h; 
}


export function clamp(x, min, max) {
    return Math.min(Math.max(x, min), max);
}


export function solve(player, box, epsilon=0) {

    // Moving to the right
    if (player.displacement.x > 0) {
        // Moving down to the right
        if (player.displacement.y > 0) {
            let ox = player.pos.x - player.displacement.x 
            let oy = player.pos.y - player.displacement.y
            let tx = Math.abs((box.x - (ox + player.w)) / player.displacement.x);
            let ty = Math.abs((box.y - (oy + player.h)) / player.displacement.y);
            
            // Horizontal collision
            if (tx < ty) {
                player.vel.x = 0;
                player.pos.x = box.x - player.w - epsilon;
            }
            // Vertical collision
            else {
                player.vel.y = 0;
                player.pos.y = box.y - player.h - epsilon;
            }
        }
        // Moving up to the right
        else if (player.displacement.y < 0) {
            let ox = player.pos.x - player.displacement.x 
            let oy = player.pos.y - player.displacement.y
            let tx = Math.abs((box.x - (ox + player.w)) / player.displacement.x);
            let ty = Math.abs((box.y + box.h - oy) / player.displacement.y);
            
            // Horizontal collision
            if (tx < ty) {
                player.vel.x = 0;
                player.pos.x = box.x - player.w - epsilon;
            }
            // Vertical collision
            else {
                player.vel.y = 0;
                player.pos.y = box.y + box.h + epsilon;
            }
        }
        else {
            player.vel.x = 0;
            player.pos.x = box.x - player.w + epsilon;
        }
    }

    // Moving to the left
    else if (player.displacement.x < 0) {

        // Moving down to the left
        if (player.displacement.y > 0) {
            let ox = player.pos.x - player.displacement.x 
            let oy = player.pos.y - player.displacement.y
            let tx = Math.abs((box.x + box.w - ox) / player.displacement.x);
            let ty = Math.abs((box.y - (oy + player.h)) / player.displacement.y);
            
            // Horizontal collision
            if (tx < ty) {
                player.vel.x = 0;
                player.pos.x = box.x + box.w + epsilon;
            }
            // Vertical collision
            else {
                player.vel.y = 0;
                player.pos.y = box.y - player.h - epsilon;
            }
        }
        // Moving up to the left
        else if (player.displacement.y < 0) {
            let ox = player.pos.x - player.displacement.x 
            let oy = player.pos.y - player.displacement.y
            let tx = Math.abs((box.x + box.w - ox) / player.displacement.x);
            let ty = Math.abs((box.y + box.h - oy) / player.displacement.y);
            
            // Horizontal collision
            if (tx < ty) {
                player.vel.x = 0;
                player.pos.x = box.x + box.w + epsilon;
            }
            // Vertical collision
            else {
                player.vel.y = 0;
                player.pos.y = box.y + box.h + epsilon;
            }
        }
        else {
            player.vel.x = 0;
            player.pos.x = box.x + box.w + epsilon;
        }
    }

    // Not moving horizontally
    else {
        // Moving down
        if (player.displacement.y > 0) {
            player.vel.y = 0;
            player.pos.y = box.y - player.h - epsilon;
        }
        // Moving up
        else if(player.displacement.y < 0) {
            player.vel.y = 0;
            player.pos.y = box.y + box.h + epsilon;
        }
    }
}
