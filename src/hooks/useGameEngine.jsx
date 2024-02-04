import React from "react";
import { useMultiplayerState, usePlayersList } from "playroomkit";
import { useEffect } from "react";

const GameEngineContext = React.createContext();

const TIME_PHASE_CARDS = 10;
const TIME_PHASE_PLAYER_CHOICE = 10;
const TIME_PHASE_PLAYER_ACTION = 3;
export const NB_ROUNDs = 3;
const NB_GEMS = 3;
const CARDS_PER_PLAYER = 4;

export const GameEngineProvider = ({ children }) => {
  // GAME STATE
  const [timer, setTimer] = useMultiplayerState("timer", 0);
  const [round, setRound] = useMultiplayerState("round", 1);
  const [phase, setPhase] = useMultiplayerState("phase", "lobby");
  const [playerTurn, setPlayerTurn] = useMultiplayerState("playerTurn", 0);
  const [playerStart, setPlayerStart] = useMultiplayerState("playerStart", 0);
  const [deck, setDeck] = useMultiplayerState("deck", []);
  const [gems, setGems] = useMultiplayerState("gems", NB_GEMS);
  const [actionSuccess, setActionSuccess] = useMultiplayerState(
    "actionSuccess",
    true
  );
  const players = usePlayersList(true);
  players.sort((a, b) => a.id.loacleCompare(b.id));

  const gameState = {
    timer,
    round,
    phase,
    playerTurn,
    playerStart,
    deck,
    gems,
    actionSuccess,
    players,
  };

  const startGame = () => {
    if (isHost()) {
      console.log("starting game");
      setTimer(TIME_PHASE_CARDS, true);
      const randomPlayer = randInt(0, players.length - 1);
      setPlayerStart(randomPlayer, true);
      setPlayerTurn(randomPlayer, true);
      setRound(1, true);
      setDeck([...new Array(16).fill(0).map(() => "punch")], true);
    }
  };

  useEffect(() => {
    startGame();
    onPlayerJoin(startGame);
  });
  return (
    <GameEngineContext.Provider
      value={{
        ...gameState,
      }}
    >
      {children}
    </GameEngineContext.Provider>
  );
};

export const useGameEngine = () => {
  const context = React.useContext(GameEngineContext);
  if (context === undefined) {
    throw new Error("useGameEngine must be used within a GameEngineProvider");
  }
  return context;
};
