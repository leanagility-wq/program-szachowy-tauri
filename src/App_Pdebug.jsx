import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

function App() {
  const [game, setGame] = useState(new Chess());

  function handlePieceDrop(event) {
    const { sourceSquare, targetSquare } = event;

    console.log("DROP EVENT", sourceSquare, targetSquare);

    const gameCopy = new Chess(game.fen());

    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: "q",
      });

      if (move === null) {
        return false;
      }

      setGame(gameCopy);
      return true;
    } catch (error) {
      console.error("Błąd ruchu:", error);
      return false;
    }
  }

  const chessboardOptions = {
    id: "BasicBoard",
    position: game.fen(),
    boardWidth: 500,
    arePiecesDraggable: true,
    onPieceDrop: handlePieceDrop,
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test szachownicy</h1>
      <Chessboard options={chessboardOptions} />
    </div>
  );
}

export default App;
