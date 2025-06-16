import React, { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState("Click 'Deal' to begin.");
  const [output, setOutput] = useState("");
  const [runningCount, setRunningCount] = useState(0);
  const [cards, setCards] = useState([]);

  const fetchGameData = async () => {
    setMessage("Dealing cards...");
    setOutput("");
    setCards([]);
    setRunningCount(0);

    try {
      const response = await fetch("http://localhost:8000/stream");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const processChunk = ({ done, value }) => {
        if (done) {
          setMessage("Done dealing.");
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // hold last incomplete line

        for (const line of lines) {
          if (line.trim()) {
            const data = JSON.parse(line);
            setCards((prevCards) => [...prevCards, data.card]);
            setRunningCount(data.count);
          }
        }

        return reader.read().then(processChunk);
      };

      reader.read().then(processChunk);
    } catch (err) {
      console.error("Streaming failed:", err);
      setMessage("Failed to connect to backend.");
    }
  };

  return (
    <div className="App">
      <header className="top-navbar">
        <h1 className="logo">🃏 Hi-Lo Trainer</h1>
        <nav className="nav-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/stats">Stats</a>
        </nav>
      </header>

      <div className="App-header">
  <div className="game-layout">
    <div className="game-left">
      <p><strong>Running Count:</strong> {runningCount}</p>
      <p><strong>Status:</strong> {message}</p>
    </div>

    <div className="game-center">
  {cards.length === 0 ? (
    <img
      src="/cards/back_dark.png" // or any placeholder like "AS.png"
      alt="Card back"
      className="card-image"
    />
  ) : (
    <img
      src={`/cards/${cards[cards.length - 1]}.png`}
      alt={cards[cards.length - 1]}
      className="card-image"
    />
  )}
</div>



    <div className="game-right">
      <button className="Deal-button" onClick={fetchGameData}>Deal</button>
    </div>
  </div>


        <pre>{output}</pre> {/* Optional raw output */}
      </div>
    </div>
  );
}

export default App;
