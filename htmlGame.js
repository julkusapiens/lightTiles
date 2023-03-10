import {Field, MOVES, EMPTY, VISITED, CURRENT, BLOCKED, UP, DOWN, LEFT, RIGHT} from "./fieldHTML.js";
import {LevelArray} from "./levelArray.js";


let CSS_CELL_CLASSES = {};
CSS_CELL_CLASSES[CURRENT] = "yellow";
CSS_CELL_CLASSES[VISITED] = "green";
CSS_CELL_CLASSES[EMPTY] = "blank";
CSS_CELL_CLASSES[BLOCKED] = "red";
CSS_CELL_CLASSES[MOVES[UP]] = "up";
CSS_CELL_CLASSES[MOVES[RIGHT]] = "right";
CSS_CELL_CLASSES[MOVES[DOWN]] = "down";
CSS_CELL_CLASSES[MOVES[LEFT]] = "left";

let EMOJI_CELL_CLASSES = {};
EMOJI_CELL_CLASSES[CURRENT] = "🟨";
EMOJI_CELL_CLASSES[VISITED] = "🟩";
EMOJI_CELL_CLASSES[EMPTY] = "⬛";
EMOJI_CELL_CLASSES[BLOCKED] = "🟥";
EMOJI_CELL_CLASSES[MOVES[UP]] = EMOJI_CELL_CLASSES[EMPTY];
EMOJI_CELL_CLASSES[MOVES[RIGHT]] = EMOJI_CELL_CLASSES[EMPTY];
EMOJI_CELL_CLASSES[MOVES[DOWN]] = EMOJI_CELL_CLASSES[EMPTY];
EMOJI_CELL_CLASSES[MOVES[LEFT]] = EMOJI_CELL_CLASSES[EMPTY];

function generateFieldTable(field) {
    let fieldTable = document.createElement("table");
    fieldTable.id = "gameTable";
    //fieldTable.style.aspectRatio = `${fieldWidth} / ${fieldHeight}`;
    let fieldArray = field._field;
    for (let row of fieldArray) {
        let tr = fieldTable.insertRow();
        for (let cell of row) {
            let cellClass = CSS_CELL_CLASSES[cell];
            let td = tr.insertCell();
            td.classList.add(`${cellClass}`);
        }
    }
    return fieldTable;
}

function renderFieldEmojis(field) {
    let fieldEmojis = "";
    let fieldArray = field._field;
    for (let row of fieldArray) {
        fieldEmojis += "\n";
        for (let cell of row) {
            fieldEmojis += EMOJI_CELL_CLASSES[cell];
        }
    }
    return fieldEmojis;
}

function detectClickedCell(event) {
    let table = document.getElementById("gameTable");
    let height = field.height;
    let width = field.width;
    let xCoords = Array.from({length: width},
    (e, i) => table.offsetLeft + ((i+1) * (table.offsetWidth / width)));
    let yCoords = Array.from({length: height},
    (e, i) => table.offsetTop + ((i+1) * (table.offsetHeight / height)));
    let currentCell = [xCoords.findIndex(e => event.clientX < e),
    yCoords.findIndex(e => event.clientY < e)];
    if (event.clientX < table.offsetLeft || event.clientY < table.offsetTop) return [-1,-1];
    return currentCell;
}

function updateGame() {
    tableAnchor.removeChild(tableAnchor.lastChild);
    let htmlTable = generateFieldTable(field);
    tableAnchor.appendChild(htmlTable);
}

function writeMessage(msg) {
    messageBox.innerHTML = msg;
    messageBox.style.display = "block";
    setTimeout(() => {
        messageBox.style.cssText = "";
        messageBox.innerHTML = "";
    }, 1000);
}

/* Game Bar */

document.getElementById('homeBtn').addEventListener("click", () => {
    window.location.replace("./menu.html");
});
document.getElementById('levelBtn').addEventListener("click", () => {
    window.location.replace("./levels.html");
});
document.getElementById('shareBtn').addEventListener("click", () => {
    window.navigator.clipboard.writeText(renderFieldEmojis(field)).then(() => {
        writeMessage("Copied to Clipboard!");
    });
});

/* Variable Declaration */

let tableAnchor = document.getElementById("tableDiv");
let btn = document.getElementById("coordBtn");
let endText = document.getElementById("ending");
let messageBox = document.getElementById("message");
let possibleMoves;
let currentCell;

/*  Initialize field  */

const urlParams = new URLSearchParams(window.location.search);
let levelNumber = urlParams.get("l");
let level = LevelArray[levelNumber];
if (!levelNumber || level === undefined) {
    window.location.replace("./menu.html");
}
endText.innerHTML = "";

let field = new Field(...level);
updateGame();

/*  Game loop  */

btn.addEventListener("click", event => {
    btn.disabled = true;

    let clickedCell = detectClickedCell(event);
    //console.log(clickedCell);

    if (clickedCell[0] >= field.width || clickedCell[0] < 0
        || clickedCell[1] >= field.height || clickedCell[1] < 0) {
        writeMessage("Out of bounds.");
    } else {
        // set start cell if not already set
        if (!field.startCell.length) {
            currentCell = clickedCell;
            field.startCell = currentCell;
            // check if start cell has been set (may not have been set if clickedCell is one that is excluded)
            if (field.startCell.length) {
                possibleMoves = field.showPossibleMoves(currentCell);
                updateGame();
            }
        } else {
            let direction = possibleMoves.findIndex(dir => !dir.length ? undefined :
                            dir[0][0] === clickedCell[0] && dir[0][1] === clickedCell[1]);
            let editedCells = possibleMoves.map(e => e[0] || e).filter(e => e.length > 0);
            //console.log(MOVES[direction]);

            if (![UP, DOWN, LEFT, RIGHT].includes(direction)) { // determine falsy input
                writeMessage("Invalid input.");
                updateGame();
            } else {
                field.clearCells(editedCells);
                currentCell = field.go(currentCell, direction);
                possibleMoves = field.showPossibleMoves(currentCell);
                updateGame();
                // has been won?
                if (field.filledCells === field.height * field.width) {
                    field.fillCell(currentCell, VISITED);
                    updateGame();
                    btn.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
                    endText.innerHTML = "You Win";
                    setTimeout(() => {  window.location.replace(`./game.html?l=${++levelNumber}`) }, 2000);
                } else // has been lost?
                if (possibleMoves[UP].length === 0 && possibleMoves[DOWN].length === 0
                    && possibleMoves[LEFT].length === 0 && possibleMoves[RIGHT].length === 0) {
                    field = field.resetField();
                    updateGame();
                }
            }
        }
    }

    btn.disabled = false;
});

