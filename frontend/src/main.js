/* ----- THREEJS Utils for all other parts ----- */
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 18;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

// needs to be a game screen that we overlay and make visible
document.body.appendChild( renderer.domElement );

// players geometry and material is shared so we create it once
const playerGeometry = new THREE.BoxGeometry( 0.5, 4, 1 );
const playerMaterial = new THREE.MeshBasicMaterial( { color: 0x00ff00} );

// creates the player box
const player1 = new THREE.Mesh( playerGeometry, playerMaterial );
// adds a border based on the geometry
let edge = new THREE.EdgesGeometry(playerGeometry);
const player1Outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
// registers to be rendered
scene.add( player1Outline );
scene.add( player1 );
// same as the other player
const player2 = new THREE.Mesh( playerGeometry, playerMaterial );
const player2Outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
scene.add( player2Outline );
scene.add( player2 );

// create separate material and geometry for the ball and register it
const ballMaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff} );
const ballMesh = new THREE.BoxGeometry(0.5, 0.5, 0.5)
const ball = new THREE.Mesh(ballMesh, ballMaterial);
scene.add(ball)

// double array for the outer boxes
let outerBoxes = [[],[],[]]

/* ----- Local game logic and setup ----- */
// initial speed of the ball
const ballPower = 6
let ballVelocity = {x: ballPower, y: ballPower}
const playerSpeed = 12
let ai = 2

// the per frame change that is influenced by keyboard presses
let playe1Delta = 0 
let playe2Delta = 0 

function setup()
{
    // move the players to their starting position from <0,0,0>
    player1.position.x = 20
    player2.position.x = -20
    player1Outline.position.x = 20
    player2Outline.position.x = -20

    // use the same geometry for all outer boxes
    const outerboxgeometry = new THREE.BoxGeometry(0.95, 0.95, 1);
    const outerboxmaterial = new THREE.MeshBasicMaterial({color: 0xf000f0, });
    // loop over all the rows that share the height of the outer boxes
    outerBoxes.forEach((element, row) =>{
            for (let i = 1; i < 44; i++)
                {
                    // create box and move to the correct position in its row
                    var cur = new THREE.Mesh(outerboxgeometry, outerboxmaterial);
                    cur.position.x = -22 + i;
                    cur.position.y = -11.25 - row;
                    cur.position.z = 0;
                    
                    // create an edge and line for all boxes and move to the same position
                    let edges = new THREE.EdgesGeometry( outerboxgeometry ); 
                    let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 
                    line.position.x = -22 + i;
                    line.position.y = -11.25 - row;
                    line.position.z = 0;

                    scene.add( line );
                    scene.add(cur);

                    // save them for later access
                    element.push({box: cur, out: line});
                    
                    // add the same thing on the other side
                    cur = new THREE.Mesh(outerboxgeometry, outerboxmaterial);
                    cur.position.x = -22 + i;
                    cur.position.y = 11.25 + row;
                    cur.position.z = 0;
                    
                    edges = new THREE.EdgesGeometry( outerboxgeometry ); 
                    line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 

                    line.position.x = -22 + i;
                    line.position.y = 11.25 + row;
                    line.position.z = 0;

                    scene.add( line );
                    scene.add(cur);
                    
                    element.push({box: cur, out: line});
                }
    })
}

// function registered as an event listener to keydown events
function movement (e) {
    if (ai == 0)
    {
        if (e.which == 38)
            playe1Delta = playerSpeed
        else if (e.which == 40)
            playe1Delta = -playerSpeed
    }
    if (ai < 2)
    {
        if (e.which == 87)
            playe2Delta = playerSpeed
        else if (e.which == 83)
            playe2Delta = -playerSpeed
    }
}

// registered as keyup listener, cleares the movement of the players
function clear(e)
{
    console.log(e.which)
    if (ai == 1 || ai == 0 && (e.which == 87 || e.which == 83 && playe2Delta != 0))
        playe2Delta = 0
    if (ai == 0 && (e.which == 40 || e.which == 38 && playe1Delta != 0))
        playe1Delta = 0
}

