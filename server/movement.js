import { arenaHeight, arenaWidth } from './constants.js';

function outOfBounds(x, y, size) {
    return x < -size || x > arenaWidth + size || y < -size || y > arenaHeight + size;
}

export function playerMovement(players){
    for (let p of players) {
    
        const xLowerBound = p.clientFacing.teamId * arenaWidth / 2;
        const xUpperBound = (p.clientFacing.teamId + 1) * arenaWidth / 2;
    
        // player movement
        for (let key of p.keysPressed) {
            switch (key.toLowerCase()) {
                case "w":
                    p.clientFacing.pos.y = Math.max(p.clientFacing.pos.y - p.speed, p.clientFacing.size / 2);
                    break;
                case "s": 
                    p.clientFacing.pos.y = Math.min(p.clientFacing.pos.y + p.speed, arenaHeight - p.clientFacing.size / 2);
                    break;
                case "d": 
                    p.clientFacing.pos.x = Math.min(p.clientFacing.pos.x + p.speed, xUpperBound - p.clientFacing.size / 2);
                    break;
                case "a": 
                    p.clientFacing.pos.x = Math.max(p.clientFacing.pos.x - p.speed, xLowerBound + p.clientFacing.size / 2);
                    break;
            }
        }
    }
}

export function dodgeballMovement(dodgeballs){
    for (let d of dodgeballs) {
        d.pos.x += d.velocity.x * d.speed;
        d.pos.y += d.velocity.y * d.speed;
    }
    
    cullDodgeballs(dodgeballs);
}


function cullDodgeballs(dodgeballs) {
    for (let i = 0; i < dodgeballs.length; i++){
        if (outOfBounds(dodgeballs[i].pos.x, dodgeballs[i].pos.y, dodgeballs[i].size)) {
            dodgeballs.splice(i, 1);
            i -= 1;
        }
    }
}
