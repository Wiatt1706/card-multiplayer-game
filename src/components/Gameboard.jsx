import { AccumulativeShadows, Gltf, RandomizedLight } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import { useGameEngine } from "../hooks/useGameEngine";
import { motion } from "framer-motion-3d";
import { degToRad } from "three/src/math/MathUtils";
import { Card } from "./Card";
export const Gameboard = () => {
  const viewport = useThree((state) => state.viewport);
  const scalingRatio = Math.min(1, viewport.width / 12);

  const { deck, gems, players, phase, getCard } = useGameEngine();

  const shadows = useMemo(
    () => (
      <AccumulativeShadows
        temporal
        frames={35}
        alphaTest={0.75}
        scale={100}
        position={[0, 0.01, 0]}
        color="#EFBD4E"
      >
        <RandomizedLight
          amount={4}
          radius={9}
          intensity={0.55}
          ambient={0.25}
          position={[30, 5, -10]}
        />
        <RandomizedLight
          amount={4}
          radius={5}
          intensity={0.25}
          ambient={0.55}
          position={[-30, 5, -9]}
        />
      </AccumulativeShadows>
    ),
    []
  );
  return (
    <group scale={scalingRatio}>
      <Gltf
        castShadow
        src="/models/Gameboard.glb"
        scale={0.8}
        position-x={-1}
        position-z={5}
      />
      {shadows}

      <group position-x={4} position-z={-2}>
        {deck.map((_, index) => (
          <motion.group
            key={index}
            position-y={index * 0.015}
            rotation-y={index % 2 ? degToRad(2) : 0}
            animate={
              phase === "playerAction" && index === deck.length - 1
                ? "selected"
                : ""
            }
            variants={{
              selected: {
                scale: 1.5,
                x: -2,
                y: 1.5,
                z: -2,
                rotateY: degToRad(120),
              },
            }}
          >
            <motion.group
              rotation-x={degToRad(90)}
              variants={{
                selected: {
                  rotateX: degToRad(-45),
                },
              }}
            >
              <Card type={getCard() || undefined} />
            </motion.group>
          </motion.group>
        ))}
      </group>
    </group>
  );
};
