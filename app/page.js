"use client";
import { useState, useEffect } from "react";
import "@/styles/globals.css";

export default function ProfileSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [plantDetails, setPlantDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversation, setConversation] = useState([]);
  const [typingIndex, setTypingIndex] = useState(0);

  // States for login functionality
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false); // For toggling profile view
  const [formError, setFormError] = useState(""); // For storing form validation errors

  // Check if the user is already logged in when the page loads
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  // Handle login
  const handleLogin = () => {
    // Simple validation for required fields
    if (!email || !password || !username) {
      setFormError("Please fill out all fields.");
      return;
    }
    
    // Simulate a login process (can replace with real authentication)
    localStorage.setItem("username", username);
    setIsLoggedIn(true);
    setShowLoginForm(false); // Hide the form after successful login
    setFormError(""); // Clear any form errors
  };

  // Handle logout
  const handleLogout = () => {
    // Clear username from localStorage and update state
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setUsername("");
    setShowProfile(false); // Close profile section
  };

  // Handle search for plant details
  const handleSearch = async () => {
    if (!searchQuery) {
      setError("Please enter a plant name.");
      return;
    }

    setLoading(true);
    setError("");
    setConversation([{ text: searchQuery, isUser: true }]);
    setTypingIndex(0);

    try {
      const response = await fetch(`/api/plantid?name=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error("Plant not found.");
      }

      const data = await response.json();
      setPlantDetails(data);

      const newMessages = [
        { text: `Here is the information I found for "${searchQuery}":`, isUser: false },
        { text: "Category:", value: data.category, isUser: false },
        { text: "Watering Frequency:", value: data.watering?.frequency, isUser: false },
        { text: "Watering Amount:", value: data.watering?.amount, isUser: false },
        { text: "Growing Conditions:", value: `${data.growing_conditions?.sunlight} and ${data.growing_conditions?.soil}`, isUser: false },
      ];

      setConversation((prev) => [...prev, ...newMessages]);
      setTypingIndex(newMessages.length - 1);
    } catch (err) {
      setError(err.message || "Failed to fetch plant details.");
      setConversation([...conversation, { text: err.message || "Failed to fetch plant details.", isUser: false }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typingIndex < conversation.length - 1) {
      const timer = setTimeout(() => {
        setTypingIndex(typingIndex + 1);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [typingIndex, conversation]);

  return (
    <div className="min-h-screen bg-[#343541] text-white p-6 flex flex-col items-center justify-center relative">
      {/* Logo Section */}
      <div className="absolute top-4 left-4">
        <h1 className="text-3xl font-bold text-white">Goal Reachers</h1>
      </div>

      {/* Profile Section */}
      <div className="absolute top-4 right-4">
        {!isLoggedIn ? (
          <button
            onClick={() => setShowLoginForm(true)} // Show login form when clicked
            className="bg-transparent text-white border-none text-lg hover:text-[#10a37f] hover:underline transition-all"
          >
            Login
          </button>
        ) : (
          <div>
            <button
              onClick={() => setShowProfile(!showProfile)} // Toggle profile visibility
              className="text-white text-lg hover:text-[#10a37f] hover:underline"
            >
              {username}
            </button>
            {/* Conditional Profile Section */}
            {showProfile && (
              <div className="mt-2 bg-[#444654] p-4 rounded-lg shadow-lg">
                <p className="text-lg text-white">{`Welcome, ${username}!`}</p>
                <button
                  onClick={handleLogout}
                  className="text-lg text-white hover:text-[#10a37f] hover:underline"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Section (Center of the page) */}
      <div className="bg-[#2C2F36] p-6 rounded-lg shadow-lg w-full max-w-3xl h-[60vh] overflow-y-auto flex flex-col justify-between">
        <h1 className="text-5xl font-semibold mb-6 text-center">Plant Information Chat</h1>
        <div className="whitespace-pre-wrap break-words flex-grow">
          {conversation.map((message, index) => (
            <div key={index} className={`${message.isUser ? "text-[#10a37f]" : "text-white"}`}>
              {index <= typingIndex && (
                <p
                  className={`text-xl ${message.isUser ? "font-semibold" : "font-medium"} ${
                    message.text ? "fade-in-animation" : ""
                  }`}
                  style={{
                    display: message.text ? "inline-block" : "block",
                  }}
                >
                  {message.text && message.value ? (
                    <>
                      <span className="text-xl font-semibold">{message.text}</span>:{" "}
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
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Error message */}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>

      {/* Login Form Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#2C2F36] p-6 rounded-lg w-96">
            <h2 className="text-2xl font-semibold text-center text-[#10a37f]">Login</h2>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-[#444654] text-white p-3 rounded-xl w-full focus:outline-none mb-3"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#444654] text-white p-3 rounded-xl w-full focus:outline-none mb-3"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#444654] text-white p-3 rounded-xl w-full focus:outline-none mb-3"
              />
            </div>

            {formError && (
              <p className="text-red-500 text-center mt-2">{formError}</p>
            )}

            <div className="flex justify-between mt-4">
              <button
                onClick={handleLogin}
                className="bg-[#10a37f] text-white px-6 py-3 rounded-xl w-full"
              >
                Login
              </button>
              <button
                onClick={() => setShowLoginForm(false)} // Close the form
                className="bg-red-500 text-white px-6 py-3 rounded-xl w-full mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
