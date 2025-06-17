import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState("Click 'Deal' to begin.");
  const [output, setOutput] = useState("");
  const [runningCount, setRunningCount] = useState(0);
  const [cards, setCards] = useState([]);
  const [cardsRemaining, setCardsRemaining] = useState(312);
  const [decksRemaining, setDecksRemaining] = useState(6);
  const [numDecks, setNumDecks] = useState(6);
  const [showCount, setShowCount] = useState(true);

  useEffect(() => {
    const initSession = async () => {
      try {
        // Reset to default 6 decks
        await fetch('http://localhost:8000/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ num_decks: 6 }),
        });
  
        // Then start a new game session
        await fetch("http://localhost:8000/start", {
          method: "POST",
        });
  
        // Reset frontend state
        setNumDecks(6);
        setCardsRemaining(6 * 52);
        setDecksRemaining(6);
        setRunningCount(0);
        setCards([]);
        setMessage("New game session started. Click Deal to begin.");
      } catch (err) {
        console.error("Failed to initialize session:", err);
        setMessage("Error starting new session.");
      }
    };
  
    initSession();
  }, []);
  

  const handleDeckChange = async (e) => {
    const newDecks = parseInt(e.target.value);
    setNumDecks(newDecks);
  
    try {
      // Update the backend setting
      await fetch('http://localhost:8000/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num_decks: newDecks }),
      });
  
      // Start a new game session
      await fetch("http://localhost:8000/start", {
        method: "POST",
      });
  
      // Reset frontend state
      setDecksRemaining(newDecks);
      setCardsRemaining(newDecks * 52);
      setRunningCount(0);
      setCards([]);
      setMessage(`New game session started with ${newDecks} deck${newDecks > 1 ? 's' : ''}.`);
    } catch (err) {
      console.error("Failed to update decks or restart game", err);
      setMessage("Error updating deck count or starting session.");
    }
  };
  

  // Called once on page load to reset the game session
  const startNewSession = () => {
    fetch("http://localhost:8000/start", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("New session started:", data);
        setRunningCount(0);
        setDecksRemaining(numDecks);
        setCardsRemaining(numDecks * 52);
        setCards([]);
        setMessage("New game session started. Click Deal to begin.");
      })
      .catch((err) => {
        console.error("Failed to start session:", err);
        setMessage("Error starting new session.");
      });
  };


  const fetchGameData = async () => {
    setMessage("Dealing cards...");
    setOutput("");
    setCards([]);

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
            setCardsRemaining(data.cards_remaining);
            setDecksRemaining(data.decks_remaining);
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
        
          </nav>

      </header>

      <div className="App-header">
        <div className="game-layout">
          <div className="game-left">
            
            <p><strong>Status:</strong> {message}</p>
            <p><strong>Cards Remaining:</strong> {cardsRemaining}</p>
            <p><strong>Decks Remaining:</strong> {decksRemaining}</p>
          </div>

          <div className="game-center">
          <button className="running-count-button" onClick={() => setShowCount(prev => !prev)}>
          {showCount ? "Hide" : "Show"} Running Count </button>
          <p><strong>Running Count:</strong> {showCount ? runningCount : "•••"}</p>


            

            {cards.length === 0 ? (
              <img
                src="/cards/back_dark.png"
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
          <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="deck-select">Number of Decks: </label>
        <select
          id="deck-select"
          value={numDecks}
          onChange={handleDeckChange}
        >
          {[1, 2, 4, 6, 8].map((n) => (
            <option key={n} value={n}>
              {n} Deck{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

            <button className="Big-button" onClick={fetchGameData}>Deal</button>
            <button className="Big-button" onClick={startNewSession}>Shuffle</button>
          </div>
        </div>

        <pre>{output}</pre> {/* Optional raw output */}
      </div>
    </div>
  );
}

export default App;
