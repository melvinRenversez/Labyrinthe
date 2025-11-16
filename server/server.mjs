// server.mjs
import express from 'express';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

import Maze from './assets/maze.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 55555;

const posibleColor = ["blue", "yellow", "orange", "pink", "purple", "brown"];

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(PORT, () => {
  console.log(`Serveur HTTP sur http://10.242.212.88:${PORT}`);
});

const MazeSizeX = 50;
const MazeSizeY = 50;
var playerDefaultVision = 5
if (playerDefaultVision % 2 == 0) playerDefaultVision++

const visionItemAddValue = 2
const visionMutators = [
  {
    chance: 15,
    mutiplicator: 2
  }, {
    chance: 2,
    mutiplicator: 3
  }
]

var ziziPartyActivedDuration = 0
var ziziDuration = 30

var switchKey = false

var maze = new Maze(MazeSizeX, MazeSizeY);


// WebSocket sur le même serveur
const wss = new WebSocketServer({ server });
let players = {};

wss.on('connection', (ws) => {
  console.log('Nouvelle connexion WebSocket');
  const playerId = uuidv4();

  ws.uuid = playerId;

  const colorIndex = Math.floor(Math.random() * posibleColor.length)
  const color = posibleColor[colorIndex];
  // console.log(posibleColor)
  posibleColor.splice(colorIndex, 1);

  let newPlayerName = "Unknown" + randomSequence()

  // Créer le joueur
  players[playerId] = {
    color: color,
    position: { ...maze.getSpawnPosition() },
    speudo: newPlayerName,
    win: false,
    vision: playerDefaultVision,
    imunZiziItem: 0
  };

  ws.send(JSON.stringify({
    type: 'init', id: playerId, maze: maze.getAllInfo(),
    name: players[playerId].speudo,
    color: players[playerId].color,
    vision: players[playerId].vision,
    position: maze.getSpawnPosition(),
  }));


  broadcastAllPlayers();



  ws.on('message', (message) => {
    const data = JSON.parse(message);
    // console.log(data);

    if (data.type == 'move') {
      verifyMove(playerId, players[playerId].position, data.key);
    }

    if (data.type == 'changeName') {
      let playerName = data.name
      Object.values(players).forEach((player) => {
        if (player.speudo == playerName) {
          let seq = randomSequence()
          playerName += seq
        }
      })
      players[playerId].speudo = playerName;
      ws.send(JSON.stringify({ type: 'newName', name: players[playerId].speudo }));
      broadcastAllPlayers();
    }

    if (data.type == 'reset') {
      // console.log(playerId)
      // console.log(data)
      players[playerId].position = { ...data.position };
      broadcastAllPlayers();
    }

  });


  ws.on('close', () => {
    posibleColor.push(players[playerId].color);
    delete players[playerId];
  });

});

function broadcastAllPlayers() {


  wss.clients.forEach((client) => {


    const snapshot = [
      ...Object.entries(players)
        .filter(([id]) => id !== client.uuid)
        .map(([_, player]) => ({
          type: "other",
          color: player.color,
          position: player.position,
          speudo: player.speudo,
          win: player.win
        })),

      ...Object.entries(players)
        .filter(([id]) => id === client.uuid)
        .map(([_, player]) => ({
          type: "you",
          color: player.color,
          position: player.position,
          speudo: player.speudo,
          win: player.win
        }))
    ];



    client.send(JSON.stringify({
      type: 'allPlayers', players: snapshot
    }));

    client.send(JSON.stringify({
      type: 'updateMyPosition', position: players[client.uuid].position
    }));

    client.send(JSON.stringify({
      type: 'updateMyVision', vision: players[client.uuid].vision
    }))

    client.send(JSON.stringify({
      type: 'updateMaze', maze: maze.getAllInfo()
    }))
  });


}

function sendPopUp(playerId, message) {
  wss.clients.forEach((client) => {
    if (client.uuid == playerId) {
      client.send(JSON.stringify({ type: 'popUp', message: message }));
    }
  });
}

