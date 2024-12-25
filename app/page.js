"use client";
import { useState, useEffect } from 'react';
import '@/styles/globals.css';

export default function PlantSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [plantDetails, setPlantDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversation, setConversation] = useState([]);
  const [typingIndex, setTypingIndex] = useState(0);

  const handleSearch = async () => {
    if (!searchQuery) {
      setError('Please enter a plant name.');
      return;
    }

    // Reset previous state before starting a new search
    setLoading(true);
    setError('');
    setConversation([{ text: searchQuery, isUser: true }]); // Start fresh conversation
    setTypingIndex(0); // Reset typing index

    try {
      const response = await fetch(`/api/plantid?name=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Plant not found.');
      }

      const data = await response.json();
      setPlantDetails(data);

      const newMessages = [
        { text: `Here is the information I found for "${searchQuery}":`, isUser: false },
        { text: 'Category:', value: data.category, isUser: false },
        { text: 'Watering Frequency:', value: data.watering?.frequency, isUser: false },
        { text: 'Watering Amount:', value: data.watering?.amount, isUser: false },
        { text: 'Growing Conditions:', value: `${data.growing_conditions?.sunlight} and ${data.growing_conditions?.soil}`, isUser: false }
      ];

      // Append the new messages
      setConversation(prev => [...prev, ...newMessages]);

      // Start typing animation for each new message
      setTypingIndex(newMessages.length - 1);
    } catch (err) {
      setError(err.message || 'Failed to fetch plant details.');
      setConversation([...conversation, { text: err.message || 'Failed to fetch plant details.', isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typingIndex < conversation.length - 1) {
      const timer = setTimeout(() => {
        setTypingIndex(typingIndex + 1);
      }, 2500); // Adjust the delay to show each message after typing is finished

      return () => clearTimeout(timer);
    }
  }, [typingIndex, conversation]);

  return (
    <div className="min-h-screen bg-[#343541] text-white p-4">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <h1 className="text-5xl font-semibold mb-6 text-center">Plant Information Chat</h1>

        {/* Chat Interface */}
        <div className="p-4 bg-[#2C2F36] rounded-lg shadow-lg h-[65vh] overflow-y-auto">
          <div className="whitespace-pre-wrap break-words">
            {conversation.map((message, index) => (
              <div
                key={index}
                className={`${message.isUser ? 'text-[#10a37f]' : 'text-white'}`}
              >
                {index <= typingIndex && (
                  <p
                    className={`text-xl ${message.isUser ? 'font-semibold' : 'font-medium'} ${
                      message.text ? 'fade-in-animation' : ''
                    }`}
                    style={{
                      display: message.text ? 'inline-block' : 'block', // Inline for text and value
                    }}
                  >
                    {message.text && message.value ? (
                      <>
                        <span className="text-xl font-semibold">{message.text}</span>: 
                        <span className="text-sm">{message.value}</span>
                      </>
                    ) : (
                      <span>{message.text}</span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex items-center space-x-3 mt-4">
          <input
            type="text"
            placeholder="Ask about a plant (e.g., Tomato)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#444654] text-white p-3 rounded-xl w-full focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-[#10a37f] text-white px-6 py-3 rounded-xl"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Error message */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </div>
  );
}
