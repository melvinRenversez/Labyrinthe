const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

CANVAS_HEIGHT = canvas.height = 600;
CANVAS_WIDTH = canvas.width = 600;

console.log(CANVAS_HEIGHT, CANVAS_WIDTH)

const mazeDimensions = {
    width:  20 ,
    height: 20 
}

if (mazeDimensions.width % 2 === 0) mazeDimensions.width++;
if (mazeDimensions.height % 2 === 0) mazeDimensions.height++;

const tile = {
    width: CANVAS_WIDTH / mazeDimensions.width,
    height: CANVAS_HEIGHT / mazeDimensions.height
}



const maze = new Maze(mazeDimensions.width, mazeDimensions.height, { width: tile.width, height: tile.height })


const player = new Player(1, 1, 'red', { width: tile.width, height: tile.height }, 
    {
        up: "z",
        down: "s",
        left: "q",
        right: "d"
    },
    maze.getWalls(),
    maze.getWinPosition()
)

window.addEventListener('keydown', (e) => player.input(e.key))


let win = false;

function gameLoop() {
    maze.draw()
    player.update()
    requestAnimationFrame(gameLoop)
}

gameLoop();













































// function initGame() {
//     for (let row = 0; row < MAZE_HEIGHT; row++) {
//         for (let col = 0; col < MAZE_WIDTH; col++) {
//             const cell = MAZE[row][col]
//             if (cell == 2) {
//                 player.setPosition(col, row)    
//             }

//         }
//     }
//     win = false
//     gameLoop()
// }


// function tryToMove(x, y) {
//     if (win) return;
//     const cell = MAZE[y][x]

//     if (cell == 0 || cell == 2) {
//         player.setPosition(x, y)
//     }else if (cell == 3) {
//         player.setPosition(x, y)
//         console.log('Win')
//         win = true
//     }else {
//         console.log('Wall')
//     }
// }



// initGame()



// window.addEventListener('keydown', (e) => {
//     console.log(e.key)

//     if(e.key == "q") {
//         tryToMove(player.x - 1, player.y)
//     } else if(e.key == "d") {
//         tryToMove(player.x + 1, player.y)
//     } else if(e.key == "z") {
//         tryToMove(player.x, player.y - 1)
//     } else if(e.key == "s") {
//         tryToMove(player.x, player.y + 1)
//     }
// })