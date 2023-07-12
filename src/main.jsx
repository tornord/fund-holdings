import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Global, css } from "@emotion/react";
import "./fonts.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <>
    <Global
      styles={css`
        *,
        *:before,
        *:after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          font-size: 8px;
          display: flex;
          justify-content: center;
          font-family: NeueHaas, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        body {
          width: 100%;
          max-width: 620px;
          font-family: Benton;
          font-size: 16px;
          margin: 0;
          padding: 0;
          padding-bottom: 10px;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #fbf4f1;
        }

        input,
        textarea,
        button {
          font-family: inherit;
        }
      `}
    />
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </>
);
