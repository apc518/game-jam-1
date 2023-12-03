const canvasWidth = 800;
const canvasHeight = 800;

let ws;

let players = [];
let dodgeballs = [];
let teamColors = ["#d0a000", "#ff00ff"];
let collisions = [];
let teamHealths = [];
let playerId = -1;


class ExplosionAnimation {
    static frames = [];

    constructor(posX, posY, image){
        this.pos = { x: posX, y: posY };
        this.image = image;
        this.countdown = ExplosionAnimation.frames.length - 1;
        explosionSound.play();
    }

    draw() {
        push();
        imageMode(CENTER);
        image(ExplosionAnimation.frames[Math.floor(this.countdown)], this.pos.x, this.pos.y, 100, 150);
        this.countdown -= 0.3;
        pop();

        return this.countdown >= 0;
    }
}

let explosionAnimations = [];


let dodgeballImg;
let explosionGif;

let explosionSound;
let music;

function drawPlayer(player){
    push();
    noFill();
    strokeWeight(1);
    stroke(255);
    textAlign(CENTER);
    text(player.name, player.pos.x, player.pos.y - player.size / 2 - 10);
    pop();
    push();
    fill(player.innerColor);
    strokeWeight(3);
    stroke(teamColors[player.teamId]);
    rectMode(CENTER);
    rect(player.pos.x, player.pos.y, player.size, player.size);
    pop();
}


function drawDodgeball(dodgeball) {
    push();
    imageMode(CENTER);
    image(dodgeballImg, dodgeball.pos.x, dodgeball.pos.y, dodgeball.size, dodgeball.size);
    pop();
}


function preload() {
    explosionSound = new Howl({ src: ["./explosion.wav"] });
    music = new Howl({ src: ["./music.wav"], loop: true, volume: 0.1 });
}


function setup() {
    dodgeballImg = loadImage("./dodgeball.png");
    explosionGif = loadImage("./explosion3.gif");

    music.play();

    for (let i = 9; i < 14; i++){
        ExplosionAnimation.frames.push(loadImage(`./explosion_frames/frame_${i}.png`));
    }

    createCanvas(canvasWidth, canvasHeight, document.getElementById("p5canvas"));
    // TODO: get this via prompt() in reality
    let name = window.location.hostname.startsWith("127") ? "dacob" : "plato"; // prompt("Enter your name (7 characters or less):");
    ws = new WebSocket(`ws://${window.location.hostname}:8080`);

    ws.onmessage = msg => {
        // console.log("Received:", msg);
        // console.log("Received websocket message from server");
        try {
            let msgObj = JSON.parse(msg.data);
            if (msgObj.msgType === "serverState") {
                players = msgObj.players;
                dodgeballs = msgObj.dodgeballs;
                collisions = msgObj.collisions;
                teamHealths = msgObj.teamHealths;
            }
            else if (msgObj.msgType === "yourId") {
                playerId = msgObj.id;
            }
            else if (msgObj.msgType === "collision") {
                // console.log("Collision:", msgObj.collision);
                explosionAnimations.push(new ExplosionAnimation(msgObj.collision[0].pos.x, msgObj.collision[0].pos.y, loadImage("./explosion3.gif")));
            }
        }
        catch(e){
            console.error(e);
        }
    }
    
    ws.onopen = () => {
        console.log("websocket opened");
        ws.send(JSON.stringify({
            msgType: "setName",
            name: name.substring(0, 7)
        }))
    }
    
    window.addEventListener("keydown", ev => {
        ws.send(JSON.stringify({
            msgType: "playerInput",
            input: {
                type: "keydown",
                data: {
                    key: ev.key
                }
            }
        }));
    });

    window.addEventListener("keyup", ev => {
        ws.send(JSON.stringify({
            msgType: "playerInput",
            input: {
                type: "keyup",
                data: {
                    key: ev.key
                }
            }
        }));
    });

    window.addEventListener("click", ev => {
        ws.send(JSON.stringify({
            msgType: "playerInput",
            input: {
                type: "click",
                data: {
                    x: mouseX,
                    y: mouseY
                }
            }
        }))
    })
}

function drawCenterLine() {
    push();
    noFill();
    stroke(100, 127);
    strokeWeight(2);
    line(canvasWidth / 2, 0, canvasWidth / 2, canvasHeight);
}


function drawExplosions() {
    for (let i = 0; i < explosionAnimations.length; i++){
        if (!explosionAnimations[i].draw()) {
            explosionAnimations.splice(i, 1);
            i -= 1;
        }
    }
}


function updateHealth(){
    document.getElementById("team0Health").innerText = teamHealths[0];
    document.getElementById("team1Health").innerText = teamHealths[1];
}

function powerup1() {
    ws.send(JSON.stringify({
        msgType: "powerup",
        powerup: "strength"
    }))
}

function muteSfx() {
    explosionSound.volume(0);
}

function unmuteSfx() {
    explosionSound.volume(1);
}

function muteMusic() {
    music.volume(0);
}

function unmuteMusic() {
    music.volume(0.1);
}

function draw() {
    background(20, 20, 30);
    drawCenterLine();
    let debugPre = document.getElementById("statsPre");
    players.forEach(p => drawPlayer(p));
    dodgeballs.forEach(d => drawDodgeball(d));

    drawExplosions();
    updateHealth();

    debugPre.innerText = JSON.stringify({
        players: players,
        collisions: collisions,
        dodgeballs: dodgeballs,
    }, null, 4);
}

function mousePressed(){

}