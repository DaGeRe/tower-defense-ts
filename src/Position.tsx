export class Position {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;

        this.getX = this.getX.bind(this);
        this.getY = this.getY.bind(this);
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }
}
