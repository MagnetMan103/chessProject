const board = document.querySelector("#board")
const turnDisplay = document.querySelector("#turnDisplay")

function createSquare(father, color, i) {
    const newElement = document.createElement("div")
    newElement.className = "square"
    newElement.style.backgroundColor = color
    newElement.setAttribute("colnum", i)
    father.appendChild(newElement)
    return newElement;
}

function createRow(board, length, c) {
    const column = document.createElement("div")
    column.className = "row"
    column.setAttribute("rownum", c)
    let color;
    for (let i = 0; i < length; i++) {
        if ((c + i) % 2 === 0) {
            color = 'burlywood';
        } else {
            color = 'chocolate';
        }
        createSquare(column, color, i)
    }
    board.appendChild(column)
}

function createBoard(columns= 8) {
    for (let i = 0; i < columns; i++) {
        // creates the empty board
        createRow(board, 6, i)
    }
    for (let i = 0; i < pieces.length; i++) {
        // puts the pieces on the screen
        pieces[i].createPiece()
    }
}
class Game {

    attacked = []
    turn = 'white'
    wPieces = []
    bPieces = []
    constructor() {
        turnDisplay.textContent = `${this.turn} to move`
    }

    showCurrentArray() {
        if (this.turn === 'white') {
            return this.wPieces
        } else { return this.bPieces}
    }

    createAttack(x, y) {
        this.attacked.push([x, y])
    }

    resetAttack() {
        for (let i = 0; i < this.attacked.length; i ++) {
            let coords = this.attacked[i]
            let square = getSquare(coords[0], coords[1])
            let color;
            if ((coords[0] + coords[1])%2 === 0) {
                color = 'burlywood'
            } else { color = 'chocolate' }
            square.style.backgroundColor = color
        }
        this.attacked = []
    }

    changeTurn() {
        if (this.turn === 'white') {
            this.turn = 'black'
        }
        else {this.turn = 'white'}
        turnDisplay.textContent = `${this.turn} to move`

    }

    addPiece(x, y, src) {
        const newGuy = new Piece(x, y, src);
        if (src[0] === 'w') {
            this.wPieces.push(newGuy)
        }
        else {
            this.bPieces.push(newGuy)
        }
    }

    removePiece(squareCoords) {
        // pre req is that square coords has a piece unless en passant
        let piece = getPiece(squareCoords)
        if (piece === false) {
            if (this.turn === 'white') {
                squareCoords[1] --
            } else {squareCoords[1] ++}
            piece = getPiece(squareCoords)

        }
        const takenType = piece.type
        piece.deletePiece() // remove it from the dom
        let array // the array to iterate over
        if (piece.color === 'white') {
            array = this.wPieces;
        } else {array = this.bPieces}

        for (let i = 0; i < array.length; i++) {
            if (array[i] === piece) {
                array.splice(i, 1); // remove the piece from memory
                break;
            }
        }
        return takenType
    }

}

// now construct a piece class
class Piece {
    passant = false
    first = true
    constructor(x, y, src) {
        this.x = x;
        this.y = y;
        this.src = "/pieces/" + src + ".svg";
        if (src[1] === 'A') {
            this.src = "/pieces/" + src + ".png";
        }
        this.type = src[1]

        if (src[0] === 'w') {
            this.color = 'white'
        } else {this.color = 'black'}
    }
    createPiece() {
        let square = getSquare(this.x, this.y);
        let img = document.createElement("img");
        img.src = this.src;
        img.width = 75;
        img.height = 75;
        img.draggable = false;
        square.appendChild(img);
    }

    deletePiece() {
        let square = getSquare(this.x, this.y);
        square.removeChild(square.firstElementChild)
    }
    showOptions() {
        if (this.color !== activeGame.turn) { return }

        if (this.type === 'P') {
            this.showPawn();
        }

        else if (this.type === 'N') {
            this.showKnight();
        }
        else if (this.type === 'R') {
            this.showRook();
        }

        else if (this.type === 'B') {
            this.showBishop();
        }

        else if (this.type === 'Q') {
            this.showRook();
            this.showBishop();
        }

        else if (this.type === 'A') {
            this.showRook();
            this.showBishop();
            this.showKnight();
        }
    }

