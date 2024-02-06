import { useState } from "react";
import { useGameEngine } from "../hooks/useGameEngine";
import { useEffect } from "react";
import { motion } from "framer-motion-3d";
import { PlayerName } from "./PlayerName";
import { Character } from "./Character";
import { Center, Gltf } from "@react-three/drei";
import { degToRad } from "three/src/math/MathUtils";
export const Player = ({ index, player }) => {
  const { phase, playerTurn, players, getCard } = useGameEngine();
  const isPlayerTurn = phase === "playerAction" && index === playerTurn;
  const currentPlayer = players[playerTurn];
  const currentCard = getCard();
  const hasShield = player.getState("shield");
  const isPlayerPunched =
    phase === "playerAction" &&
    currentCard === "punch" &&
    index === currentPlayer.getState("playerTarget");
  const isWinner = player.getState("winner");
  const [animation, setAnimation] = useState("Idle");

  useEffect(() => {
    let cardAnim = "Idle";
    if (isPlayerTurn) {
      switch (currentCard) {
        case "punch":
          cardAnim = "Sword";
          break;
        case "shield":
          cardAnim = "Wave";
          break;
        case "grab":
          cardAnim = "Punch";
          break;
        default:
          break;
      }
    } else {
      if (isPlayerPunched) {
        cardAnim = "Duck";
      }
    }

    if (isWinner) {
      cardAnim = "Wave";
    }
    setAnimation(cardAnim);
  }, [currentCard, playerTurn, phase, isPlayerPunched, isWinner]);
  return (
    <motion.group
      animate={animation}
      position-x={1 + index}
      position-z={2}
      variants={{
        Sword: {
          z: 0.2,
          x: -1,
        },
        Wave: {
          scale: 1.5,
        },
        Punch: {
          x: 0,
          z: 0.4,
          rotateY: degToRad(180),
        },
      }}
    >
      <PlayerName name={player.state.profile.name} position-y={0.8} />
      <Character
        scale={0.5}
        Character={index}
        rotation-y={degToRad(180)}
        animation={animation}
      />
      {hasShield && <Gltf scale={0.5} src="/models/Prop_Barrel.gltf" />}
      <Center disableY disableZ>
        {[...Array(player.getState("gems") || 0)].map((_, index) => (
          <Gltf
            key={index}
            src="/models/UI_Gem_Blue.gltf"
            position-x={index * 0.25}
            position-y={0.25}
            position-z={0.5}
            scale={0.5}
          />
        ))}
      </Center>
    </motion.group>
  );
};
