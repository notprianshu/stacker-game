import Phaser from "phaser";
import Box from "../gameobjects/box.js";
import FadeBox from "../gameobjects/fadebox.js";
import Fireworks from '../gameobjects/fireworks.js';

export default class Game extends Phaser.Scene {
    constructor() {
        super({ key: "Game" });
    }

    preload() { 
        this.load.spritesheet('pinkfire', 'assets/images/pinkfire.png', {frameWidth: 258, frameHeight: 258});
        this.load.spritesheet('purplefire', 'assets/images/purplesprite.png', {frameWidth: 258, frameHeight: 258});
        this.load.spritesheet('yellowfire', 'assets/images/yellowsprite.png', {frameWidth: 258, frameHeight: 258});
        this.load.bitmapFont('arcade', 'assets/fonts/arcade.png', 'assets/fonts/arcade.xml');
    }

    create() {
        this.registry.set('win', false)
        this.gameover = false;
        this.score = 0;
        this.space = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
        this.boxes = this.add.group();
        this.baseBox = new Box(this, 256, 480, 64, false);
        this.newBox = new Box(this);
        this.spaceKeyUp = true;

        this.physics.add.overlap(
            this.newBox,
            this.baseBox,
            () => this.onCollide(),
            null,
            this
        );
    }

    update() {
        if (this.space.isDown && this.spaceKeyUp) {
            this.spaceKeyUp = false;

            this.newBox.body.allowGravity = true;
            if (this.newBox.firstTween) {
                this.newBox.firstTween.stop();
            }
            if (this.newBox.secondTween) {
                this.newBox.secondTween.stop();
            }
        }
        if (this.space.isUp) {
            this.spaceKeyUp = true;
        }

        if (!this.gameover && (this.newBox.y >= this.baseBox.y)) {
            this.gameover = true;
            // console.log(this.newBox, this.baseBox);
            this.fadeOut = this.tweens.add({
                targets: this.newBox,
                y: {from: this.newBox.y, to: this.newBox.y + 10},
                alpha: {from: 1, to: 0},
                duration: 300,
                onComplete: () => {
                    this.newBox.destroy();
                }
            })
            setTimeout(() => this.scene.start('gameover'), 500);
            console.log('gameover')
        }
    }

    onCollide() {
        const y = this.baseBox.y - 64;
        let x; 
        if (this.newBox.x < this.baseBox.x) {
            x = this.newBox.x + Math.abs(this.baseBox.x - this.newBox.x) / 2;
        } else {
            x = this.newBox.x - Math.abs(this.baseBox.x - this.newBox.x) / 2;
        }
        let width = this.baseBox.width - Math.abs(this.baseBox.x - this.newBox.x);

        this.createFadeBox();

        this.newBox.destroy();
        this.baseBox = new Box(this, x, y, width, false);
        this.score += 1;

        if (this.score == 7) {
            this.gameover = true;
            this.registry.set('win', true);
            console.log(this.score);
            new Fireworks(this);
            setTimeout(() => this.scene.start('gameover'), 10000);
        }
        else {
            this.newBox = new Box(this, 32, 32, width);
        }

        this.physics.add.overlap(
            this.newBox,
            this.baseBox,
            () => this.onCollide(),
            null,
            this
        );
    }

    createFadeBox() {
        let width = Math.abs(this.baseBox.x - this.newBox.x);
        let y = this.baseBox.y - 64;
        let x;
        if (this.newBox.x < this.baseBox.x) {
            x = this.baseBox.getBottomLeft().x - (width/2);
        } else {
            x = this.baseBox.getBottomRight().x + (width/2);
        }
        new FadeBox(this, x, y, width);
    }
}
