import React, { useRef } from "react";
import {
  useMultiplayerState,
  usePlayersList,
  getState,
  onPlayerJoin,
  isHost,
} from "playroomkit";
import { useEffect } from "react";
import { randInt } from "three/src/math/MathUtils";
import { useControls } from "leva";
const GameEngineContext = React.createContext();

const TIME_PHASE_CARDS = 10;
const TIME_PHASE_PLAYER_CHOICE = 10;
const TIME_PHASE_PLAYER_ACTION = 3;
export const NB_ROUNDS = 3;
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
  players.sort((a, b) => a.id.localeCompare(b.id));

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

  const distributeCards = (nbCards) => {
    const newDeck = [...getState("deck")];
    players.forEach((player) => {
      const cards = player.getState("cards") || [];
      for (let i = 0; i < nbCards; i++) {
        const randomIndex = randInt(0, newDeck.length - 1);
        cards.push(newDeck[randomIndex]);
        newDeck.splice(randomIndex, 1);
      }

      player.setState("cards", cards, true);
      player.setState("selectedCard", 0, true);
      player.setState("playerTarget", -1, true);
    });

    setDeck(newDeck, true);
  };

  const startGame = () => {
    if (isHost()) {
      console.log("starting game");
      setTimer(TIME_PHASE_CARDS, true);
      const randomPlayer = randInt(0, players.length - 1);
      setPlayerStart(randomPlayer, true);
      setPlayerTurn(randomPlayer, true);
      setRound(1, true);
      setDeck(
        [
          ...new Array(16).fill(0).map(() => "punch"),
          ...new Array(24).fill(0).map(() => "grab"),
          ...new Array(8).fill(0).map(() => "shield"),
        ],
        true
      );
      setGems(NB_GEMS, true);
      players.forEach((player) => {
        player.setState("cards", [], true);
        player.setState("gems", 0, true);
        player.setState("shield", false, true);
        player.setState("winner", false, true);
      });
      distributeCards(CARDS_PER_PLAYER);
      setPhase("cards", true);
    }
  };

  useEffect(() => {
    startGame();
    onPlayerJoin(startGame);
  }, []);

  const performPlayerAction = () => {
    const player = players[getState("playerTurn")];
    console.log("perform Player Action", player.id);
    const selectedCard = player.getState("selectedCard");
    const cards = player.getState("cards");
    const card = cards[selectedCard];
    let success = true;
    if (card !== "shield") {
      player.setState("shield", false, true);
    }

    switch (card) {
      case "punch":
        let target = players[player.getState("playerTarget")];
        if (!target) {
          let targetIndex = (getState("playerTurn") + 1) % players.length;
          player.setState("playerTarget", targetIndex, true);
          target = players[targetIndex]; // we punch the next player if playerTarget is not set
        }
        console.log("punch target", target.id);
        if (target.getState("shield")) {
          success = false;
          break;
        }
        if (target.getState("gems") > 0) {
          target.setState("gems", target.getState("gems") - 1, true);
          setGems(getState("gems") + 1, true);
          console.log("Target has gems");
        }
        break;
      case "grab":
        if (getState("gems") > 0) {
          player.setState("gems", player.getState("gems") + 1, true);
          setGems(getState("gems") - 1, true);
          console.log("Grabbed gem");
        } else {
          console.log("no gem to grab");
          success = false;
        }
        break;
      case "shield":
        console.log("shield");
        player.setState("shield", true, true);
        break;
      default:
        break;
    }
    setActionSuccess(success, true);
  };

  const removePlayerCards = () => {
    const player = players[getState("playerTurn")];
    const cards = player.getState("cards");
    const selectedCard = player.getState("selectedCard");
    cards.splice(selectedCard, 1);
    player.setState("cards", cards, true);
  };

  const getCard = () => {
    const player = players[getState("playerTurn")];
    if (!player) {
      return "";
    }
    const cards = player.getState("cards");
    if (!cards) {
      return "";
    }
    const selectedCard = player.getState("selectedCard");
    return cards[selectedCard];
  };

  const phaseEnd = () => {
    let newTime = 0;
    console.log(getState("phase"));
    switch (getState("phase")) {
      case "cards":
        if (getCard() === "punch") {
          newTime = TIME_PHASE_PLAYER_CHOICE;
        } else {
          performPlayerAction();
          setPhase("playerAction", true);
          newTime = TIME_PHASE_PLAYER_ACTION;
        }
        break;
      case "playerChoice":
        performPlayerAction();
        setPhase("playerAction", true);
        newTime = TIME_PHASE_PLAYER_ACTION;
        break;
      case "playerAction":
        removePlayerCards();
        const newPlayerTurn = (getState("playerTurn") + 1) % players.length;
        if (newPlayerTurn === getState("playerStart")) {
          // EVERY PLAYER PLAYED
          if (getState("round") === NB_ROUNDS) {
            // GAME OVER
            console.log("game over");
            let maxGems = 0;
            players.forEach((player) => {
              if (player.getState("gems") > maxGems) {
                maxGems = player.getState("gems");
              }
            });

            players.forEach((player) => {
              player.setState(
                "winner",
                player.getState("gems") === maxGems,
                true
              );

              player.setState("cards", [], true);
            });

            setPhase("end", true);
          } else {
            // NEXT ROUND
            console.log("next round");
            const newPlayerStart =
              (getState("playerStart") + 1) % players.length;
            setPlayerStart(newPlayerStart, true);
            setPlayerTurn(newPlayerStart, true);
            setRound(getState("round") + 1, true);
            distributeCards("cards", true);
            newTime = TIME_PHASE_CARDS;
          }
        } else {
          // NEXT PLAYER
          console.log("next player");
          setPlayerTurn(newPlayerTurn, true);
          if (getCard() === "punch") {
            setPhase("playerChoice", true);
            newTime = TIME_PHASE_PLAYER_CHOICE;
          } else {
            performPlayerAction();
            setPhase("playerAction", true);
            newTime = TIME_PHASE_PLAYER_ACTION;
          }
        }
        break;
      default:
        break;
    }
    setTimer(newTime, true);
  };

  const { paused } = useControls({
    paused: false,
  });

  const timerInterval = useRef();

  const runTimer = () => {
    timerInterval.current = setInterval(() => {
      if (!isHost()) return;
      if (paused) return;
      let newTime = getState("timer") - 1;
      console.log("timer", newTime);
      if (newTime <= 0) {
        phaseEnd();
      } else {
        setTimer(newTime, true);
      }
    }, 1000);
  };

  const clearTimer = () => {
    clearInterval(timerInterval.current);
  };

  useEffect(() => {
    runTimer();
    return clearTimer;
  }, [phase, paused]);

  return (
    <GameEngineContext.Provider
      value={{
        ...gameState,
        startGame,
        getCard,

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
