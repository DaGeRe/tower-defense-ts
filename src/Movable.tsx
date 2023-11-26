import { Position } from "./Position";

class Movable {
    virtualPosition: Position;
    goal: Position;
    finished: boolean;
    fieldsize: number;
    velocity: number;

    constructor(virtualPosition: Position, goal: Position, fieldsize: number, velocity: number) {
        this.virtualPosition = virtualPosition;
        this.goal = goal;
        this.finished = false;
        this.fieldsize = fieldsize;
        this.velocity = velocity;

        this.update = this.update.bind(this);
    }

    update() {
        if (this.finished) {
            return;
        }

        let directionX;
        let goalx = this.goal.getX();
        if (goalx == this.virtualPosition.getX()) {
            directionX = 0;
        } else {
            directionX = goalx > this.virtualPosition.getX() ? this.velocity : -this.velocity;
        }

        let directionY;
        if (this.goal.getY() == this.virtualPosition.getY()) {
            directionY = 0;
        } else {
            directionY = this.goal.getY() > this.virtualPosition.getY() ? this.velocity : -this.velocity;
        }

        if (directionX == 0 && directionY == 0) {
            this.finished = true;
        } else {
            this.virtualPosition = new Position(this.virtualPosition.getX() + directionX, this.virtualPosition.getY() + directionY);
        }
    }
}

export default Movable;