    showPawn() {
        let change;
        if (this.color === 'white') {
            change = 1
        } else {change = -1}
        if (getPiece([this.x, this.y + change]) === false && isBounded(this.x, this.y + change)) {
            createCircle(this.x, this.y + change)
            if (this.first && getPiece([this.x, this.y + change * 2]) === false) {
                createCircle(this.x, this.y + change * 2)
            }
        }
        let right = getPiece([this.x + 1, this.y + change])
        if (right !== false && right.color !== this.color) {
            const square = getSquare(this.x + 1, this.y + change);
            square.style.backgroundColor = 'red'
            activeGame.createAttack(this.x + 1, this.y + change)
        }
        let left = getPiece([this.x - 1, this.y + change])
        if (left !== false && left.color !== this.color) {
            const square = getSquare(this.x - 1, this.y + change);
            square.style.backgroundColor = 'red'
            activeGame.createAttack(this.x - 1, this.y + change)
        }
        const critical = 3.5 + change/2
        if (this.y === critical) {
            let rn = getPiece([this.x + 1, this.y])
            if (rn !== false && rn.passant) {
                const square = getSquare(this.x + 1, this.y + change);
                square.style.backgroundColor = 'red'
                activeGame.createAttack(this.x + 1, this.y + change)
            }
            let ln = getPiece([this.x - 1, this.y])
            if (ln !== false && ln.passant) {
                const square = getSquare(this.x - 1, this.y + change);
                square.style.backgroundColor = 'red'
                activeGame.createAttack(this.x - 1, this.y + change)
            }
        }

    }

    showKnight() {
        const moves = [[-1, 2],[-2, 1],[-2, -1],[-1, -2],[1, 2],[2, 1],[2, -1],[1, -2]]
        for (let i = 0; i < 8; i++) {
            if (isBounded(this.x + moves[i][0], this.y + moves[i][1])) {
                let candidate = getPiece([this.x + moves[i][0], this.y + moves[i][1]])
                if (candidate === false) {
                    createCircle(this.x + moves[i][0], this.y + moves[i][1])
                }
                else if (candidate.color !== this.color) {
                    makeAttack(this.x + moves[i][0], this.y + moves[i][1])
                }
            }
        }
    }

