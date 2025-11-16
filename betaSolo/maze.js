class Maze {
    constructor(width, height, tile) {
        this.width = width;
        this.height = height;
        this.tile = tile

        this.walls = [];
        this.winPosition = [];
        this.maze = this.mazeGenerator(width, height);
    }

    mazeGenerator() {
        if (this.width % 2 === 0) this.width++;
        if (this.height % 2 === 0) this.height++;

        const removeWalls = Math.floor(this.width * this.height / 10);
        let maze = Array.from({ length: this.height }, () => Array(this.width).fill(1));
        const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];

        let startX = 1, startY = 1;
        const self = this;

        const carve = function (x, y) {
            maze[y][x] = 0;
            const shuffled = directions.sort(() => Math.random() - 0.5);

            for (let [dx, dy] of shuffled) {
                let nx = x + dx, ny = y + dy;
                if (ny > 0 && ny < self.height - 1 && nx > 0 && nx < self.width - 1 && maze[ny][nx] === 1) {
                    maze[y + dy / 2][x + dx / 2] = 0;
                    carve(nx, ny);
                }
            }
        };

        carve(startX, startY);

        // Définir le start
        maze[startY][startX] = 2;

        // ------------------------------
        // Placer la sortie (win) aléatoirement sur une case vide
        // ------------------------------
        let emptyCells = [];
        for (let row = 1; row < this.height - 1; row++) {
            for (let col = 1; col < this.width - 1; col++) {
                if (maze[row][col] === 0) emptyCells.push({ x: col, y: row });
            }
        }

        // Choisir une cellule vide aléatoire pour la sortie
        const winCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        maze[winCell.y][winCell.x] = 3;
        this.winPosition = { x: winCell.x, y: winCell.y };

        // Supprimer quelques murs pour augmenter la difficulté
        for (let i = 0; i < removeWalls; i++) {
            let rx = Math.floor(Math.random() * (this.width - 2)) + 1;
            let ry = Math.floor(Math.random() * (this.height - 2)) + 1;
            if (maze[ry][rx] === 1) maze[ry][rx] = 0;
        }

        // Stocker les murs
        this.walls = [];
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (maze[row][col] === 1) {
                    this.walls.push({
                        x: col,
                        y: row
                    });
                }
            }
        }

        return maze;
    }


    draw() {
        for (let row = 0; row < this.width; row++) {
            for (let col = 0; col < this.height; col++) {
                const cell = this.maze[row][col]

                if (cell == 1) {
                    ctx.fillStyle = 'black'
                } else if (cell == 3) {
                    ctx.fillStyle = 'green'
                } else {
                    ctx.fillStyle = 'white'
                }

                ctx.fillRect(col * this.tile.width, row * this.tile.height, this.tile.width, this.tile.height)
            }
        }
    }

    getWalls() {
        return this.walls;
    }

    getWinPosition() {
        return this.winPosition;
    }
}






