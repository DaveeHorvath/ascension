import * as THREE from 'three';

// usage: instantiate the class with the parameters, call setup and then loop on the returned object
// -> let game = new Game(...)
// game.setup(...).run()
class Game {
    constructor(_ai) {
        this.ball = new Box(0x0000ff, false, { x: 0.5, y: 0.5, z: 0.5 })

        this.player1 = new Box(0x00ff00, true, { x: 0.5, y: 4, z: 1 })
        this.player2 = new Box(0x00ff00, true, { x: 0.5, y: 4, z: 1 })

        this.outerboxes = [[], [], []]
        this.ballPower = 6
        this.ballvelocity = { x: ballPower, y: ballPower }

        // these are checked and reset every update and are the way to control the players
        this.playe1Delta = 0
        this.playe2Delta = 0
        this.playerSpeed = 12
        this.ai = _ai;
        this.delta = 0;
        this.interval = 1 / 75;
        this.score = { player1: 0, player2: 0 }
    }

    // handles keyboard press events
    movement(e) {
        if (this.ai < 1) {
            if (e.which == 38)
                this.playe1Delta = this.playerSpeed
            else if (e.which == 40)
                this.playe1Delta = -this.playerSpeed
            if (this.ai < 2) {
                if (e.which == 87)
                    this.playe2Delta = pthis.layerSpeed
                else if (e.which == 83)
                    this.playe2Delta = -this.playerSpeed
            }
        }
    }

    // handles keyboard release events
    clearInput(e) {
        if (this.ai < 1 && (e.which == 87 || e.which == 83 && this.playe2Delta != 0))
            this.playe2Delta = 0
        if (this.ai < 2 && (e.which == 40 || e.which == 38 && this.playe1Delta != 0))
            this.playe1Delta = 0
    }

    setup(_outsideColor) {
        document.addEventListener("keydown", this.movement, false)
        document.addEventListener("keyup", this.clearInput, false)
        
        this.player1.updatepos({ x: 20, y: 0, z: 0 })
        this.player2.updatepos({ x: -20, y: 0, z: 0 })

        // big ugly function to make the boxes on the outside
        const outerboxgeometry = new THREE.BoxGeometry(0.95, 0.95, 1);
        const outerboxmaterial = new THREE.MeshBasicMaterial({ color: _outsideColor, });
        this.outerboxes.forEach((element, row) => {
            for (let i = 1; i < 44; i++) {
                var cur = new THREE.Mesh(outerboxgeometry, outerboxmaterial);
                cur.position.x = -22 + i;
                cur.position.y = -11.25 - row;
                cur.position.z = 0;

                let edges = new THREE.EdgesGeometry(outerboxgeometry);
                let line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));

                line.position.x = -22 + i;
                line.position.y = -11.25 - row;
                line.position.z = 0;

                scene.add(line);
                scene.add(cur);

                element.push({ box: cur, out: line });

                cur = new THREE.Mesh(outerboxgeometry, outerboxmaterial);
                cur.position.x = -22 + i;
                cur.position.y = 11.25 + row;
                cur.position.z = 0;

                edges = new THREE.EdgesGeometry(outerboxgeometry);
                line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0xffffff }));

                line.position.x = -22 + i;
                line.position.y = 11.25 + row;
                line.position.z = 0;

                scene.add(line);
                scene.add(cur);

                element.push({ box: cur, out: line });
            }
        })
    }

    runAi() {
        if (ai >= 1) {
            if (Math.abs(player1.position.y - ball.position.y) > 1 && Math.abs(player1.position.x - ball.position.x) < 22)
                playe1Delta = (player1.position.y - ball.position.y) * -playerSpeed
            else
                playe1Delta = 0
        }
        if (ai == 2) {
            if (Math.abs(player2.position.y - ball.position.y) > 1 && Math.abs(player2.position.x - ball.position.x) < 22)
                playe2Delta = (player2.position.y - ball.position.y) * -playerSpeed
            else
                playe2Delta = 0
        }
    }

    loop() {

        if (ai != 0)
            runAi()
        requestAnimationFrame(loop);
        this.delta += this.clock.getDelta();
        if (this.delta > this.interval) {
            this.ball.updatepos({ x: this.ballvelocity.x, y: this.ballvelocity.y, z: 0 })
            checkBallBounce()
            if (
                this.player1
                    .updatepos({ x: 0, y: this.playe1Delta * this.delta, z: 0 })
                    .checkPlayerOutside()
                    .checkPlayerHit()
                ||
                this.player2
                    .updatepos({ x: 0, y: this.playe2Delta * this.delta, z: 0 })
                    .checkPlayerOutside()
                    .checkPlayerHit()
            )
                this.ballvelocity.x *= -1

            checkScore()
            updateOutside()
            this.delta = this.delta % this.interval;
            this.renderer.render(this.scene, this.camera);
        }

    }

    // makes the wave style outer boxes update
    updateOutside()
    {
        this.outerboxes.forEach((element, row) => {
            element.forEach((box, index) => {
                box.box.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                box.box.position.z = -1 + box.box.scale.z / 2
                box.out.scale.z = (Math.sin(Date.now() / 700 + index / 2 + row) + 2) / 1.5
                box.out.position.z = -1 + box.out.scale.z / 2
            });
        });
    }

    // changes gamestate
    checkScore() {
        if (this.ball.mesh.position.x > 21 || this.ball.mesh.position.x < -21) {
            this.ball.mesh.position.x = 0
            this.ball.mesh.position.y = 0
            if (this.this.ball.mesh.position > 21)
                this.score.player1 += 1;
            else
                this.score.player2 += 1;
        }
    }

    run() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        // needs to change to make an internal "game display"
        document.body.appendChild(renderer.domElement);

        this.clock = new THREE.Clock();
        loop()
    }

    checkBallBounce() {
        if (this.ball.mesh.position.y < -10) {
            this.ball.mesh.position.y = -10
            ballvelocity.y *= -1
        }
        else if (this.ball.mesh.position.y > 10) {
            this.ball.mesh.position.y = 10
            ballvelocity.y *= -1
        }
    }
}