// util function
var render = function() {
    renderer.render(scene, camera);
};

/* ----- loop setup ----- */
// start a clock
let clock = new THREE.Clock();
// keep track of deltatime since last frame
let delta = 0;
// 75 max fps
let interval = 1 / 75;

// subject to change by Alex
function runAi()
{
    if (ai >= 1)
    {
        if (Math.abs(player1.position.y - ball.position.y) > 1 && Math.abs(player1.position.x - ball.position.x) < 22)
            playe1Delta = (player1.position.y - ball.position.y) * -playerSpeed
        else
            playe1Delta = 0
    }
    if (ai == 2)
    {
        if (Math.abs(player2.position.y - ball.position.y) > 1 && Math.abs(player2.position.x - ball.position.x) < 22)
            playe2Delta = (player2.position.y - ball.position.y) * -playerSpeed
        else
            playe2Delta = 0
    }
}

function loop()
{
    if (ai != 0)
        runAi()
    requestAnimationFrame(loop);
    // keep track of time since last loop call
    delta += clock.getDelta();

    // if its time to draw a new frame
    if (delta  > interval) {
        // move the players with deltatime
        player1.position.y += playe1Delta * delta
        player2.position.y += playe2Delta * delta
        player1Outline.position.y += playe1Delta * delta
        player2Outline.position.y += playe2Delta * delta

        // check for boundaries of the game area
        if (player1.position.y < -8.5)
        {
            player1.position.y = -8.5
            player1Outline.position.y = -8.5
        }
        if (player1.position.y > 8.5)
        {
            player1.position.y = 8.5
            player1Outline.position.y = 8.5
        }
        if (player2.position.y < -8.5)
        {
            player2.position.y = -8.5
            player2Outline.position.y = -8.5
        }
        if (player2.position.y > 8.5)
        {
            player2.position.y = 8.5
            player2Outline.position.y = 8.5
        }
        // checks if the ball should bounce
        if (ball.position.y < -10 )
        {
            ball.position.y = -10
            ballVelocity.y *= -1
        }
        else if (ball.position.y > 10)
        {
            ball.position.y = 10
            ballVelocity.y *= -1
        }


        // check if player can interact with the ball
        // all bounces are assumed to be perfect and dont apply any modifications
        // player can interact if: 
        //      x distance is the sum of their width/2
        //      y is at most the distance of their combined height/2
        // the /2 is because the position is the center of the obj
        if (Math.abs(ball.position.x - player1.position.x) <= player1.scale.x / 2 + ball.scale.x / 2 &&
        Math.abs(ball.position.y - player1.position.y) <= player1.scale.y / 2 + ball.scale.y)
        {
            ball.position.x = player1.position.x - player1.scale.x / 2 - ball.scale.x / 2 - 0.01
            ballVelocity.x *= -1
        }
        if (Math.abs(ball.position.x - player2.position.x) <= player2.scale.x / 2 + ball.scale.x / 2 &&
        Math.abs(ball.position.y - player2.position.y) <= player2.scale.y / 2 + ball.scale.y)
        {
            ball.position.x = player2.position.x + player2.scale.x / 2 + ball.scale.x / 2 + 0.01
            ballVelocity.x *= -1
        }

        // move the ball the appropriate amount
        ball.position.x += ballVelocity.x * delta
        ball.position.y += ballVelocity.y * delta
        
        // check for goals and just reset position: subject to change
        if (ball.position.x > 21 || ball.position.x < -21 )
        {
            ball.position.x = 0
            ball.position.y = 0
        }

        // update each outer box height based on sin to create a wave effect
        outerBoxes.forEach((element, row) => {
            element.forEach((box, index) => {
                box.box.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                box.box.position.z = -1 + box.box.scale.z / 2
                box.out.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                box.out.position.z = -1 + box.out.scale.z / 2
            });
        });

        render();
        // if we have multiple frames it skips to the most recent one
        delta = delta % interval;
    }
}

// allows keydown and keyup to move player
document.addEventListener("keydown", movement, false)
document.addEventListener("keyup", clear, false)


/* ----- Main logic ----- */

setup()
loop()
