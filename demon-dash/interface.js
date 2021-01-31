import * as utils from "./utils.js";

export class Button {

    constructor(text, callback, x, y, w, h) {
        this.callback = callback;
        this.hover = false;
        this.text = text;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}


export class Menu {

    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.w = 512;
        this.h = 450 ;
        this.padding = 24;
        this.buttons = [];
    }

    init(buttons) {
        this.buttons = buttons;
        let y = 0;
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].x = (this.w - this.buttons[i].w) / 2;
            this.buttons[i].y = y;
            y += this.buttons[i].h + this.padding;
        }

        // One extra superflous padding from the last button
        y -= this.padding;
        
        let y0 = (this.h - y ) / 2;
        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].y += y0;
        }
    }

    click(x, y) {

        if (!this.active || !utils.inBounds(x, y, this.x, this.y, this.w, this.h))
            return;

        x = x - this.x;
        y = y - this.y;
        
        for (let i = 0; i < this.buttons.length; i++) {
            let b = this.buttons[i];
            if (utils.inBounds(x, y, b.x, b.y, b.w, b.h)) {
                b.callback();
                break;
            }
        }
    }

    hover(x, y) {

        if (!this.active || !utils.inBounds(x, y, this.x, this.y, this.w, this.h))
            return;

        x = x - this.x;
        y = y - this.y;
        
        for (let i = 0; i < this.buttons.length; i++) {
            let b = this.buttons[i];
            b.hover = utils.inBounds(x, y, b.x, b.y, b.w, b.h);
        }
    }
}