class Player {
    constructor(x, y, color, tile, move, mazeWalls, winPosition) {
        this.x = x;
        this.y = y;
        this.color = color


        this.tile = tile

        this.scale = 0.5

        this.move = move
        this.mazeWalls = mazeWalls
        this.winPosition = winPosition


        this.win = false

        console.log(this.mazeWalls)
    }

    update() {
        this.draw()

        if (this.win) {
            console.log("WINNNNNN !!!!!!!!!!!!!")
        }
    }

    draw() {
        ctx.fillStyle = this.color

        const w = this.tile.width * this.scale;
        const h = this.tile.height * this.scale;


        const x = this.x * this.tile.width + (this.tile.width - w) / 2;
        const y = this.y * this.tile.height + (this.tile.height - h) / 2;

        ctx.fillRect(x, y, w, h);

    }

    verifyPosition(x, y) {
        if (this.win) return
        for (let wall of this.mazeWalls) {
            if (wall.x === x && wall.y === y) return;
        }
        this.setPosition(x, y)
        this.checkWin()
    }

    setPosition(x, y) {
        this.x = x
        this.y = y
    }

    input(key) {
        if (key === this.move.up) this.verifyPosition(this.x, this.y - 1)
        if (key === this.move.down) this.verifyPosition(this.x, this.y + 1)
        if (key === this.move.left) this.verifyPosition(this.x - 1, this.y)
        if (key === this.move.right) this.verifyPosition(this.x + 1, this.y)
    }

    checkWin() {
        console.log(this.x, this.y, this.winPosition)
        if (this.x === this.winPosition.x && this.y === this.winPosition.y) this.win = true;
    }
}