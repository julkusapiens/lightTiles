export const random = (max, min=0) => Math.floor(Math.random() * (max+1-min) + min);
export const UP = 0;
export const RIGHT = 1;
export const DOWN = 2;
export const LEFT = 3;
export const MOVES = ["^", ">", "v", "<"];
export const EMPTY = " ";
export const VISITED = "#";
export const CURRENT = "O";
export const BLOCKED = "X";

export class Field {
    constructor(height = 5, width = 5, filler) {
        this._height = height;
        this._width = width;
        this._filler = filler;

        this._cellsToExclude = [];
        this._filledCells = 0;
        this._field = Array.from({length: this._height}, e => Array.from({length: this._width}, f => EMPTY));

        this._startCell = [];
        this.fillX(filler);
    }

    removeCellFromCellArray(cell, cellArray) {
        let thisCellIdx = cellArray.findIndex(e => e[0] === cell[0] && e[1] === cell[1]);
        return [...cellArray.slice(0,thisCellIdx), ...cellArray.slice(thisCellIdx+1)];
    }

    /**
     * If given an array of cell coordinates, fills them with Xs and saves them to be excluded.
     * Else, fills random number of non excluded cells with Xs that are saved to be excluded.
     * @param filler Either an array of cell coordinates or a number of the percent of cells to fill
     */
    fillX(filler = []) {
        if (typeof filler === "object") {
            for (let cell of filler) {
                if (!this.findCellInArray(cell, this._cellsToExclude)) {
                    this.fillCell(cell, BLOCKED);
                    this._cellsToExclude.push(cell);
                }
            }
        } else if (typeof filler === "number") {
            let i = 0;
            let fieldSize = this._height * this._width;
            let maxXs = Math.floor((fieldSize * filler) / 100);
            while (i++ < maxXs) {
                let randCell = this.randomCell(this._cellsToExclude);
                this.fillCell(randCell, BLOCKED);
                this._cellsToExclude.push(randCell);
            }
        }
    }

    /**
     * Returns true or false whether a certain cell coordinate was found in an array of cell coordinates
     * @param cell The coordinates of the cell [x,y]
     * @param cellArray The array of cell coordinates to search in [[a1,b1], [a2,b2], …]
     * @returns {boolean}
     */
    findCellInArray(cell, cellArray) {
        for (let currCell of cellArray) {
            if (cell[0] === currCell[0] && cell[1] === currCell[1]) return true;
        }
        return false;
    }

    /**
     * Returns an array of all adjacent cells in the given direction.
     * @param cell The coordinates of the cell [x,y]
     * @param direction The direction constant UP/DOWN/LEFT/RIGHT
     * @param excludeCells An array of cells that block the row.
     * @returns {*[]} Array of all adjacent cells in one direction.
     */
    findCellsInDirection(cell, direction=-1, excludeCells = this._cellsToExclude) {
        let xMin = 0;
        let yMin = 0;
        let cellX = cell[0];
        let cellY = cell[1];

        // remove current cell from excludedCells
        let excludeCellsWOCell = this.removeCellFromCellArray(cell, excludeCells);

        // Determine minimal x and y coordinates, relative to the cell.
        // Barriers can be excluded cells or the border of the field.
        if (direction === LEFT || direction === RIGHT) {
            // find minimal x-coordinate
            for (let x = cellX; x >= 0; x--) {
                xMin = x+1;
                if (this.findCellInArray([x, cellY], excludeCellsWOCell)) break;
                xMin = x;
            }
        } else if (direction === UP || direction === DOWN) {
            // find minimal y-coordinate
            for (let y = cellY; y >= 0; y--) {
                yMin = y+1;
                if (this.findCellInArray([cellX, y], excludeCellsWOCell)) break;
                yMin = y;
            }
        }

        // Generate an array of all cells in the given direction.
        switch (direction) {
            case UP : {
                let cellRowNegY = [];
                for (let y = yMin; y < cellY; y++) {
                    cellRowNegY.push([cellX, y]);
                }
                return cellRowNegY.reverse();
            }
            case DOWN : {
                let cellRowPosY = [];
                for (let y = cellY+1; y < this._height; y++) {
                    let newCell = [cellX, y];
                    if (this.findCellInArray(newCell, excludeCells)) break;
                    cellRowPosY.push(newCell);
                }
                return cellRowPosY;
            }
            case LEFT : {
                let cellRowNegX = [];
                for (let x = xMin; x < cellX; x++) {
                    cellRowNegX.push([x, cellY]);
                }
                return cellRowNegX.reverse();
            }
            case RIGHT : {
                let cellRowPosX = [];
                for (let x = cellX+1; x < this._width; x++) {
                    let newCell = [x, cellY];
                    if (this.findCellInArray(newCell, excludeCells)) break;
                    cellRowPosX.push(newCell);
                }
                return cellRowPosX;
            }
            default : {
                return [];
            }
        }
    }

