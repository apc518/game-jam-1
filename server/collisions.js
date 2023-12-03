import { distance } from "./geometry.js";

/**
 * returns a list of pairs of dodgeball and player which are currently intersecting
 */
export function collideDodgeballsWithPlayers(dodgeballs, players) {
    const collisions = [];
    
    for (let p of players) {
        for (let d of dodgeballs) {
            if (d.targetTeam === p.clientFacing.teamId) {
                if (distance(p.clientFacing.pos.x, p.clientFacing.pos.y, d.pos.x, d.pos.y) < d.size) {
                    collisions.push([d, p.clientFacing]);
                }
            }
        }
    }

    return collisions;
}