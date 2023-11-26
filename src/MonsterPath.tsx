import { Position } from "./Position";

class MonsterPath {
    path: Array<Position>;

    constructor(){
        this.path = new Array();
        
        for (let i = 0; i < 30; i++){
            this.path.push(new Position(i,1));
        }
        for (let i = 1; i < 15; i++){
            this.path.push(new Position(29,i));
        }
        for (let i = 30; i > 0; i--){
            this.path.push(new Position(i,14));
        }
        for (let i = 15; i < 19; i++){
            this.path.push(new Position(1,i));
        }
        for (let i = 1; i < 30; i++){
            this.path.push(new Position(i,19));
        }
    }

    draw(context: any, fieldsize: number) {
        context.fillStyle="#CCCCCC";
        for (const position of this.path){
            context.fillRect(position.getX() * fieldsize, position.getY() * fieldsize, fieldsize, fieldsize);
        }
    }

    getPath() : Array<Position> {
        return this.path;
    }
}

export default MonsterPath;