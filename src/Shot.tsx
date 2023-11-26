import Movable from "./Movable";
import { Position } from "./Position";
import Monster from "./Monster";

class Shot extends Movable {
    aim: Monster;
    type: number;
    arrived: boolean;

    constructor(virtualPosition: Position, aim : Monster, fieldsize: number, type: number, velocity: number){
        super(virtualPosition, aim.getPosition(), fieldsize, velocity);

        this.type = type;
        this.aim = aim;
        this.arrived = false;

        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);

        console.log("Created shot");
    }

    update() {
        super.update();

        super.goal = this.aim.getPosition();

        if (Math.abs(this.aim.getPosition().getX() - this.virtualPosition.getX()) < 5 && 
            Math.abs(this.aim.getPosition().getY() - this.virtualPosition.getY()) < 5) {
                this.aim.hit(this.type);
                this.arrived = true;
        }
    }

    draw(context: any, fieldsize: number) {
        context.fillStyle="#FFFFFF";

        context.beginPath();
        context.arc(this.virtualPosition.getX(), this.virtualPosition.getY(), this.fieldsize / 4, 0, 2 * Math.PI, false);
        context.fillStyle = 'green';
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = '#003300';
        context.stroke();
    }

    isFinished(){
        return this.arrived;
    }
}

export default Shot;