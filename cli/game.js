import {Field} from "./field.js";
import {UP, DOWN, LEFT, RIGHT, MOVES, EMPTY, VISITED, CURRENT} from "./lib/utils.js";

const INPUT_MOVE = "\nWhich move to take? (up/down/left/right)";

/*
    Game Start:
 */

let field = new Field(5,5,[[2,0], [3,0], [4,0], [0,4], [1,4]]);
field.startCell = [1,2];
console.clear();

let currentCell = field.startCell;
let possibleMoves = field.showPossibleMoves(currentCell);

console.log(field.toString());
console.log(INPUT_MOVE);

/*
    Input loop:
 */

process.stdin.on('data', data => {
    let input = data.toString().trim();
    console.clear();
    let editedCells = Object.values(possibleMoves).map(e => e[0] || e).filter(e => e.length > 0);


    if (![UP, DOWN, LEFT, RIGHT].includes(input)) { // determine falsy input
        console.log("\nInvalid input.");
        console.log(field.toString());
        console.log(INPUT_MOVE);

    } else {
        if (!(possibleMoves[input].length > 0)) {
            console.log("\nThis move is not possible at the moment.");
            console.log(field.toString());
            console.log(INPUT_MOVE);
        } else {
            // has been won?
            if (field.filledCells === field.height * field.width -1) {
                field.clearCells(editedCells);
                field.go(currentCell, input);
                console.log(field.toString());
                console.log("\nYou've won!");
                process.exit();
            }
            field.clearCells(editedCells);
            currentCell = field.go(currentCell, input);
            possibleMoves = field.showPossibleMoves(currentCell);
            console.log(field.toString());
            if (possibleMoves[UP].length === 0 && possibleMoves[DOWN].length === 0
                && possibleMoves[LEFT].length === 0 && possibleMoves[RIGHT].length === 0) {
                console.log("\n You've lost!");
                process.exit();
            }
            console.log(INPUT_MOVE);
        }
    }
});