function verifyMove(playerId, position, key) {
  let m
  let imun
  switch (key) {
    case 'z':
      m = -1
      imun = players[playerId].imunZiziItem
      if(switchKey && !imun){
        m *= -1
      }
      if (maze.isWall(position.x, position.y + m)) return
      players[playerId].position.y += m;
      playerAsMove(playerId, position);
      broadcastAllPlayers();
      break;
    case 's':
      m = 1
      imun = players[playerId].imunZiziItem
      if(switchKey && !imun){
        m *= -1
      }
      if (maze.isWall(position.x, position.y + m)) return
      players[playerId].position.y += m;
      playerAsMove(playerId, position);
      broadcastAllPlayers();
      break;
    case 'q':
      m = -1
      imun = players[playerId].imunZiziItem
      if(switchKey && !imun){
        m *= -1
      }
      if (maze.isWall(position.x + m, position.y)) return
      players[playerId].position.x += m;
      playerAsMove(playerId, position);
      broadcastAllPlayers();
      break;
    case 'd':
      m = 1
      imun = players[playerId].imunZiziItem
      if(switchKey && !imun){
        m *= -1
      }
      if (maze.isWall(position.x + m, position.y)) return
      players[playerId].position.x += m;
      playerAsMove(playerId, position);
      broadcastAllPlayers();
      break;
  }

}

function playersTakeZiziItem(playerId, position) {
  maze.removeZiziItem(position);

  players[playerId].imunZiziItem += ziziDuration
  ziziPartyActivedDuration += ziziDuration
  
  sendPopUp(playerId, "Zizi Item active")
  broadcastAllPlayers();
}

function playerTakeVisionItem(playerId, position) {
  maze.removeVisionItem(position);

  let newVisionItemAddValue = visionItemAddValue;
  let chanceTry = Math.floor(Math.random() * 100);
  console.log("chanceTry", chanceTry)
  visionMutators.forEach(mutator => {
    // console.log("chancetTry", chanceTry)
    // console.log("multiplicator", mutator.mutiplicator)
    if (chanceTry < mutator.chance) {
      newVisionItemAddValue = visionItemAddValue * mutator.mutiplicator
    }
  })

  // console.log("visionItemAddValue", visionItemAddValue)


  players[playerId].vision += newVisionItemAddValue
  // console.log(players)

  sendPopUp(playerId, `Vision +${newVisionItemAddValue}`)
  broadcastAllPlayers();

}

function playerAsMove(playerId, position) {
  // console.log("playerAsMove")
  if (verifyWin(position)) players[playerId].win = true
  if (maze.isVisionItem(position.x, position.y)) playerTakeVisionItem(playerId, position)
  if (maze.isZiziItem(position.x, position.y)) playersTakeZiziItem(playerId, position)
}

function verifyWin(position) {
  return (position.x == maze.getWinPosition().x && position.y == maze.getWinPosition().y)
}


function randomSequence(size = 4) {
  let sequence = ""
  for (var i = 0; i < size; i++) {
    sequence += Math.floor(Math.random() * 10);
  }
  return sequence;
}


function newGame() {
  maze = new Maze(MazeSizeX, MazeSizeY);


  
  
  Object.values(players).forEach((player) => {
    let newVison = Math.floor(player.vision / 4)
    if (newVison < playerDefaultVision) newVison = playerDefaultVision
    if (newVison % 2 == 0) newVison++
    player.win = false
    player.vision = newVison,
    player.imunZiziItem = 0
  })
  ziziPartyActivedDuration = 0


  wss.clients.forEach((client) => {


    client.send(JSON.stringify({
      type: 'newMaze', maze: maze.getAllInfo()
    }));
  });

  broadcastAllPlayers();
}


function verifyAllPlayersWin() {
  let nbWin = 0;
  Object.values(players).forEach((player) => {
    if (player.win) nbWin++
  })
  // console.log("nbWin", nbWin)
  // console.log("player length", Object.values(players).length)
  if (nbWin == Object.values(players).length) return true
  return false
}

setInterval(() => {
  console.log(players)
  let allPlayerAreWin = verifyAllPlayersWin()
  if (allPlayerAreWin) newGame();


  if (ziziPartyActivedDuration > 0) {
    ziziPartyActivedDuration--
    switchKey = true
    console.log("ziziPartyActivedDuration", ziziPartyActivedDuration)
  }else {
    switchKey = false
  }

  Object.values(players).forEach((player) => {
    if (player.imunZiziItem > 0) {
      player.imunZiziItem--
    }
  })





  // console.log("allPlayerAreWin", allPlayerAreWin)
  // console.log(posibleColor)
}, 1000)
