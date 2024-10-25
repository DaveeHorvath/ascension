/* ----- THREEJS Utils for all other parts ----- */

import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );

document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 0.5, 4, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00} );

const ballmaterial = new THREE.MeshBasicMaterial( { color: 0x0000ff} );

const player1 = new THREE.Mesh( geometry, material );
let edge = new THREE.EdgesGeometry(geometry);
const player1outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
scene.add( player1outline );
scene.add( player1 );

const player2 = new THREE.Mesh( geometry, material );
const player2outline = new THREE.LineSegments(edge, new THREE.LineBasicMaterial( { color: 0xffffff } ) );
scene.add( player2outline );
scene.add( player2 );

camera.position.z = 18;


const ballMesh = new THREE.BoxGeometry(0.5, 0.5, 0.5)
const ball = new THREE.Mesh(ballMesh, ballmaterial);

let outerboxes = [[],[],[]]

scene.add(ball)


/* ----- Local game logic and setup ----- */
const ballPower = 6
let ballvelocity = {x: ballPower, y: ballPower}

let playe1Delta = 0 
let playe2Delta = 0 

function setup()
{
    player1.position.x = 20
    player2.position.x = -20
    player1outline.position.x = 20
    player2outline.position.x = -20

    // player1.position.z -= 0.5
    // player2.position.z -= 0.5

    // player1outline.position.z -= 0.5
    // player2outline.position.z -= 0.5

    let row;

    const outerboxgeometry = new THREE.BoxGeometry(0.95, 0.95, 1);
    const outerboxmaterial = new THREE.MeshBasicMaterial({color: 0xf000f0, });
    outerboxes.forEach((element, row) =>{
            for (let i = 1; i < 44; i++)
                {
                    var cur = new THREE.Mesh(outerboxgeometry, outerboxmaterial);
                    cur.position.x = -22 + i;
                    cur.position.y = -11.25 - row;
                    cur.position.z = 0;
                    
                    let edges = new THREE.EdgesGeometry( outerboxgeometry ); 
                    let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial( { color: 0xffffff } ) ); 
                    
                    line.position.x = -22 + i;
                    line.position.y = -11.25 - row;
                    line.position.z = 0;

                    scene.add( line );
                    scene.add(cur);

                    element.push({box: cur, out: line});
                    
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

const playerSpeed = 12

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

let ai = 2
function clear(e)
{
    console.log(e.which)
    if (ai == 0 && (e.which == 87 || e.which == 83 && playe2Delta != 0))
        playe2Delta = 0
    if (ai < 2 && (e.which == 40 || e.which == 38 && playe1Delta != 0))
        playe1Delta = 0
}

var render = function() {
    renderer.render(scene, camera);
};

/* ----- loop setup ----- */
let clock = new THREE.Clock();
let delta = 0;
// 75 max fps
let interval = 1 / 75;


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
    delta += clock.getDelta();

    if (delta  > interval) {
        // The draw or time dependent code are here
        player1.position.y += playe1Delta * delta
        player2.position.y += playe2Delta * delta

        player1outline.position.y += playe1Delta * delta
        player2outline.position.y += playe2Delta * delta

        if (player1.position.y < -8.5)
        {
            player1.position.y = -8.5
            player1outline.position.y = -8.5
        }

        if (player1.position.y > 8.5)
        {
            player1.position.y = 8.5
            player1outline.position.y = 8.5
        }

        if (player2.position.y < -8.5)
        {
            player2.position.y = -8.5
            player2outline.position.y = -8.5
        }

        if (player2.position.y > 8.5)
        {
            player2.position.y = 8.5
            player2outline.position.y = 8.5
        }

        if (ball.position.y < -10 )
        {
            ball.position.y = -10
            ballvelocity.y *= -1
        }
        else if (ball.position.y > 10)
        {
            ball.position.y = 10
            ballvelocity.y *= -1
        }


        
        if (Math.abs(ball.position.x - player1.position.x) <= player1.scale.x / 2 + ball.scale.x / 2 &&
        Math.abs(ball.position.y - player1.position.y) <= player1.scale.y / 2 + ball.scale.y)
        {
            ball.position.x = player1.position.x - player1.scale.x / 2 - ball.scale.x / 2 - 0.01
            ballvelocity.x *= -1
        }
        if (Math.abs(ball.position.x - player2.position.x) <= player2.scale.x / 2 + ball.scale.x / 2 &&
        Math.abs(ball.position.y - player2.position.y) <= player2.scale.y / 2 + ball.scale.y)
        {
            ball.position.x = player2.position.x + player2.scale.x / 2 + ball.scale.x / 2 + 0.01
            ballvelocity.x *= -1
        }
<<<<<<< Updated upstream
=======
    }
 
    /* ----- loop setup ----- */
    let animationId = null;
    // start a clock
    let clock = new THREE.Clock();
    // keep track of deltatime since last frame
    let delta = 0;
    // 75 max fps
    let interval = 1 / 75;

    let hitRacketFlag = 0;
    let deltaAngle = 0;
    let ball1DirectionAngle = 0;
    let ball1Speed = 0;


    let playerMaxY = hight / 2 - 1.5
    let gameCount = [0, 0]

    
    
    console.log("player1 scale=", player1.scale.y, "ball scale=", ball1.scale.y)
    function loop() {
        if (ai != 0)
            runAi()
        animationId = requestAnimationFrame(loop);
        // keep track of time since last loop call
        delta += clock.getDelta();

        // if its time to draw a new frame
        if (delta > interval) {
            // move the players with deltatime
            player1.position.y += player1Velocity * delta
            player2.position.y += player2Velocity * delta
            player1outline.position.y += player1Velocity * delta
            player2outline.position.y += player2Velocity * delta
            if (ai == -2){
                player3.position.y += player3Velocity * delta
                player4.position.y += player4Velocity * delta
            }

            // check for boundaries of the game area
            if (player1.position.y < -playerMaxY) {
                player1.position.y = -playerMaxY
                player1outline.position.y = -playerMaxY
            }
            if (player1.position.y > playerMaxY) {
                player1.position.y = playerMaxY
                player1outline.position.y = playerMaxY
            }
            if (player2.position.y < -playerMaxY) {
                player2.position.y = -playerMaxY
                player2outline.position.y = -playerMaxY
            }
            if (player2.position.y > playerMaxY) {
                player2.position.y = playerMaxY
                player2outline.position.y = playerMaxY
            }
            // checks if the ball1 should bounce
            if (ball1.position.y < -hight / 2) {
                ball1.position.y = -hight / 2 
                ball1Velocity.y *= -1
            }
            else if (ball1.position.y > hight / 2 ) {
                ball1.position.y = hight / 2
                ball1Velocity.y *= -1
            }
            if (ai == -2){
                checkPlayerPositionY(player3, -playerMaxY, playerMaxY)
                checkPlayerPositionY(player4, -playerMaxY, playerMaxY)
                checkBallPositionY(ball2, -hight/2, hight/2)
            }

            // check if player can interact with the ball1
            // all bounces are assumed to be perfect and dont apply any modifications
            // player can interact if: 
            //      x distance is the sum of their width/2
            //      y is at most the distance of their combined height/2
            // the /2 is because the position is the center of the obj
            hitRacketFlag = 0
            if (Math.abs(ball1.position.x - player1.position.x) <= player1.scale.x / 2 + ball1.scale.x / 2 &&
                Math.abs(ball1.position.y - player1.position.y) <= player1.scale.y / 2 + ball1.scale.y)
            {
                //console.log("Hit racket", Math.abs(ball1.position.y - player1.position.y) , " vs ", player1.scale.y / 2 + ball1.scale.y)
                ball1.position.x = player1.position.x - player1.scale.x / 2 - ball1.scale.x / 2 - 0.01
                deltaAngle = -(ball1.position.y - player1.position.y) / player1.scale.y
                //gameCount[1] += 1
                hitRacketFlag = 1
            }
            else if (Math.abs(ball1.position.x - player2.position.x) <= player2.scale.x / 2 + ball1.scale.x / 2 &&
                Math.abs(ball1.position.y - player2.position.y) <= player2.scale.y / 2 + ball1.scale.y)
            {
                ball1.position.x = player2.position.x + player2.scale.x / 2 + ball1.scale.x / 2 + 0.01
                deltaAngle = (ball1.position.y - player2.position.y) / player2.scale.y
                //gameCount[0] += 1
                hitRacketFlag = 1
            }
            ball1Speed = Math.sqrt(ball1Velocity.y * ball1Velocity.y + ball1Velocity.x * ball1Velocity.x)
            if (hitRacketFlag == 1){
                if (ball1Speed < ballSpeedLimit){
                    ball1Velocity.x *= -ballAccelerationCoef
                    ball1Velocity.y *= ballAccelerationCoef
                    ball1Speed *= ballAccelerationCoef
                }
                else
                    ball1Velocity.x *= -1
                ball1DirectionAngle = Math.atan2(ball1Velocity.y, ball1Velocity.x) + deltaAngle
                ball1Velocity.x = ball1Speed * Math.cos(ball1DirectionAngle)
                ball1Velocity.y = ball1Speed * Math.sin(ball1DirectionAngle)
                // if the ball1's v_x  is too low or wrong direction
                if (Math.sign(ball1.position.x) * ball1Velocity.x > -5){
                    ball1Velocity.x = - Math.sign(ball1.position.x) * ballPower
                }
            }

            // move the ball1 the appropriate amount
            ball1.position.x += ball1Velocity.x * delta
            ball1.position.y += ball1Velocity.y * delta
            if (gameCount[0] == maxScore || gameCount[1] == maxScore){
                console.log("Game ended", gameCount)
                gameResult = "Game ended";
                cancelAnimationFrame(animationId);
                document.getElementById("gameWindow").removeChild(0)
                return gameResult; 

            }
            // check for goals and just reset position: subject to change
            if (hitRacketFlag == 0 && (ball1.position.x > width / 2  || ball1.position.x < - width / 2))
            {
                if (ball1.position.x > 0)
                    gameCount[1] += 1
                else
                    gameCount[0] += 1
                createText(gameCount[1] + " : " + gameCount[0]);
                console.log("Game count", gameCount)
                console.log("New ball1")
                ball1.position.x = 0
                ball1.position.y = 0
                startAngle = getRandom(-1, 1); 
                ball1Velocity = {x: Math.cos(startAngle) * Math.sign(ball1Velocity.x) * ballPower, y: Math.sin(startAngle) * Math.sign(ball1Velocity.y) * ballPower}
                deltaTimeAi = 2;
                //if (count = 11)
                //  return data
                //cancelAnimationFrame(animationId);
                //return 1; 
                // data to return
                // player 1 score1
                // player 2 score2
                // game_time time
                // ??? mean max speed of the ball1

            }
            // update each outer box height based on sin to create a wave effect
            outerboxes.forEach((element, row) => {
                element.forEach((box, index) => {
                    box.box.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                    box.box.position.z = -1 + box.box.scale.z / 2
                    box.out.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                    box.out.position.z = -1 + box.out.scale.z / 2
                });
            });
>>>>>>> Stashed changes

        ball.position.x += ballvelocity.x * delta
        ball.position.y += ballvelocity.y * delta
        
        if (ball.position.x > 21 || ball.position.x < -21 )
        {
            ball.position.x = 0
            ball.position.y = 0
        }

        outerboxes.forEach((element, row) => {
            element.forEach((box, index) => {
                box.box.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                box.box.position.z = -1 + box.box.scale.z / 2
                box.out.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                box.out.position.z = -1 + box.out.scale.z / 2
            });
        });

        render();
        delta = delta % interval;
    }
}

document.addEventListener("keydown", movement, false)
document.addEventListener("keyup", clear, false)


/* ----- Main logic ----- */

setup()
loop()
