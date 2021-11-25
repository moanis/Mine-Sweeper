function createMat(iSize, jSize) {
  var mat = [];
  for (var i = 0; i < iSize; i++) {
    var row = [];
    for (var j = 0; j < jSize; j++) {
      row.push("");
    }
    mat.push(row);
  }
  return mat;
}

function renderCell(location, value) {
  var elCell = document.querySelector(`.cell-${location.i}-${location.j}`);
  elCell.innerHTML = value;
}

function getRandomIntInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function getRandomEmptyCell(board) {
  var emptyCells = [];

  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];
      if (!currCell.isMine) {
        var emptyCellPos = { i, j };
        emptyCells.push(emptyCellPos);
      }
    }
  }
  var randomIdx = getRandomIntInt(0, emptyCells.length);
  var emptyCell = emptyCells[randomIdx];
  return emptyCell;
}
