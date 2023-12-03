import { WebSocketServer } from 'ws';
import { Player } from './player.js';
import { Dodgeball } from './dodgeball.js';
import { dodgeballMovement, playerMovement } from './movement.js';
import { collideDodgeballsWithPlayers } from './collisions.js';

const server = new WebSocketServer({ port: '8080', host: "0.0.0.0" });

const PHYSICS_FPS = 120;


/**
 * big idea:
 * server will send the data of all entities locations and other state information to all clients periodically
 * clients will send input data to the server as it happens on the client side, and the server will handle the state machine/physics/etc
 */

/**
 * client input json structure:
 * {
 *  msgType: 'playerInput',
 *  input: {
 *      type: 'keydown' | 'keyup' | 'click',
 *      data: {
 *          x: number,
 *          y: number
 *      } // if type was 'click'
 *      |
 *      {
 *          key: string     
 *      } // if type was 'keydown' or 'keyup'
 *  }
 * }
 * 
 * or 
 * 
 * {
 *  msgType: 'setName',
 *  name: string
 * }
 */

/**
 * server state json structure:
 * {
 *  msgType: 'serverState',
 *  players: [
 *      {
 *         id: number,
 *         pos: { x: number, y: number },
 *         teamId: number
 *      },
 *      ...
 *  ],
 *  dodgeballs: [
 *      {
 *          size: number,
 *          pos: {
 *              x: number,
 *              y: number
 *          }
 *      } 
 *  ],
 *  collisions: [
 *      [spriteId, otherSpriteId]
 *  ]
 * }
 * 
 * give client their id:
 * {
 *  msgType: "yourId",
 *  id: number
 * }
 * 
 * tell client there was a collision animation
 * {
 *  msgType: "collision",
 *  collision: {
 *      dodgeball: { ... } 
 *      player: { ... }
 *  }
 * }
 */


const players = [];
const dodgeballs = [];
let collisions = [];
let teamHealths = [1000, 1000];

function getTeamCounts() {
    let teamZeroPlayerCount = 0;
    let teamOnePlayerCount = 0;
    for (let p of players) {
        if (p.clientFacing.teamId === 0) {
            teamZeroPlayerCount += 1;
        }
        else{
            teamOnePlayerCount += 1;
        }
    }

    return [teamZeroPlayerCount, teamOnePlayerCount];
}

server.on('connection', socket => {
    let teamCounts = getTeamCounts();
    let newTeamId = 0;
    if (teamCounts[0] > teamCounts[1]) {
        newTeamId = 1;
    }
    const player = new Player(socket, newTeamId);
    players.push(player);

    socket.send(JSON.stringify({
        msgType: "yourId",
        id: player.clientFacing.id
    }))

    socket.on('message', message => {
        // console.log(`Received: ${message}`);
        try {
            let obj = JSON.parse(message);
            if (obj.msgType === "playerInput") {
                switch (obj.input.type) {
                    case "keydown": {
                        if (player.keysPressed.indexOf(obj.input.data.key) < 0) {
                            player.keysPressed.push(obj.input.data.key);
                        }
                        
                        break;
                    }
                    case "keyup": {
                        let indexOfKey = player.keysPressed.indexOf(obj.input.data.key);
                        if (indexOfKey >= 0) {
                            player.keysPressed.splice(indexOfKey, 1);
                        }

                        break;
                    }
                    case "click": {
                        dodgeballs.push(new Dodgeball(
                            player.clientFacing.pos.x,
                            player.clientFacing.pos.y,
                            obj.input.data.x,
                            obj.input.data.y,
                            1 - player.clientFacing.teamId,
                            player.strength,
                            player.strength));
                        break;
                    }
                }
            }
            else if (obj.msgType === "setName") {
                player.clientFacing.name = obj.name.substring(0, 7);
            }
            else if (obj.msgType === "powerup") {
                if (obj.powerup === "strength") {
                    player.strength += 0.5;
                    player.clientFacing.size += 2;
                    player.speed *= 0.98;
                }
            }
        }
        catch(e) {
            console.log(`Exception parsing message from client ${player.clientFacing.id}`, e);
        }
    });

    socket.on('close', () => {
        console.log(`Close event on ${player.clientFacing.id}`);
        let index = 0;
        for (let i = 0; i < players.length; i++){
            if (players[i].clientFacing.id == player.clientFacing.id) {
                index = i;
                break;
            }
        }
        players.splice(index, 1);
    })
});



function updateClients(){
    let gameState = {
        msgType: 'serverState'
    };
    gameState.dodgeballs = dodgeballs;
    gameState.collisions = collisions;
    gameState.players = [];
    gameState.teamHealths = teamHealths;
    for (let p of players) {
        gameState.players.push(p.clientFacing);
    }
    const gameStateJson = JSON.stringify(gameState);
    for (let p of players) {
        p.socket.send(gameStateJson);
    }
}


function mainLoop() {
    // do physics
    playerMovement(players);
    dodgeballMovement(dodgeballs);
    collisions = collideDodgeballsWithPlayers(dodgeballs, players);

    collisions.forEach(c => {
        teamHealths[c[1].teamId] -= c[0].strength;
        for (let p of players) {
            p.socket.send(JSON.stringify({
                msgType: "collision",
                collision: c
            }));
        }
    })

    // update cilents
    updateClients();

    // remove collided dodgeballs
    for (let collision of collisions) {
        for (let i = 0; i < dodgeballs.length; i++){
            if (dodgeballs[i].id === collision[0].id) {
                dodgeballs.splice(i, 1);
                i -= 1;
            }
        }
    }
}

setInterval(mainLoop, 1000 / PHYSICS_FPS);