class Box {
    constructor(_color, _outline, _size) {
        this.geometry = new THREE.BoxGeometry(_size.x, _size.y, _size.z)
        this.material = new THREE.MeshBasicMaterial({ color: _color })
        this.mesh = THREE.Mesh(this.geometry, this.material)
        this.outline = _outline
        if (_outline) {
            let edge = new THREE.EdgesGeometry(this.geometry);
            this.edge = new THREE.LineSegments(edge, new THREE.LineBasicMaterial({ color: 0xffffff }));
        }
    }

    updatepos(delta) {
        this.mesh.position.x += pos.x
        this.mesh.position.y += pos.y
        this.mesh.position.z += pos.z
        if (this.outline) {
            this.edge.position.x += pos.x
            this.edge.position.y += pos.y
            this.edge.position.z += pos.z
        }
        return this
    }

    checkPlayerOutside() {
        if (this.mesh.pos.y > 8.5) {
            this.mesh.pos.y = 8.5
            if (this.outline)
                this.edge.pos.y = 8.5
        }
        else if (this.mesh.pos.y < -8.5) {
            this.mesh.pos.y = -8.5
            if (this.outline)
                this.edge.pos.y = -8.5
        }
    }

    checkPlayerHit(ball) {
        if (
            Math.abs(ball.mesh.position.x - this.mesh.position.x) <= this.mesh.scale.x / 2 + ball.mesh.scale.x / 2
            &&
            Math.abs(ball.mesh.position.y - this.mesh.position.y) <= this.mesh.scale.y / 2 + ball.mesh.scale.y
        ) {
            // snap the position
            ball.mesh.position.x = this.mesh.position.x - this.mesh.scale.x / 2 - ball.mesh.scale.x / 2 - 0.01
            return true
        }
        return false
    }
}
