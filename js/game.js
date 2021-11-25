"use strict";
const EMPTY = "";
const MINE = "💥";
const FLAG = "🚩";
const DEAD = '<img src="img/smile.png" />';
const WIN = '<img src="img/play.png" />';
const PLAY = '<img src="img/play.png" />';

// Global variables
var gBoard;
var gGame = {
  isOn: true,
  shownCount: 0,
  markedCount: 0,
  secsPassed: 0,
  lifes: 1,
};
var gLevel = {
  size: 4,
  mines: 2 * this.size,
};

var elapsedTime;
var timerId;
var gFirstClick;
var gFirstMines;

function initGame() {
  gBoard = buildBoard();
  createMines();
  setMinesNegsCount(gBoard);
  renderBoard(gBoard);
  gGame.isOn = true;
  clearInterval(timerId);
  elapsedTime = 0;
  timerId = null;
  gFirstClick = true;
  gFirstMines = false;
}

function createMines() {
  for (var i = 0; i <= gLevel.size - 1; i++) {
    var CellPos = getRandomEmptyCell(gBoard);
    var randomCell = gBoard[CellPos.i][CellPos.j];
    console.log(randomCell);
    randomCell.isMine = true;
    console.log("created mine - " + JSON.stringify(randomCell));
  }
}

function buildBoard() {
  var board = createMat(gLevel.size, gLevel.size);

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
      };
      board[i][j] = cell;
    }
  }

  return board;
}

function setMinesNegsCount(board) {
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      currCell.minesAroundCount = numberOfNegs(i, j, board);
    }
  }
  return board;
}
function numberOfNegs(row, cols, board) {
  var counter = 0;
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;
    for (var j = cols - 1; j <= cols + 1; j++) {
      if (j < 0 || j > board[i].length - 1) continue;
      if (i === row && j === cols) continue;
      if (board[i][j].isMine) counter++;
    }
  }

  return counter;
}

function renderBoard(board) {
  var strHTML = '<table border="0"><tbody>';
  for (var i = 0; i < board.length; i++) {
    strHTML += "<tr>";
    for (var j = 0; j < board[0].length; j++) {
      var cell = board[i][j];
      var className = `cell cell-${i}-${j}`;
      strHTML +=
        `<td class="${className}" onclick="cellClicked(this,${i}, ${j})"` +
        " onmousedown=(rightClick(event,this))> ";

      if (cell.isShown) {
        if (cell.isMine) {
          strHTML += MINE;
        } else strHTML += cell.minesAroundCount;
      } else strHTML += "";
      strHTML += "</td>";
    }
    strHTML += "</tr>";
  }
  strHTML += "</tbody></table>";
  var elDivContainer = document.querySelector(".board");
  elDivContainer.innerHTML = strHTML;
}

function firstClick() {
  if (gFirstClick && !gFirstMines) {
    gGame.isOn = true;
    gFirstClick = false;
    gFirstMines = true;
  } else {
    // createMines();
    // gBoard = setMinesNegsCount(gBoard);
    // renderBoard(gBoard);
  }
}

function cellClicked(elCell, i, j) {
  firstClick();
  if (!gGame.isOn) return;
  if (!timerId) setTimer();

  if (gBoard[i][j].isShown) return;
  if (!gBoard[i][j].minesAroundCount) findNegs(gBoard, elCell, i, j);

  renderDom(elCell, i, j);
}
function renderDom(elCell, i, j) {
  var clickedCell = gBoard[i][j];

  if (!clickedCell.isShown && !clickedCell.isMine) {
    clickedCell.isShown = true;
    gGame.shownCount++;

    elCell.classList.add("revealed");
    var cellValue = getCellValue(clickedCell);
    renderCell({ i, j }, cellValue);

    checkGameOver();
  }
  if (clickedCell.isMine) {
    revealMineCells();
    gameOver(false);
    gGame.lifes++;
  }
}