    showRook() {
        const home = [this.x, this.y]
        let consider;
        // for left
        consider = [home[0] - 1, home[1]]
        if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
            && getPiece(consider).color !== this.color) {
            makeAttack(consider[0], consider[1])
        }
        while (getPiece(consider) === false && isBounded(consider[0], consider[1])) {
            createCircle(consider[0], consider[1]);
            consider = [consider[0] - 1, consider[1]];
            if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
                && getPiece(consider).color !== this.color) {
                makeAttack(consider[0], consider[1])
                break;
            }

        }
        // for right
        consider = [home[0] + 1, home[1]]
        if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
            && getPiece(consider).color !== this.color) {
            makeAttack(consider[0], consider[1])
        }
        while (getPiece(consider) === false && isBounded(consider[0], consider[1])) {
            createCircle(consider[0], consider[1]);
            consider = [consider[0] + 1, consider[1]]
            if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
                && getPiece(consider).color !== this.color) {
                makeAttack(consider[0], consider[1])
                break;
            }

        }
        // for up
        consider = [home[0], home[1] + 1]
        if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
            && getPiece(consider).color !== this.color) {
            makeAttack(consider[0], consider[1])
        }
        while (getPiece(consider) === false && isBounded(consider[0], consider[1])) {
            createCircle(consider[0], consider[1]);
            consider = [consider[0], consider[1] + 1]
            if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
                && getPiece(consider).color !== this.color) {
                makeAttack(consider[0], consider[1])
                break;
            }
        }
        // for down
        consider = [home[0], home[1] - 1]
        if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
            && getPiece(consider).color !== this.color) {
            makeAttack(consider[0], consider[1])
        }
        while (getPiece(consider) === false && isBounded(consider[0], consider[1])) {
            createCircle(consider[0], consider[1]);
            consider = [consider[0], consider[1] - 1]
            if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
                && getPiece(consider).color !== this.color) {
                makeAttack(consider[0], consider[1])
                break;
            }
        }
    }

    showBishop() {
        const home = [this.x, this.y]
        let consider;
        // for -1 -1 diag
        consider = [home[0] - 1, home[1] - 1]
        if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
            && getPiece(consider).color !== this.color) {
            makeAttack(consider[0], consider[1])
        }
        while (getPiece(consider) === false && isBounded(consider[0], consider[1])) {
            createCircle(consider[0], consider[1]);
            consider = [consider[0] - 1, consider[1] - 1];
            if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
                && getPiece(consider).color !== this.color) {
                makeAttack(consider[0], consider[1])
                break;
            }

        }
        // for +1 + 1 diag
        consider = [home[0] + 1, home[1] + 1];
        if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
            && getPiece(consider).color !== this.color) {
            makeAttack(consider[0], consider[1])
        }
        while (getPiece(consider) === false && isBounded(consider[0], consider[1])) {
            createCircle(consider[0], consider[1]);
            consider = [consider[0] + 1, consider[1] + 1]
            if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
                && getPiece(consider).color !== this.color) {
                makeAttack(consider[0], consider[1])
                break;
            }

        }
        // for -1 + 1 diag
        consider = [home[0] - 1, home[1] + 1];
        if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
            && getPiece(consider).color !== this.color) {
            makeAttack(consider[0], consider[1])
        }
        while (getPiece(consider) === false && isBounded(consider[0], consider[1])) {
            createCircle(consider[0], consider[1]);
            consider = [consider[0] - 1, consider[1] + 1]
            if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
                && getPiece(consider).color !== this.color) {
                makeAttack(consider[0], consider[1])
                break;
            }
        }
        // for +1 -1 diag
        consider = [home[0] + 1, home[1] - 1]
        if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
            && getPiece(consider).color !== this.color) {
            makeAttack(consider[0], consider[1])
        }
        while (getPiece(consider) === false && isBounded(consider[0], consider[1])) {
            createCircle(consider[0], consider[1]);
            consider = [consider[0] + 1, consider[1] - 1]
            if (isBounded(consider[0], consider[1]) && getPiece(consider) !== false
                && getPiece(consider).color !== this.color) {
                makeAttack(consider[0], consider[1])
                break;
            }
        }
    }
}

function makeAttack(x, y) {
    const square = getSquare(x, y)
    square.style.backgroundColor = 'red'
    activeGame.createAttack(x, y)
}

function getSquare(x, y) {
    const rowElement = document.querySelector(`[rownum="${y}"]`);
    return rowElement.querySelector(`[colnum="${x}"]`);
}

function createPhantom(x, y, image) {
    let img = document.createElement("img");
    img.src = image.getAttribute("src")
    img.style.position = "absolute"
    img.style.left = `${x - 40}px`;
    img.style.top = `${y - 40}px`;
    img.width = 75;
    img.height = 75;
    img.draggable = false;
    img.id = "phantom"
    document.body.appendChild(img)
    return img
}

function showMoves(src, square) {
    const coords = getCoords(square)
    const piece = getPiece(coords)
    activePiece = piece;
    piece.showOptions()

    // show moves
}

function createCircle(x, y) {
    const square = getSquare(x, y)
    const circle = document.createElement("div")
    circle.className = "circle"
    circle.style.backgroundColor = 'blue'
    square.appendChild(circle)
}

function getCoords(squareElement) {
    // takes in a square element
    const cellPick = parseInt(squareElement.getAttribute("colnum"));
    const rowElement = squareElement.parentElement;
    const rowIndex = parseInt(rowElement.getAttribute("rownum"));
    return [cellPick, rowIndex]
}

function getPiece(area) {
    // finds a piece at an x, y coords
    for (let i = 0; i < activeGame.wPieces.length; i ++) {
        let piece = activeGame.wPieces[i]
        if (piece.x === area[0] && piece.y === area[1]) {
            return activeGame.wPieces[i]
        }
    }
    for (let i = 0; i < activeGame.bPieces.length; i ++) {
        let piece = activeGame.bPieces[i]
        if (piece.x === area[0] && piece.y === area[1]) {
            return activeGame.bPieces[i]
        }
    }
    return false
}

