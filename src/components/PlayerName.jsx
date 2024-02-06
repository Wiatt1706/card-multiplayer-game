import { Billboard, Text } from "@react-three/drei";

export const PlayerName = ({ name = "ces", fontSize = 0.2, ...props }) => {
  return (
    <Billboard {...props}>
      <Text
        anchorY={"bottom"}
        fontSize={fontSize}
        font="/fonts/RobotoSlab-Bold.ttf"
      >
        {name}
      </Text>
    </Billboard>
  );
};
