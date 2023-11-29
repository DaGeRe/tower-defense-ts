import MonsterPath from "./MonsterPath.tsx";
import { Position } from "./Position";

enum States {
    Regular, Frozen, OnFire
}

class Monster  {
    id: number
    path: MonsterPath;
    virtualPosition : Position;
    positionIndex : number;
    fieldsize: number;
    finished: boolean;
    dead: boolean;
    sleeptime: number;
    state: States;
    stateTime : number;
    lives : number;


    constructor(id: number, path: MonsterPath , fieldsize: number, sleeptime: number) {
        this.id = id;
        this.finished = false;
        this.path = path;
        this.virtualPosition = new Position(path.getPath()[0].getX() * fieldsize, path.getPath()[0].getY() * fieldsize);
        this.positionIndex = 1;
        this.fieldsize = fieldsize;
        this.dead = false;
        this.sleeptime = sleeptime;
        this.state = States.Regular;
        this.stateTime = 0;
        this.lives = 10;

        this.update = this.update.bind(this);
        this.isFinished = this.isFinished.bind(this);
        this.getPosition = this.getPosition.bind(this);
        this.draw = this.draw.bind(this);
        
    }

    update(){
        if (this.finished || this.dead){
            return;
        }
        if (this.sleeptime > 0){
            this.sleeptime--;
            return;
        }

        if (this.stateTime > 0){
            this.stateTime--;
            if (this.stateTime == 0) {
                if (this.state == States.OnFire){
                    this.lives = this.lives - 1;
                }
                this.state = States.Regular;
            }
        }

        if (this.state == States.Frozen) {
            return;
        }

        let nextPosition = this.path.getPath()[this.positionIndex];
        
        let directionX;
        if (nextPosition.getX() * this.fieldsize == this.virtualPosition.getX()) {
            directionX = 0;
        } else {
            directionX = nextPosition.getX() * this.fieldsize > this.virtualPosition.getX() ? 1 : -1;
        }

        let directionY;
        if (nextPosition.getY() * this.fieldsize == this.virtualPosition.getY()) {
            directionY = 0;
        } else {
            directionY = nextPosition.getY() * this.fieldsize > this.virtualPosition.getY() ? 1 : -1;
        }
        
        if (directionX == 0 && directionY == 0){
            this.positionIndex = this.positionIndex+1;
            if (this.positionIndex >= this.path.getPath().length){
                this.finished = true;
            }
        } else {
            this.virtualPosition = new Position(this.virtualPosition.getX() + directionX, this.virtualPosition.getY() + directionY);
        }
    }

    isFinished(){
        return this.finished;
    }

    hit(type : number){
        if (type == 2) {
            this.state = States.Frozen;
            this.stateTime = 100;
        } else if (type == 3){
            this.state = States.OnFire;
            this.stateTime = 100;
        }
        this.lives = this.lives -1;
        if (this.lives < 1){
            this.dead = true;
        }
    }

    getPosition() {
        return this.virtualPosition;
    }

    draw(context: any, fieldsize: number) {
        switch (this.state){
            case States.Regular: context.fillStyle="#FFFFFF"; break;
            case States.Frozen: context.fillStyle="#AAAAFF"; break;
            case States.OnFire: context.fillStyle="#FFAAAA"; break;
        }
        
        context.fillRect(this.virtualPosition.getX()+3, this.virtualPosition.getY()+3, fieldsize-5, fieldsize-5);
    }
}

export default Monster;
