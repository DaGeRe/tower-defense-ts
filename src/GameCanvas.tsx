import * as React from 'react';
import './App.css'
import Tower from './Tower.tsx'
import MonsterPath from './MonsterPath.tsx';
import Monster from './Monster.tsx';
import Shot from './Shot.tsx';
import { useEffect } from 'react';
import { useFrameTime } from './App.tsx';

export interface IGameCanvasProps {
  monsters: Monster[];
  towers: Tower[];
  shots: Shot[];
  onHandleClick: React.MouseEventHandler;
  gameOver: boolean;
}


export const GameCanvas: React.FC<IGameCanvasProps> = ({monsters, towers, shots, onHandleClick, gameOver}) => {
  const frameTime = useFrameTime();

  const fieldsize: number = 30;
  const monsterPath = new MonsterPath();

  useEffect(() => {
    if(!gameOver) {
      draw();
    }
  }, [frameTime]);

  useEffect(() => {
    if(gameOver) {
          let canvas = document.getElementById("mainGame") as HTMLCanvasElement;
          let ctx = canvas.getContext("2d");
          ctx.font = "68px serif";
          ctx.fillText("Game Over", 100, 250);
    }
  }, [gameOver]);


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



  return (
    <>


        <canvas id='mainGame' className='gameregion' width="900" height="600"
              onClick={onHandleClick}>
          </canvas>
      
    </>
  )
}
