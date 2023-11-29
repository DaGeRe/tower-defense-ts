import * as React from 'react';
import './App.css'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tower from './Tower.tsx'
import MonsterPath from './MonsterPath.tsx';
import Monster from './Monster.tsx';
import GameLoop from './game-loop.js';
import Shot from './Shot.tsx';
import { useEffect, useState } from 'react';

const useFrameTime = () => {
  const [frameTime, setFrameTime] = React.useState(performance.now());
  useEffect(() => {
    let frameId;
    const frame = (time) => {
      setFrameTime(time);
      frameId = requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, []);
  return frameTime;
};

export const App: React.FC = () => {
  const frameTime = useFrameTime();

  const mapsizeX: number = 90; //unused
  const mapsizeY: number = 60; //unused
  const fieldsize: number = 30;
  const monsterPath = new MonsterPath();

  const [towers, setTowers] = useState<Tower[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [shots, setShots] = useState<Shot[]>([]);

  const [nextWave, setNextWave] = useState<number>(200);
  const [gold, setGold] = useState<number>(250);
  const [chosenTower, setChosenTower] = useState<number>(1);
  const [tower, setTower] = useState<string>("regular");
  const [lives, setLives] = useState<number>(10);
  const [level, setLevel] = useState<number>(1);
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const [idCounter, setIdCounter] = useState<number>(0);

  useEffect(() => {
    if(gameStarted) {
      handleFrame();
    }
  }, [frameTime]);

  const handleClick = (event) => {
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

    const posx = (x / fieldsize) | 0;
    const posy = (y / fieldsize) | 0;

    console.log("Remaining gold: " + gold + " Chosen: " + chosenTower);
    let cost: number;
    switch (chosenTower){
      case 1: cost = 10; break;
      case 2: cost = 20; break;
      case 3: cost = 20; break;
    }
    if (gold >= cost) {
      setGold(gold - cost);
      setTowers([...towers, new Tower(posx, posy, chosenTower, fieldsize)])
    }

    draw();
  }

  const start = () => {
    setGameStarted(true);
    // const loop = new GameLoop();
    // loop.subscribe(handleFrame);
    // loop.start();
  }

  const handleFrame = () => {
    setNextWave(nextWave - 1);
    let id = idCounter;

    let shotsToDelete = [];
    for (const shot of shots) {
      shot.update();
      if (shot.isFinished()){
        shotsToDelete.push(shot.id);
      }
    }
    setShots(shots.filter(x => shotsToDelete.find(y => y == x.id) === -1))

    let monstersToDelete = [];
    for (const monster of monsters) { 
      monster.update();
      if (monster.dead){
        monstersToDelete.push(monster.id);
        setGold(gold + 1);
        console.log("Getting gold, monsters remaining: " + monsters.length);
      } else if (monster.finished) {
        monstersToDelete.push(monster.id);
        setLives(lives - 1);
        console.log("State changed, lives: " + lives);
        if (lives - 1 < 1){
          console.log("Finishing");
          setGameStarted(false);
          // loop.stop();
          // loop.unsubscribe(1);
          let canvas = document.getElementById("mainGame") as HTMLCanvasElement;
          let ctx = canvas.getContext("2d");
          ctx.font = "68px serif";
          ctx.fillText("Game Over", 100, 250);
          return;
        }
      }
    }
    if(monstersToDelete.length > 0) {
      console.log(monstersToDelete)
      setMonsters(monsters.filter(x => monstersToDelete.find(y => y == x.id) === -1))
    }


    for (const tower of towers) {
      tower.update();
      if (tower.canFire()) {
        for (const monster of monsters) {
          if (tower.isInDistance(monster) && tower.canFire()) {
            id = id + 1;
            setShots([...shots, tower.getShot(id, monster)]);
          }
        }
      }
    }

    if (nextWave <= 0) {
      setNextWave(2000);
      setLevel(level + 1);
      setGold(gold+20);

      console.log("Created monster");
      let newMonsters = [];
      for (let i = 0; i < 10 * level; i++) {
        id = id + 1;
        newMonsters.push(new Monster(id, monsterPath, fieldsize, i * 70));
      }
      setMonsters([...monsters, ...newMonsters])
      console.log(newMonsters)
    }
    setIdCounter(id);
    draw();
}

  const draw = () => {
    var canvas = document.getElementById("mainGame") as HTMLCanvasElement;
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



  const handleTower = (event, newTower: string) => {
    setTower(newTower);
    switch (newTower){
      case "regular": setChosenTower(1); break;
      case "ice": setChosenTower(2); break;
      case "fire": setChosenTower(3); break;
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