    /**
     * Returns an array of the adjacent (non-excluded) cell above, below, to the left and to the right of a given cell.
     * @param cell The current cell [x, y]
     * @param excludeCells An array of cells to be excluded
     * @returns {*[]} Array of the adjacent cells in every direction to the cell.
     */
    findNearestNeighborCells(cell, excludeCells = this._cellsToExclude) {
        let neighbors = [];
        for (let c of [ [cell[0]+1, cell[1]], [cell[0], cell[1]+1],
                        [cell[0]-1, cell[1]], [cell[0], cell[1]-1]]) {
            if (!(c[0] > this._width-1 || c[0] < 0 || c[1] > this._height-1 || c[1] < 0)
                && !this.findCellInArray(c, excludeCells)) {
                neighbors.push(c);
            }
        }
        return neighbors;
    }

    /**
     * Returns the coordinates of a random cell
     * @param excludeCells An array of cell coordinates that will not be returned
     * @returns {number[]} A random cell coordinate
     */
    randomCell(excludeCells = []) {
        let randX = 0;
        let randY = 0;
        if (excludeCells.length > 0) {
            do {
                randX = random(this._width-1);
                randY = random(this._height-1);
            } while (this.findCellInArray([randX, randY], excludeCells));
        } else {
            randX = random(this._width-1);
            randY = random(this._height-1);
        }
        return [randX, randY];
    }

    /**
     * Changes the value of a certain cell
     * @param x The x-coordinate of the given cell
     * @param y The y-coordinate of the given cell
     * @param content The value that will replace the current one
     * @returns {*[]} The coordinates of the given cell
     */
    fillCell([x, y], content) {
        if (x < this._width && x >= 0 && y < this._height && y >= 0) {
            if (this._field[y][x] === " ") this._filledCells++;
            this._field[y][x] = content;
            return [x, y];
        }
        return [];
    }

    resetField() {
        return new Field(this._height, this._width, this._filler);
    }

    /**
     * Inserts move symbols ^/v/</> into the cells around a given cell.
     * @param cell The current active cell [x, y]
     * @returns {*[][]} An array with all edited neighbor cells
     */
    showPossibleMoves(cell) {
        let editedCells = [ [], [], [], [] ]; // up, right, down, left
        let cellX = cell[0];
        let cellY = cell[1];
        for (let c of this.findNearestNeighborCells(cell)) {
            if (cellX-c[0] === 0) {
                if (cellY-c[1] === 1) { // up
                    this.fillCell(c, MOVES[UP]);
                    this._filledCells--;
                    editedCells[UP].push(c);
                }
                if (cellY-c[1] === -1) { // down
                    this.fillCell(c, MOVES[DOWN]);
                    this._filledCells--;
                    editedCells[DOWN].push(c);
                }
            }
            if (cellY-c[1] === 0) {
                if (cellX-c[0] === 1) { // left
                    this.fillCell(c, MOVES[LEFT]);
                    this._filledCells--;
                    editedCells[LEFT].push(c);
                }
                if (cellX-c[0] === -1) { // right
                    this.fillCell(c, MOVES[RIGHT]);
                    this._filledCells--;
                    editedCells[RIGHT].push(c);
                }
            }
        }
        return editedCells;
    }

    /**
     * Sets the values of a given cell array to EMPTY
     * @param editedCells An array of cell coordinates
     */
    clearCells(editedCells) {
        for (let c of editedCells) {
            this.fillCell(c, EMPTY);
        }
    }

    /**
     * Executes a move. Follows an array of cell coordinates, marks and blocks the visited cells.
     * @param cell The current active cell [x, y] from which the move begins
     * @param direction A possible direction (up/down/left/right)
     * @returns {*} The coordinates of the ending cell (= the new current cell)
     */
    go(cell, direction = -1) {
        this.fillCell(cell, VISITED);
        let row = this.findCellsInDirection(cell, direction);
        let lastCell;
        for (let c of row) {
            lastCell = c;
            this.fillCell(c, VISITED);
            this._cellsToExclude.push(c);
        }
        this.fillCell(lastCell, CURRENT);
        return lastCell;
    }

    set startCell(cell) {
        if (this.findCellInArray(cell, this._cellsToExclude)) this._startCell = [];
        else {
            let sC = this.fillCell(!cell.length ? this.randomCell(this._cellsToExclude) : cell, CURRENT);
            this._cellsToExclude.push(sC);
            this._startCell = sC;
        }
    }

    get startCell() {
        return this._startCell;
    }
    get filledCells() {
        return this._filledCells;
    }

    get height() {
        return this._height;
    }

    get width() {
        return this._width;
    }

    toString() {
        let out = "\n    y\\x\t  ";
        for (let i = 0; i < this._width; i++) {
            out += ` ${i} `;
        }
        let widthCount = 0;
        for (let heightCount = 0; heightCount < this._height; heightCount++) {
            out += `\n\t${heightCount} `;
            for (let widthCount = 0; widthCount < this._width; widthCount++) {
                let cellValue = this._field[heightCount][widthCount];
                out += ` ${cellValue === " " ? "_" : cellValue} `;
            }
        }
        return out;
    }
}