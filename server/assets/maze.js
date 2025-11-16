export default class Maze {
    constructor(width, height) {
        this.width = width;
        this.height = height;

        this.walls = [];
        this.winPosition = {};
        this.spawnPosition = {};
        this.visionItemsPosition = [];
        this.ziziItemsPostion = [];

        this.blocks = {
            floor: 0,
            wall: 1,
            spawn: 2,
            win: 3,
            visionItem: 4,
            ziziItem: 5
        }


        this.maze = this.mazeGenerator(width, height);


    }

    mazeGenerator() {
        if (this.width % 2 === 0) this.width++;
        if (this.height % 2 === 0) this.height++;

        // 1 - Générer la base du maze
        const maze = this.generateMaze();

        // 2 - Placer la victoire
        this.placeWin(maze);

        // 3 - Placer le spawn (en évitant la position win)
        this.placeSpawn(maze);

        // 4 - Enlever des murs
        this.removeRandomWalls(maze);

        // 5 - Placer des items de vision
        this.placeVisionItem(maze);

        // 6 - Placer des items de zizi
        this.placeZiziItem(maze);

        this.walls = [];
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (maze[row][col] === 1) {
                    this.walls.push({ x: col, y: row });
                }
            }
        }

        // console.log(maze);
        return maze;
    }


    generateMaze() {
        let maze = Array.from({ length: this.height }, () => Array(this.width).fill(1));
        const directions = [[0, -2], [2, 0], [0, 2], [-2, 0]];
        const self = this;

        function carve(x, y) {
            maze[y][x] = 0;
            const shuffled = directions.sort(() => Math.random() - 0.5);

            for (let [dx, dy] of shuffled) {
                let nx = x + dx, ny = y + dy;
                if (ny > 0 && ny < self.height - 1 && nx > 0 && nx < self.width - 1 && maze[ny][nx] === 1) {
                    maze[y + dy / 2][x + dx / 2] = 0;
                    carve(nx, ny);
                }
            }
        }

        carve(1, 1);
        return maze;
    }


    placeWin(maze) {
        let emptyCells = [];

        for (let row = 1; row < this.height - 1; row++) {
            for (let col = 1; col < this.width - 1; col++) {
                if (maze[row][col] === 0) emptyCells.push({ x: col, y: row });
            }
        }

        const winCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        maze[winCell.y][winCell.x] = 3;

        this.winPosition = winCell;
    }


    placeSpawn(maze) {
        let emptyCells = [];

        for (let row = 1; row < this.height - 1; row++) {
            for (let col = 1; col < this.width - 1; col++) {
                if (maze[row][col] === 0) emptyCells.push({ x: col, y: row });
            }
        }

        let spawnCell;
        do {
            spawnCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        } while (this.winPosition && spawnCell.x === this.winPosition.x && spawnCell.y === this.winPosition.y);

        maze[spawnCell.y][spawnCell.x] = 2;
        this.spawnPosition = spawnCell;
    }

    removeRandomWalls(maze) {
        const removeWalls = Math.floor(this.width * this.height / 10);

        for (let i = 0; i < removeWalls; i++) {
            let rx = Math.floor(Math.random() * (this.width - 2)) + 1;
            let ry = Math.floor(Math.random() * (this.height - 2)) + 1;

            if (maze[ry][rx] === 1) {
                maze[ry][rx] = 0;
            }
        }
    }

    placeVisionItem(maze) {
        const nbVisionItem = Math.floor((this.height * this.width) * 0.005 ) + 1;
        // const nbVisionItem = Math.floor((this.height * this.width) /10 );
        const radius = 5;

        // Fonction utilitaire : vérifier si un autre item est dans le rayon
        const isNearOtherItem = (x, y) => {
            for (let item of this.visionItemsPosition) {
                const dx = item.x - x;
                const dy = item.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= radius) return true;
            }
            return false;
        };

        for (let i = 0; i < nbVisionItem; i++) {
            let attempts = 0;
            let placed = false;

            while (!placed && attempts < 100) { // éviter une boucle infinie
                attempts++;

                let rx = Math.floor(Math.random() * (this.width - 2)) + 1;
                let ry = Math.floor(Math.random() * (this.height - 2)) + 1;

                // Case doit être du vide
                if (maze[ry][rx] !== 0) continue;

                // Vérifier qu'il n'y a pas un autre item dans un rayon de X
                if (isNearOtherItem(rx, ry)) continue;

                // OK → placer l'item
                this.visionItemsPosition.push({ x: rx, y: ry });
                maze[ry][rx] = 4;
                placed = true;
            }
        }

        console.log(">> nbVisionItem", nbVisionItem);
    }

    placeZiziItem(maze) {
        const nbZiziItem = Math.floor((this.height * this.width) * 0.0005 ) + 1;
        // const nbZiziItem = Math.floor((this.height * this.width) /10 );
        const radius = 30;

        // Fonction utilitaire : vérifier si un autre item est dans le rayon
        const isNearOtherItem = (x, y) => {
            for (let item of this.ziziItemsPostion) {
                const dx = item.x - x;
                const dy = item.y - y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist <= radius) return true;
            }
            return false;
        };

        for (let i = 0; i < nbZiziItem; i++) {
            let attempts = 0;
            let placed = false;

            while (!placed && attempts < 100) { // éviter une boucle infinie
                attempts++;

                let rx = Math.floor(Math.random() * (this.width - 2)) + 1;
                let ry = Math.floor(Math.random() * (this.height - 2)) + 1;

                // Case doit être du vide
                if (maze[ry][rx] !== 0) continue;

                // Vérifier qu'il n'y a pas un autre item dans un rayon de X
                if (isNearOtherItem(rx, ry)) continue;

                // OK → placer l'item
                this.ziziItemsPostion.push({ x: rx, y: ry });
                maze[ry][rx] = this.blocks.ziziItem;
                placed = true;
            }
        }

        console.log(">> nbZiziItem", nbZiziItem);
        
    }


    removeVisionItem(position){
        this.visionItemsPosition = this.visionItemsPosition.filter(item => item.x !== position.x || item.y !== position.y);
        this.maze[position.y][position.x] = this.blocks.floor
    }

    removeZiziItem(position){
        this.ziziItemsPostion = this.ziziItemsPostion.filter(item => item.x !== position.x || item.y !== position.y);
        this.maze[position.y][position.x] = this.blocks.floor
    }

    isWall(x, y) {
        // console.log("isWall")
        // console.log(x, y)
        return this.maze[y][x] === this.blocks.wall;
    }

    isVisionItem(x, y) {
        return this.maze[y][x] === this.blocks.visionItem;
    }

    isZiziItem(x, y) {
        return this.maze[y][x] === this.blocks.ziziItem;
    }


    getWalls() {
        return this.walls;
    }

    getWinPosition() {
        return this.winPosition;
    }

    getSpawnPosition() {
        return this.spawnPosition;
    }

    getVisionItemsPosition() {
        return this.visionItemsPosition;
    }


    getAllInfo() {
        return {
            walls: this.walls,
            winPosition: this.winPosition,
            spawnPosition: this.spawnPosition,
            visionItemsPosition: this.visionItemsPosition,
            ziziItemsPostion: this.ziziItemsPostion,
            width: this.width,
            height: this.height
        }
    }
}
