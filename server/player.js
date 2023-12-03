import { arenaHeight, arenaWidth, cssColorList } from "./constants.js";

export class Player {
    static idCounter = 0;

    constructor(socket, teamId){
        this.socket = socket;
        this.keysPressed = [];
        this.speed = 3;
        this.id = Player.makeId();
        
        this.strength = 5;
        
        this.clientFacing = {
            id: this.id,
            name: "",
            pos: { x: (arenaWidth / 4 + (teamId * arenaWidth / 2)), y: (Math.random() * 0.9 + 0.05) * arenaHeight },
            teamId: teamId,
            innerColor: cssColorList[Math.floor(Math.random() * cssColorList.length)],
            size: 20,
        }
        
    }

    static makeId() {
        this.idCounter += 1;
        return this.idCounter - 1;
    }
}