function deleteDots() {
    let dots = document.getElementsByClassName('circle');
    while(dots[0]) {
        dots[0].parentNode.removeChild(dots[0]);
    }
    activeGame.resetAttack()
}

function chooseMove() {
    const circles = document.querySelectorAll(".circle")
    circles.forEach(circle => circle.addEventListener("click", pickMove))
}

function noPassant() {
    // sets all piece passant to false
    for (let i = 0; i < activeGame.wPieces.length; i++) {
        activeGame.wPieces[i].passant = false
    }
    for (let i = 0; i < activeGame.bPieces.length; i++) {
        activeGame.bPieces[i].passant = false
    }
}

function pickMove(square) {
    const coords = getCoords(square)
    activePiece.deletePiece()
    activePiece.x = coords[0]
    activePiece.y = coords[1]
    if (activePiece.type === 'P' && (activePiece.y === 7 || activePiece.y === 0)) {
        console.log('yes')
        activePiece.type = 'Q'
        activePiece.src = `/pieces/${activePiece.color[0]}Q.svg`
    }
    activePiece.createPiece()
    noPassant()
    if (activePiece.first) {
        activePiece.first = false
        activePiece.passant = true
    }
    deleteDots()
    activeGame.changeTurn() // changes the turn
}

function eatPiece(square) {
    const newCoords = getCoords(square)
    const tookType = activeGame.removePiece(newCoords)
    const homeColor = activeGame.turn
    pickMove(square)
    const newGuy = rollEvo(tookType)
    if (newGuy === 1 || activeGame.showCurrentArray().length === 0) {
        turnDisplay.textContent = `${homeColor} wins!`
        activeGame = null
        return;
    }
    createHolderSprite(newGuy, homeColor)
    // put piece in limbo
}

function rollEvo(pieceType) {
    // returns a piece type or win
    if (pieceType === 'A') {
        return 2;
    }
    const types = ['P','N','B','R','Q']
    const rng = Math.floor(Math.random() * 2) === 0
    let index;
    for (let i = 0; i < 5; i ++) {
        if (types[i] === pieceType) {
            index = i
        }
    }
    if (rng) {
        index ++
    } else { index -- }
    if (index === -1) {
        index = 0;
    }
    if (index === 5) {
        return 1;
    }
    return types[index]
}

function createHolderSprite(pieceType, color) {
    if (pieceType === 2) {
        return;
    }
    let img = document.createElement("img");
    img.src = `/pieces/${color[0]}${pieceType}.svg`;
    if (pieceType === 'A') {
        img.src = `/pieces/${color[0]}${pieceType}.png`;
    }
    img.width = 75;
    img.height = 75;
    img.draggable = false;
    let holderChildren;
    let rownum;
    if (color === 'white') {
        holderChildren = document.querySelector("#whiteHolder").children;
        rownum = -2
    }
    else {
        holderChildren = document.querySelector("#blackHolder").children
        rownum = -1
    }

    for (let i = 0; i < 3; i ++) {
        if (holderChildren[i].children.length === 0) {
            holderChildren[i].appendChild(img)
            activeGame.addPiece(i * (-1) - 1, rownum, `${color[0]}${pieceType}`)
            break;
        }
    }
}
// circles.forEach(circle => circle.addEventListener("click", pickMove))

const summons = document.querySelectorAll(".summon")
summons.forEach(summon => summon.addEventListener("click", createAvatar))
function createAvatar() {
    let holderChildren;
    let rownum;
    if (this.id === 'white') {
        holderChildren = document.querySelector("#whiteHolder").children;
        rownum = -2;
    }
    else {
        holderChildren = document.querySelector("#blackHolder").children;
        rownum = -1
    }
    for (let i = 0; i < 3; i ++) {
        if (holderChildren[i].children.length === 0 || holderChildren[i].children[0].src.at(-5) === 'P' ||
            holderChildren[i].children[0].src.at(-5) === 'A') {
            return;
        }
    }
    for (let i = 0; i < 3; i ++) {
        activeGame.removePiece([i * (-1) - 1, rownum])
    }
    createHolderSprite('A', this.id)


}

