import React, { useEffect, useState } from "react";
import styled from "styled-components";

enum State {
  Initial,
  XsTurn,
  OsTurn,
  GameOver,
}

type Coord = [number, number];
type PlayerState = Coord[];
type WinningStates = PlayerState[];

/*

x | 0 | 1 | 2 | 3
-----------------
0 |
-----------------
1 |
-----------------
2 |
-----------------
3 |

winningRows:
  [
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    ...
  ]
winningColumns:
  [
    [[0, 0], [1, 0], [2,0]],
    [[0, 1], [1, 1], [2,1]],
    ...
  ]
winningDiag
  [
    [[0, 0], [1, 1], [2, 2]],
    [[2, 0], [1, 1], [0, 2]],
  ]
*/

const generateWinningStates = (n: number) => {
  let winningRows: WinningStates = [];
  let winningColumns: WinningStates = [];
  let winningDiags: WinningStates = [[], []];

  for (let x = 0; x < n; x++) {
    winningRows[x] = [];
    winningColumns[x] = [];
    winningDiags[0] = [...winningDiags[0], [x, x]];
    winningDiags[1] = [...winningDiags[1], [n - 1 - x, x]];

    for (let y = 0; y < n; y++) {
      const currentRow = winningRows[x];
      winningRows.splice(x, 1, [...currentRow, [x, y]]);

      const currentColumn = winningColumns[x];
      winningColumns.splice(x, 1, [...currentColumn, [y, x]]);
    }
  }

  return [...winningRows, ...winningColumns, ...winningDiags];
};

const hasCoord = (pState: PlayerState, xy: Coord) => {
  return !!pState.find((c) => c[0] === xy[0] && c[1] === xy[1]);
};

const AppWrapper = styled.div`
  * {
    box-sizing: border-box;
  }

  .row {
    display: flex;
    align-items: center;
  }

  .xo-button {
    height: 30px;
    width: 30px;
    text-align: center;
  }
`;

const hasAllWinningStates = (
  allWinningStates: WinningStates,
  pState: PlayerState
) => {
  const stateMap = pState.reduce((stateMap: any, xy: Coord) => {
    stateMap[`${xy[0]},${xy[1]}`] = true;
    return stateMap;
  }, {});

  return !!allWinningStates.find((s: PlayerState) => {
    return !s.find((xy: Coord) => stateMap[`${xy[0]},${xy[1]}`] === undefined);
  });
};

function App() {
  const [currentState, setCurrentState] = useState<State>(State.Initial);
  const [allWinningStates, setAllWinningStates] = useState<WinningStates>([]);
  const [size, setSize] = useState(0);
  const [xState, setXState] = useState<PlayerState>([]);
  const [oState, setOState] = useState<PlayerState>([]);

  useEffect(() => {
    if (currentState === State.XsTurn || currentState === State.OsTurn) {
      const allPositions = [...xState, ...oState]
      if (hasAllWinningStates(allWinningStates, xState)) {
        setCurrentState(State.GameOver);
        alert("X won");
      } else if (hasAllWinningStates(allWinningStates, oState)) {
        setCurrentState(State.GameOver);
        alert("O won");
      } else if (Math.pow(size, 2) === allPositions.length) {
        setCurrentState(State.GameOver);
        alert("Draw");
      }
    }
  }, [currentState, allWinningStates, xState, oState, size]);

  const startGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const num = formData.get("size");

    if (typeof num !== "string") return;

    const sizeInput = Number(num);

    if (isNaN(sizeInput) || sizeInput < 1) return;

    setCurrentState(State.XsTurn);
    setAllWinningStates(generateWinningStates(sizeInput));
    setSize(sizeInput);
  };

  const getButton = (x: number, y: number) => {
    const hasX = hasCoord(xState, [x, y]);
    const hasO = hasCoord(oState, [x, y]);
    const disabled = currentState === State.GameOver || hasX || hasO;
    const handleClick = () => {
      if (currentState === State.XsTurn && !hasX) {
        setXState((s) => [...s, [x, y]]);
        setCurrentState(State.OsTurn);
      } else {
        setOState((s) => [...s, [x, y]]);
        setCurrentState(State.XsTurn);
      }
    };

    return (
      <button
        className="xo-button"
        key={`${x}${y}`}
        disabled={disabled}
        onClick={handleClick}
      >
        {hasX ? "X" : hasO ? "O" : ""}
      </button>
    );
  };

  const generateGrid = () => {
    let grid = [];

    for (let x = 0; x < size; x++) {
      grid[x] = [];

      for (let y = 0; y < size; y++) {
        grid[x] = [...grid[x], getButton(x, y)];
      }
    }

    return grid;
  };

  const getStatus = () => {
    if (currentState === State.Initial) {
      return "Enter any number more than 0";
    }

    if (currentState === State.XsTurn) {
      return "X plays";
    }
    if (currentState === State.OsTurn) {
      return "O plays";
    }

    return "Game Over";
  };

  const startOver = () => {
    setOState([]);
    setXState([]);
    setCurrentState(State.Initial);
  };

  return (
    <AppWrapper>
      <header className="App-header">
        <h1>Tic tac Toe</h1>
      </header>

      {currentState === State.Initial ? (
        <form onSubmit={startGame}>
          <input type="number" name="size" />
          <button>Start</button>
        </form>
      ) : (
        generateGrid().map((row, i) => (
          <div className="row" key={i}>
            {row}
          </div>
        ))
      )}
      <p>{getStatus()}</p>
      {currentState === State.GameOver && (
        <div>
          <button onClick={startOver}>Start over</button>
        </div>
      )}
    </AppWrapper>
  );
}

export default App;