function revealMineCells() {
  for (var i = 0; i < gBoard.length; i++) {
    for (var j = 0; j < gBoard.length; j++) {
      var location = { i, j };
      if (gBoard[i][j].isMine) {
        renderCell(location, MINE);
      }
    }
  }
}

function getCellValue(cell) {
  if (cell.isMine) {
    return MINE;
  } else if (cell.minesAroundCount > 0) {
    return cell.minesAroundCount;
  } else return "";
}

function setLevel(lvl) {
  gLevel.size = lvl;
  restart();

  initGame();
}

function rightClick(event, elCell) {
  var currPosition = cellPos(elCell);
  var currCell = gBoard[currPosition.i][currPosition.j];
  console.log("the current cell is" + JSON.stringify(currCell));

  window.addEventListener("contextmenu", (e) => e.preventDefault());
  if (event.which === 3) {
    if (currCell.isMarked) {
      currCell.isMarked = false;
      currCell.isShown = false;
      gGame.markedCount--;
      renderCell(currPosition, EMPTY);
    } else {
      currCell.isMarked = true;
      currCell.isShown = false;
      gGame.markedCount++;
      renderCell(currPosition, FLAG);
    }
  }
}

function cellPos(elCell) {
  console.log("all classes " + elCell.classList);
  var posAt = elCell.classList[1].split("-");
  console.log("split position is " + posAt);
  var i = posAt[1];
  var j = posAt[2];

  return { i, j };
}

function checkGameOver() {
  if (gGame.markedCount + gGame.shownCount === Math.pow(gLevel.size, 2)) {
    gGame.isOn = false;
    gameOver(true);
  }
}

function gameOver(isVictory) {
  var elImg = document.querySelector(".smily");
  if (!isVictory) {
    document.querySelector(".all").style.pointerEvents = "none";
    clearInterval(timerId);
    var elTimer = document.querySelector(".timer");
    elTimer.innerText = "";

    openModal(isVictory);
  }
}

function openModal(isVictory) {
  var elModal = document.querySelector(".modal");
  elModal.style.display = "block";
  var elImg = document.querySelector(".smily");

  var elText = elModal.querySelector("p");
  elText.innerText = isVictory ? "You won!!! 🏆" : "You lost! Let's try angin ";
  var elButRes = document.querySelector(".restart-button");
  if (gGame.lifes < 3) {
    elImg.innerHTML = DEAD;
    elText.innerText =
      "you lost but still have " + (3 - gGame.lifes) + " lifes";
    elButRes.innerText = "play";
  } else {
    elText.innerText = "you lost the game, restart to play";
    elButRes.innerText = "restart";

    elImg.innerHTML = DEAD;
  }
}

function closeModal() {
  var elModal = document.querySelector(".modal");
  elModal.style.display = "none";
}

function restart() {
  gGame.isOn = true;
  gGame.shownCount = 0;
  gGame.markedCount = 0;
  gGame.secsPassed = 0;
  if (gGame.lifes > 3) {
    gGame.lifes = 1;
  }

  closeModal();
  document.querySelector(".all").style.pointerEvents = "stroke";
  initGame();
}

function setTimer() {
  timerId = setInterval(function () {
    elapsedTime += 1;
    document.querySelector(".timer").innerText = elapsedTime
      .toString()
      .padStart(3, "0");
  }, 1000);
}

function findNegs(board, elCell, row, cols) {
  // looping all possible zero nigs
  for (var i = row - 1; i <= row + 1; i++) {
    if (i < 0 || i > board.length - 1) continue;
    for (var j = cols - 1; j <= cols + 1; j++) {
      if (j < 0 || j > board[i].length - 1) continue;
      if (i === row && j === cols) continue;
      if (
        board[i][j].minesAroundCount === 0 &&
        !board[i][j].isMine &&
        !board[i][j].isShown
      ) {
        //rendering the dom
        var elNCell = document.querySelector(`.cell-${i}-${j}`);
        //rendering founded cell
        renderDom(elNCell, i, j);
        //recursive function
        findNegs(board, elCell, i, j);
      }
    }
  }
}
