import * as React from 'react';
import './App.css'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tower from './Tower.tsx'
import MonsterPath from './MonsterPath.tsx';
import Monster from './Monster.tsx';
import GameLoop from './game-loop.js';
import Shot from './Shot.tsx';

function addTower() {
  const element = document.getElementById("mainGame");
  const context = element.getContext("2d");

  context.fillStyle = "#FF0000";
  context.fillRect(10, 10, 150, 150);
}

function App() {
  const [chosenTower, setChosenTower] = React.useState<number>(1)
  const [gold, setGold] = React.useState<number>(250)
  const [nextWave, setNextWave] = React.useState<number>(200)
  const [lives, setLives] = React.useState<number>(10)
  const [level, setLevel] = React.useState<number>(1)

  const mapsizeX = 90;
  const mapsizeY = 60;
  const fieldsize = 30;

  const towers: Tower[] = [];
  const monsters : Monster[] = [];
  const shots : Shot[] = [];
  const monsterPath = new MonsterPath();

  let tower = "regular";

  function handleClick(event) {
    var canvas = document.getElementById("mainGame");

    var x : number;
    var y : number;

    if (event.x != undefined && event.y != undefined) {
      x = event.x;
      y = event.y;
    }
    else // Firefox method to get the position
    {
      x = event.clientX + document.body.scrollLeft +
        document.documentElement.scrollLeft;
      y = event.clientY + document.body.scrollTop +
        document.documentElement.scrollTop;
    }

    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;

    //const context = canvas.getContext("2d");

    const posx = (x / fieldsize) | 0;
    const posy = (y / fieldsize) | 0;

    console.log("Remaining gold: " + gold + " Chosen: " + chosenTower);
    let cost;
    switch (chosenTower){
      case 1: cost = 10; break;
      case 2: cost = 20; break;
      case 3: cost = 20; break;
    }
    if (gold >= cost) {
      setGold(gold - cost);
      let tower = new Tower(posx, posy, chosenTower, fieldsize);
      let newIndex = towers.length;
      towers[newIndex] = tower;
    }

    draw();
  }

  function handleFrame() {
    console.log("Next Wave: "  + nextWave);
    setNextWave(nextWave-1);
    console.log("Next Wave: "  + nextWave);

    let shotsToDelete = [];
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      shot.update();
      if (shot.isFinished()){
        shotsToDelete.push(i);
      }
    }
    for (const deleteId of shotsToDelete) {
      shots.splice(deleteId, 1);
    }

    for (let i = 0; i < monsters.length; i++) {
      const monster = monsters[i];
      monster.update();
      if (monster.dead){
        monsters.splice(i, 1);
        setGold(gold+1);
        console.log("Getting gold");
      } else if (monster.finished) {
        monsters.splice(i, 1);
        setLives(lives-1);
        console.log("State changed, lives: " + lives);
        if (lives - 1 < 1){
          console.log("Finishing");
          loop.stop();
          loop.unsubscribe(1);
          let canvas = document.getElementById("mainGame");
          let ctx = canvas.getContext("2d");
          ctx.font = "68px serif";
          ctx.fillText("Game Over", 100, 250);
          return;
        }
      }
    }
    for (const tower of towers) {
      tower.update();
      if (tower.canFire()) {
        for (const monster of monsters) {
          if (tower.isInDistance(monster) && tower.canFire()) {
            shots.push(tower.getShot(monster));
          }
        }
      }
    }

    if (nextWave <= 0) {
      setNextWave(2000);
      setLevel(level+1);
      setGold(gold+20);

      console.log("Created monster");
      for (let i = 0; i < 10 * level; i++) {
        monsters.push(new Monster(monsterPath, fieldsize, i * 70));
      }
    }
    draw();
  }

  function start() {
    const loop = new GameLoop();

    loop.subscribe(handleFrame);
    loop.start();
  }

  function draw() {
    var canvas = document.getElementById("mainGame");
    const context = canvas.getContext("2d");

    for (const tower of towers) {
      tower.draw(context, fieldsize);
    }
    for (const shot of shots) {
      shot.draw(context, fieldsize);
    }
    monsterPath.draw(context, fieldsize);

    for (const monster of monsters) {
      monster.draw(context, fieldsize);
    }
  }

  function handleTower(event, newTower: string){
    tower = newTower;
    if (newTower == 'regular') {
      setChosenTower(1);
    }
    if (newTower == 'ice') {
      setChosenTower(2);
    }
    if (newTower == 'fire') {
      setChosenTower(3);
    }
    console.log(newTower + " Chosen: " + chosenTower);
  }

  return (
      <>
        <h1>Tower Defense</h1>
        <button onClick={start}>Start</button>
        <div>
          <ToggleButtonGroup
            value={tower}
            exclusive
            onChange={handleTower}
            aria-label="chosenTower">
            <ToggleButton value="regular">
              Regular Tower (10 Gold)
            </ToggleButton>
            <ToggleButton value="ice">
              Ice Tower (20 Gold)
            </ToggleButton>
            <ToggleButton value="fire">
              Fire Tower (20 Gold)
            </ToggleButton>
          </ToggleButtonGroup>
          </div>
          <div>
          Gold: {gold}<br />
          Next Wave: {nextWave / 100 | 0} Level: {level} <br />
          Lives: {lives}<br />
          </div>
          <canvas id='mainGame' className='gameregion' width="900" height="600"
                onClick={handleClick}>
            </canvas>
        
      </>
    )
}

export default App
