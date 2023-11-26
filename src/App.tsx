import * as React from 'react';
import './App.css'
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tower from './Tower.tsx'
import MonsterPath from './MonsterPath.tsx';
import Monster from './Monster.tsx';
import GameLoop from './game-loop.js';

function addTower() {
  const element = document.getElementById("mainGame");
  const context = element.getContext("2d");

  context.fillStyle = "#FF0000";
  context.fillRect(10, 10, 150, 150);
}

class App extends React.Component {
  mapsizeX: number;
  mapsizeY: number;
  fieldsize: number;

  tower: string;
  gold: number;

  towers: Array<Tower>;
  monsters: Array<Monster>;
  shots: Array<Shot>;
  monsterPath: MonsterPath;

  constructor(P: any) {
    super(P);
    this.mapsizeX = 90;
    this.mapsizeY = 60;
    this.fieldsize = 30;
    this.gold = 100;

    this.towers = [];
    this.monsters = [];
    this.shots = [];
    this.monsterPath = new MonsterPath();

    this.handleClick = this.handleClick.bind(this);
    this.draw = this.draw.bind(this);
    this.handleTower = this.handleTower.bind(this);
    this.start = this.start.bind(this);
    this.state = {
      chosenTower: 1,
      gold: 250,
      nextWave: 200,
      lives: 10,
      level: 1
    };

    this.tower = "regular";
  }

  handleClick(event) {
    var canvas = document.getElementById("mainGame");

    var x = new Number();
    var y = new Number();

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

    let posx = (x / this.fieldsize) | 0;
    let posy = (y / this.fieldsize) | 0;

    console.log("Remaining gold: " + this.state.gold + " Chosen: " + this.state.chosenTower);
    let cost;
    switch (this.state.chosenTower){
      case 1: cost = 10; break;
      case 2: cost = 20; break;
      case 3: cost = 20; break;
    }
    if (this.state.gold >= cost) {
      this.setState({gold: this.state.gold-cost});
      let tower = new Tower(posx, posy, this.state.chosenTower, this.fieldsize);
      let newIndex = this.towers.length;
      this.towers[newIndex] = tower;
    }

    this.draw();
  }

  start() {
    const loop = new GameLoop();

    loop.subscribe(() => {
      this.setState({ nextWave: this.state.nextWave - 1 });

      let shotsToDelete = [];
      for (let i = 0; i < this.shots.length; i++) {
        const shot = this.shots[i];
        shot.update();
        if (shot.isFinished()){
          shotsToDelete.push(i);
        }
      }
      for (const deleteId of shotsToDelete) {
        this.shots.splice(deleteId, 1);
      }

      for (let i = 0; i < this.monsters.length; i++) {
        const monster = this.monsters[i];
        monster.update();
        if (monster.dead){
          this.monsters.splice(i, 1);
          this.setState({ gold: this.state.gold + 1 });
          console.log("Getting gold");
        } else if (monster.finished) {
          this.monsters.splice(i, 1);
          this.setState({ lives: this.state.lives - 1 });
          console.log("State changed, lives: " + this.state.lives);
          if (this.state.lives - 1 < 1){
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
      for (const tower of this.towers) {
        tower.update();
        if (tower.canFire()) {
          for (const monster of this.monsters) {
            if (tower.isInDistance(monster) && tower.canFire()) {
              this.shots.push(tower.getShot(monster));
            }
          }
        }
      }

      if (this.state.nextWave <= 0) {
        this.setState({ nextWave: 2000, level: this.state.level+1, gold: this.state.gold+20 });

        console.log("Created monster");
        for (let i = 0; i < 10 * this.state.level; i++) {
          this.monsters.push(new Monster(this.monsterPath, this.fieldsize, i * 70));
        }
      }
      this.draw();
    });

    loop.start();
  }

  draw() {
    var canvas = document.getElementById("mainGame");
    const context = canvas.getContext("2d");

    for (const tower of this.towers) {
      tower.draw(context, this.fieldsize);
    }
    for (const shot of this.shots) {
      shot.draw(context, this.fieldsize);
    }
    this.monsterPath.draw(context, this.fieldsize);

    for (const monster of this.monsters) {
      monster.draw(context, this.fieldsize);
    }
  }

  handleTower(event, newTower: string){
    this.tower = newTower;
    if (newTower == 'regular') {
      this.setState({chosenTower: 1});
    }
    if (newTower == 'ice') {
      this.setState({chosenTower: 2});
    }
    if (newTower == 'fire') {
      this.setState({chosenTower: 3});
    }
    console.log(newTower + " Chosen: " + this.state.chosenTower);
    this.render();
  }

  render() {
    return (
      <>
        <h1>Tower Defense</h1>
        <button onClick={this.start}>Start</button>
        <div>
          <ToggleButtonGroup
            value={this.tower}
            exclusive
            onChange={this.handleTower}
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
          Gold: {this.state.gold}<br />
          Next Wave: {this.state.nextWave / 100 | 0} Level: {this.state.level} <br />
          Lives: {this.state.lives}<br />
          </div>
          <canvas id='mainGame' className='gameregion' width="900" height="600"
                onClick={this.handleClick}>
            </canvas>
        
      </>
    )
  }
}

export default App
