import React, { useState, useEffect } from 'react';

const Coach: React.FC = () => {
  const [fanMessage, setFanMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [fanMood, setFanMood] = useState('neutral');
  const [fanIntent, setFanIntent] = useState('browsing');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Simulate AI analysis when fan message changes
  useEffect(() => {
    if (fanMessage.trim().length > 10) {
      setIsAnalyzing(true);
      
      // Simulate AI processing delay
      const timer = setTimeout(() => {
        analyzeFanMessage(fanMessage);
        setIsAnalyzing(false);
      }, 800);
      
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setFanMood('neutral');
      setFanIntent('browsing');
    }
  }, [fanMessage]);

  // Simulate AI analysis of fan message
  const analyzeFanMessage = (message: string) => {
    // This would be replaced with actual AI analysis in production
    const lowerMessage = message.toLowerCase();
    
    // Determine fan mood
    if (lowerMessage.includes('love') || lowerMessage.includes('amazing') || lowerMessage.includes('great')) {
      setFanMood('excited');
    } else if (lowerMessage.includes('miss') || lowerMessage.includes('lonely') || lowerMessage.includes('sad')) {
      setFanMood('lonely');
    } else if (lowerMessage.includes('busy') || lowerMessage.includes('later') || lowerMessage.includes('tomorrow')) {
      setFanMood('distracted');
    } else {
      setFanMood('neutral');
    }
    
    // Determine fan intent
    if (lowerMessage.includes('buy') || lowerMessage.includes('purchase') || lowerMessage.includes('how much')) {
      setFanIntent('purchasing');
      setSuggestions([
        "I have a special offer just for you! Would you like to see it? 😉",
        "I can send you that as a PPV for $9.99. It's my most popular content!",
        "I'd love to make that happen for you! Check your DMs in 5 minutes 💕"
      ]);
    } else if (lowerMessage.includes('picture') || lowerMessage.includes('photo') || lowerMessage.includes('pic')) {
      setFanIntent('requesting content');
      setSuggestions([
        "I just took some new photos yesterday that I think you'll love 📸",
        "I have something special I've been saving just for you",
        "Check your messages in a few minutes, I'll send you something special 😘"
      ]);
    } else if (lowerMessage.includes('talk') || lowerMessage.includes('chat') || lowerMessage.includes('how are you')) {
      setFanIntent('conversation');
      setSuggestions([
        "I've been thinking about you! How has your week been?",
        "I'm so glad you messaged me today. I was just about to reach out 💕",
        "I've missed our conversations! Tell me about your day?"
      ]);
    } else {
      setFanIntent('browsing');
      setSuggestions([
        "I just posted some new content I think you'd really enjoy!",
        "I've been thinking about you lately. How have you been?",
        "I have a special surprise coming this weekend. Want a sneak peek?"
      ]);
    }
  };

  const getMoodEmoji = () => {
    switch (fanMood) {
      case 'excited': return '😍';
      case 'lonely': return '🥺';
      case 'distracted': return '⏱️';
      default: return '😊';
    }
  };

  const getIntentLabel = () => {
    switch (fanIntent) {
      case 'purchasing': return 'Ready to Purchase';
      case 'requesting content': return 'Requesting Content';
      case 'conversation': return 'Seeking Conversation';
      default: return 'Browsing';
    }
  };

  const getIntentColor = () => {
    switch (fanIntent) {
      case 'purchasing': return 'text-status-normal';
      case 'requesting content': return 'text-accent';
      case 'conversation': return 'text-light-200';
      default: return 'text-light-300';
    }
  };

  const handleCopySuggestion = (suggestion: string) => {
    navigator.clipboard.writeText(suggestion);
    // Show a temporary "Copied!" message
    const suggestionsCopy = [...suggestions];
    const index = suggestionsCopy.indexOf(suggestion);
    if (index !== -1) {
      suggestionsCopy[index] = "Copied to clipboard! ✓";
      setSuggestions(suggestionsCopy);
      
      // Reset after 1.5 seconds
      setTimeout(() => {
        setSuggestions(suggestions);
      }, 1500);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">AI Coaching Assistant</h1>
        <p className="text-light-300 mt-1">Get real-time suggestions for fan interactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fan Message Input */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-heading mb-4">Fan Message</h2>
            <p className="text-light-300 mb-3">Paste a fan message to get AI-powered response suggestions</p>
            
            <textarea
              className="input w-full h-40 mb-4"
              placeholder="Paste fan message here..."
              value={fanMessage}
              onChange={(e) => setFanMessage(e.target.value)}
            ></textarea>
            
            <div className="flex justify-end">
              <button 
                className="btn btn-primary"
                onClick={() => setFanMessage('')}
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Fan Analysis */}
        <div>
          <div className="card mb-6">
            <h2 className="text-xl font-heading mb-4">Fan Analysis</h2>
            
            {isAnalyzing ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
                <span className="ml-3 text-light-300">Analyzing message...</span>
              </div>
            ) : fanMessage.trim().length > 10 ? (
              <div>
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{getMoodEmoji()}</div>
                  <div>
                    <h3 className="font-medium">Fan Mood</h3>
                    <p className="text-light-300 capitalize">{fanMood}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">🎯</div>
                  <div>
                    <h3 className="font-medium">Fan Intent</h3>
                    <p className={`${getIntentColor()} font-medium`}>{getIntentLabel()}</p>
                  </div>
                </div>
                
                <div className="pt-3 border-t border-dark-300">
                  <h3 className="font-medium mb-2">Suggested Actions</h3>
                  <ul className="text-sm text-light-300 space-y-1">
                    <li>• Respond within 30 minutes</li>
                    <li>• Use emojis in your response</li>
                    <li>• Ask a follow-up question</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-light-300 py-4">Enter a fan message to see analysis</p>
            )}
          </div>
        </div>
      </div>

      {/* Response Suggestions */}
      {suggestions.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-heading mb-4">Response Suggestions</h2>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="p-4 bg-dark-200 rounded-lg flex justify-between items-center"
              >
                <p className="text-light-200">{suggestion}</p>
                <button 
                  className="btn btn-secondary ml-4 whitespace-nowrap"
                  onClick={() => handleCopySuggestion(suggestion)}
                >
                  {suggestion.includes("Copied") ? "✓" : "Copy"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Coach;
