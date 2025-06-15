import React, { useState } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState("Click the button to start the game.");
  const [output, setOutput] = useState("<No output yet>");

  const fetchGameData = () => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((data) => {
        setMessage(data.message);
        setOutput(data.output);
      })
      .catch((err) => {
        console.error("Error fetching from backend:", err);
        setMessage("Failed to connect to backend.");
      });
  };


  return (
    <div className="App">
      <div className="App-header">
        <h1>Welcome to the Hi-Lo Trainer App</h1>
        <button className="Deal-button" onClick ={fetchGameData}>Deal</button>

        <p><strong>Server response:</strong> {message}</p>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default App;
