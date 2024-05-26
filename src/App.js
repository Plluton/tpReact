import { useState } from "react";

export default function App() {
  const [players, setPlayers] = useState(null);
  const [player1Wins, setPlayer1Wins] = useState(0);
  const [player2Wins, setPlayer2Wins] = useState(0);

  function handleStart(player1, player2) {
    setPlayers({ player1, player2 });
  }

  function handleQuit() {
    setPlayers(null);
  }

  function handleWin(winner) {
    if (winner === "X") {
      setPlayer1Wins(player1Wins + 1);
    } else if (winner === "O") {
      setPlayer2Wins(player2Wins + 1);
    }
  }

  return (
    <div className="app">
      {players ? (
        <Game
          player1={players.player1}
          player2={players.player2}
          onQuit={handleQuit}
          onWin={handleWin}
          player1Wins={player1Wins}
          player2Wins={player2Wins}
        />
      ) : (
        <Welcome onStart={handleStart} />
      )}
    </div>
  );
}

function Welcome({ onStart }) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [error, setError] = useState("");

  function handleStart() {
    if (!player1 || !player2) {
      setError("Les deux noms doivent être renseignés.");
      return;
    }
    setError("");
    onStart(player1, player2);
  }

  return (
    <div className="welcome">
      <h1>Bienvenue au jeu de Tic-Tac-Toe</h1>
      <div>
        <label>
          Nom du Joueur 1 :
          <input
            type="text"
            value={player1}
            onChange={(e) => setPlayer1(e.target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          Nom du Joueur 2 :
          <input
            type="text"
            value={player2}
            onChange={(e) => setPlayer2(e.target.value)}
          />
        </label>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleStart} disabled={!player1 || !player2}>
        Commencer
      </button>
    </div>
  );
}

function Square({ value, onSquareClick, isWinningSquare }) {
  return (
    <button
      className={`square ${isWinningSquare ? "winning-square" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay, winningLine, currentPlayer }) {
  function handleClick(i) {
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares, i);
  }

  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = winner + " a gagné";
  } else if (isBoardFull(squares)) {
    status = "Match nul";
  } else {
    status = `Prochain tour : ${currentPlayer}`;
  }

  const boardRows = [];
  for (let row = 0; row < 3; row++) {
    const boardRow = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const isWinningSquare = winningLine && winningLine.includes(index);
      boardRow.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          isWinningSquare={isWinningSquare}
        />
      );
    }
    boardRows.push(
      <div key={row} className="board-row">
        {boardRow}
      </div>
    );
  }

  return (
    <>
      <div className="status">{status}</div>
      {boardRows}
    </>
  );
}

export function Game({
  player1,
  player2,
  onQuit,
  onWin,
  player1Wins,
  player2Wins,
}) {
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), location: null },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [gameEnded, setGameEnded] = useState(false);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  function handlePlay(nextSquares, index) {
    if (gameEnded) return;

    const nextHistory = history
      .slice(0, currentMove + 1)
      .concat([{ squares: nextSquares, location: index }]);
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleOrder() {
    setIsAscending(!isAscending);
  }

  function resetGame() {
    setHistory([{ squares: Array(9).fill(null), location: null }]);
    setCurrentMove(0);
    setGameEnded(false);
  }

  const currentPlayer = xIsNext ? player1 : player2;

  const moves = history.map((step, move) => {
    const { location } = step;
    const col = location % 3;
    const row = Math.floor(location / 3);
    const description =
      move > 0
        ? `Aller au tour #${move} (ligne ${row + 1}, colonne ${col + 1})`
        : "Aller au début";
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  if (!isAscending) {
    moves.reverse();
  }

  const winner = calculateWinner(currentSquares);
  const winningLine = winner ? calculateWinningLine(currentSquares) : null;

  if (winner && !gameEnded) {
    setGameEnded(true);
    onWin(winner);
  } else if (isBoardFull(currentSquares) && !gameEnded) {
    setGameEnded(true);
  }

  return (
    <div className="game">
      <div className="game-board">
        <Board
          xIsNext={xIsNext}
          squares={currentSquares}
          onPlay={handlePlay}
          winningLine={winningLine}
          currentPlayer={currentPlayer}
        />
      </div>
      <div>
        <button onClick={toggleOrder}>
          {isAscending ? "Croissant" : "Décroissant"}
        </button>
        <button
          onClick={() => {
            resetGame();
            onQuit();
          }}
        >
          Quitter
        </button>
        <button onClick={resetGame}>Rejouer</button>
      </div>
      <div className="game-info">
        <div>Joueur 1 : {player1} (X)</div>
        <div>Joueur 2 : {player2} (O)</div>
        <div>
          Score - {player1} : {player1Wins} | {player2} : {player2Wins}
        </div>
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function isBoardFull(squares) {
  return squares.every((square) => square !== null);
}

function calculateWinningLine(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [a, b, c];
    }
  }
  return null;
}
