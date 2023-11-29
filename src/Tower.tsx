import Monster from "./Monster.tsx";
import Shot from "./Shot.tsx"
import { Position } from "./Position";

class Tower {
    
    x: number;
    y: number;
    type: number;
    canfire: number;
    fieldsize: number;

    constructor(x: number, y: number, type: number, fieldsize : number) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.canfire = 0;
        this.fieldsize = fieldsize;

        this.draw = this.draw.bind(this);
        this.update = this.update.bind(this);
        this.canFire = this.canFire.bind(this);
    }

    update() {
        if (this.canfire < 210){
            this.canfire++;
        }
    }

    canFire(){
        return this.canfire == 210;
    }

    getShot(shotId: number, monster: Monster): Shot {
        this.canfire = 0;

        let position = new Position(this.x * this.fieldsize, this.y * this.fieldsize);
        let shot = new Shot(shotId, position, monster, this.fieldsize, this.type, 2);
        return shot;
      }

    isInDistance(monster: Monster) {
        if (Math.abs(monster.getPosition().getX() - this.x * this.fieldsize) < 50 && Math.abs(monster.getPosition().getY() - this.y * this.fieldsize) < 50){
            return true;
        } else {
            return false;
        }
      }

    draw(context: any, fieldsize: number) {
        if (this.type == 1){
            context.fillStyle="#FFAAAA";
        } else if (this.type == 2){
            context.fillStyle="#0000FF";
        } else if (this.type == 3){
            context.fillStyle="#FF0000";
        }
        
        context.fillRect(this.x * fieldsize, this.y * fieldsize, fieldsize, fieldsize);
    }
}

export default Tower;