function showHolderOptions(pieceType) {
    let rowStart = 0;
    let rowEnd = 7;
    if (pieceType === 'P') {
        rowStart = 1;
        rowEnd = 6;
    }
    for (let y = rowStart; y <= rowEnd; y++) {
        for (let x = 0; x <= 5; x++) {
            if (getPiece([x, y]) === false) {
                createCircle(x, y)
            }
        }
    }
}

function isBounded(x, y) {
    return x >= 0 && x <= 5 && y >= 0 && y <= 7
}
// actual code starts here

let pieces = [new Piece(0, 0, "wB"), new Piece(1, 0, "wN"),
    new Piece(2, 0, "wR"), new Piece(3, 0, "wQ"), new Piece(4, 0, "wN"),
    new Piece(5, 0, "wB"), new Piece(0, 1, "wP"), new Piece(1, 1, "wP"),
    new Piece(2, 1, "wP"), new Piece(3, 1, "wP"), new Piece(4, 1, "wP"),
    new Piece(5, 1, "wP"), new Piece(0, 7, "bB"), new Piece(1, 7, "bN"),
    new Piece(2, 7, "bR"), new Piece(3, 7, "bQ"), new Piece(4, 7, "bN"),
    new Piece(5, 7, "bB"), new Piece(0, 6, "bP"), new Piece(1, 6, "bP"),
    new Piece(2, 6, "bP"), new Piece(3, 6, "bP"), new Piece(4, 6, "bP"),
    new Piece(5, 6, "bP")]

// this fella creates an empty board
createBoard()

// create the Game object
let activeGame = new Game()
activeGame.wPieces = pieces.slice(0, 12)
activeGame.bPieces = pieces.slice(12)

// now dragging mechanic

let currentImage = null;
let phantomImage = null;
let shownSquares = false;
let activePiece;

// squares.forEach(square => square.addEventListener("click", moveMe));
// hoping for mouse down
let isMouseDown = false;

document.addEventListener('mousedown', function() {
    isMouseDown = true;
    // show possible moves
    const elements = document.elementsFromPoint(event.clientX, event.clientY)
    if (shownSquares === false &&
        elements[0].nodeName === "IMG") {
        shownSquares = true
        if (elements[3].id === 'limbo') {
            activePiece = getPiece(getCoords(elements[1]))
            if (activePiece.color !== activeGame.turn) {
                return;
            }
            showHolderOptions(elements[0].src.at(-5))
        } else {
            showMoves(elements[0].src, elements[1])
        }
        chooseMove()
    }

});
document.addEventListener('mouseup', function() {
    isMouseDown = false;
    if (currentImage !== null) {
        currentImage.style.opacity = "1";
        currentImage = null;
        phantomImage.remove();
        phantomImage = null;
    }
    if (shownSquares) {

        const elements = document.elementsFromPoint(event.clientX, event.clientY)
        if (elements[0].className === "circle") {
            pickMove(elements[1])
        }
        else if (elements[1].className === "square" && elements[1].style.backgroundColor === "red") {
            eatPiece(elements[1])
        }
        else if (elements[0].className === "square" && elements[0].style.backgroundColor === "red") {
            eatPiece(elements[0])
        }

        deleteDots()
        shownSquares = false

    }
    // do something
});

// Usage example:
document.addEventListener('mousemove', function(event) {
    if (isMouseDown) {
        if (currentImage !== null) {
            // phantomImage = document.querySelector("#phantom");
            phantomImage.style.left  = `${event.clientX - 40}px`;
            phantomImage.style.top  = `${event.clientY - 40}px`;
            return
        }
        let elements = document.elementsFromPoint(event.clientX, event.clientY)
        // console.log(event.clientX, event.clientY)
        if (elements[0].nodeName === "IMG") {
            currentImage = elements[0]
            currentImage.style.opacity = ".50";
            phantomImage = createPhantom(event.clientX, event.clientY, currentImage)
        }

        // Add any other logic here that you want to execute when the mouse is held down
    }
});




