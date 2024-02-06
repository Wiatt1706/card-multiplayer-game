import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GameEngineProvider } from "./hooks/useGameEngine";
import { insertCoin } from "playroomkit";

insertCoin({
  streamMode: true,
}).then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <GameEngineProvider>
        <App />
      </GameEngineProvider>
    </React.StrictMode>
  );
});
