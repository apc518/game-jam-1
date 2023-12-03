import { distance } from "./geometry.js";
import { Player } from "./player.js";

export class Dodgeball {
    constructor(originX, originY, targetX, targetY, targetTeam, strength, speed) {
        let velocityScale = distance(originX, originY, targetX, targetY);

        this.velocity = {
            x: (targetX - originX) / velocityScale,
            y: (targetY - originY) / velocityScale
        }

        this.pos = {
            x: originX,
            y: originY
        }

        this.id = Player.makeId();

        this.size = 20;
        this.speed = speed;
        this.strength = strength;

        this.targetTeam = targetTeam;
    }
}
