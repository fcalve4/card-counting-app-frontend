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
      <div className="App-header">
        <h1>Welcome to the Hi-Lo Trainer App</h1>
        <button className="Deal-button" onClick={fetchGameData}>Deal</button>

        <p><strong>Status:</strong> {message}</p>
        <p><strong>Running Count:</strong> {runningCount}</p>

        <h3>Cards Dealt:</h3>
        <ul>
          {cards.map((card, index) => (
            <li key={index}>{card}</li>
          ))}
        </ul>

        <pre>{output}</pre> {/* Optional raw output */}
      </div>
    </div>
  );
}

export default App;
