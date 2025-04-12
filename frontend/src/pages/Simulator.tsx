import React, { useState, useEffect } from 'react';
import { startSimulation, sendSimulationMessage, endSimulation } from '../api/simulator';
import { SimulationResponse, SimulationMessageResponse, SimulationResult } from '../types';

const Simulator: React.FC = () => {
  const [simulationId, setSimulationId] = useState<string | null>(null);
  const [fanProfile, setFanProfile] = useState<any | null>(null);
  const [messages, setMessages] = useState<Array<{text: string, sender: 'fan' | 'chatter', time: Date}>>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [simulationActive, setSimulationActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [coachingTips, setCoachingTips] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<any | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds(seconds => seconds + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timerActive]);

  // Format timer as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartSimulation = async () => {
    setLoading(true);
    try {
      // Start with a clean slate
      setMessages([]);
      setCoachingTips([]);
      setMetrics(null);
      setSimulationResult(null);
      setTimerSeconds(0);
      
      // Start the simulation
      const response = await startSimulation({
        fan_name: "Alex",
        spending_level: "medium",
        personality: "friendly",
        interests: ["fitness", "travel"],
        scenario: "general conversation"
      });
      
      setSimulationId(response.simulation_id);
      setFanProfile(response.fan_profile);
      setSimulationActive(true);
      setTimerActive(true);
      
      // Add initial fan message
      const initialMessages = [
        {
          text: "Hey there! How's it going today? 😊",
          sender: 'fan' as const,
          time: new Date()
        }
      ];
      setMessages(initialMessages);
      
    } catch (error) {
      console.error('Error starting simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !simulationId) return;
    
    // Add chatter message to the chat
    const chatterMessage = {
      text: currentMessage,
      sender: 'chatter' as const,
      time: new Date()
    };
    setMessages(prev => [...prev, chatterMessage]);
    setCurrentMessage('');
    
    try {
      // Get AI response
      const response = await sendSimulationMessage(simulationId, currentMessage);
      
      // Add fan response to the chat
      const fanResponse = {
        text: response.response,
        sender: 'fan' as const,
        time: new Date()
      };
      
      // Short delay to make it feel more natural
      setTimeout(() => {
        setMessages(prev => [...prev, fanResponse]);
      }, 1000);
      
      // Update coaching tips and metrics
      setCoachingTips(response.coaching_tips);
      setMetrics(response.metrics);
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleEndSimulation = async () => {
    if (!simulationId) return;
    
    setLoading(true);
    setTimerActive(false);
    
    try {
      const result = await endSimulation(simulationId);
      setSimulationResult(result);
      setSimulationActive(false);
    } catch (error) {
      console.error('Error ending simulation:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderChatBubble = (message: {text: string, sender: 'fan' | 'chatter', time: Date}, index: number) => {
    const isFan = message.sender === 'fan';
    
    return (
      <div 
        key={index} 
        className={`flex ${isFan ? 'justify-start' : 'justify-end'} mb-4`}
      >
        <div 
          className={`max-w-[75%] rounded-lg px-4 py-2 ${
            isFan ? 'bg-dark-200 text-light-200' : 'bg-accent text-background'
          }`}
        >
          <p>{message.text}</p>
          <p className="text-xs mt-1 opacity-70">
            {message.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">Chatter Simulator</h1>
        <p className="text-light-300 mt-1">Practice your messaging skills with AI-simulated fans</p>
      </div>

      {!simulationActive && !simulationResult ? (
        <div className="card text-center py-8">
          <h2 className="text-2xl font-heading mb-4">Ready to Start a Simulation?</h2>
          <p className="text-light-300 mb-6 max-w-md mx-auto">
            Practice your chatting skills with an AI-simulated fan. You'll receive real-time feedback and performance metrics.
          </p>
          <button 
            className="btn btn-primary"
            onClick={handleStartSimulation}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-background rounded-full"></span>
                Starting...
              </span>
            ) : (
              'Start Simulation'
            )}
          </button>
        </div>
      ) : simulationResult ? (
        // Simulation Results
        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-heading">Simulation Results</h2>
            <div className="text-right">
              <p className="text-sm text-light-300">Duration</p>
              <p className="text-xl font-semibold">{simulationResult.duration_minutes} minutes</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="card bg-dark-200">
              <h3 className="text-xl font-medium mb-4">Performance Score</h3>
              <div className="flex items-center justify-center">
                <div className="text-5xl font-bold text-accent">{simulationResult.final_score.toFixed(1)}</div>
                <div className="text-2xl ml-1">/100</div>
              </div>
            </div>
            
            <div className="card bg-dark-200">
              <h3 className="text-xl font-medium mb-4">Key Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-light-300">Engagement Rate</p>
                  <p className="text-xl font-semibold">{(simulationResult.metrics.engagement_rate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-light-300">Response Quality</p>
                  <p className="text-xl font-semibold">{(simulationResult.metrics.response_quality * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-light-300">Conversion Opportunities</p>
                  <p className="text-xl font-semibold">{simulationResult.metrics.conversion_opportunities}</p>
                </div>
                <div>
                  <p className="text-sm text-light-300">Successful Conversions</p>
                  <p className="text-xl font-semibold">{simulationResult.metrics.conversion_success}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-xl font-medium mb-3">Feedback</h3>
            <ul className="space-y-2">
              {simulationResult.feedback.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-accent mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-end">
            <button 
              className="btn btn-primary"
              onClick={() => {
                setSimulationResult(null);
                setSimulationId(null);
                setFanProfile(null);
              }}
            >
              Start New Simulation
            </button>
          </div>
        </div>
      ) : (
        // Active Simulation
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-dark-300 flex items-center justify-center text-accent font-bold">
                    {fanProfile?.name.charAt(0)}
                  </div>
                  <div className="ml-2">
                    <h3 className="font-medium">{fanProfile?.name}</h3>
                    <p className="text-xs text-light-300">
                      {fanProfile?.personality}, {fanProfile?.spending_level} spender
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-light-300 mr-2">{formatTime(timerSeconds)}</div>
                  <button 
                    className="btn btn-danger"
                    onClick={handleEndSimulation}
                    disabled={loading}
                  >
                    End Simulation
                  </button>
                </div>
              </div>
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto mb-4 p-4 bg-dark-100 rounded-lg">
                {messages.map((message, index) => renderChatBubble(message, index))}
              </div>
              
              {/* Message Input */}
              <div className="flex">
                <input
                  type="text"
                  className="input flex-1 mr-2"
                  placeholder="Type your message..."
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button 
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
          
          <div>
            {/* Coaching Panel */}
            <div className="card mb-6">
              <h3 className="text-xl font-medium mb-3">Coaching Tips</h3>
              {coachingTips.length > 0 ? (
                <ul className="space-y-2">
                  {coachingTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-light-300">Send a message to get coaching tips</p>
              )}
            </div>
            
            {/* Metrics Panel */}
            {metrics && (
              <div className="card">
                <h3 className="text-xl font-medium mb-3">Live Metrics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Engagement Score</span>
                      <span className="text-sm font-medium">{(metrics.engagement_score * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-dark-300 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ width: `${metrics.engagement_score * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Conversion Potential</span>
                      <span className="text-sm font-medium">{(metrics.conversion_potential * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-dark-300 rounded-full h-2">
                      <div 
                        className="bg-accent h-2 rounded-full" 
                        style={{ width: `${metrics.conversion_potential * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between">
                      <span className="text-sm">Fan Sentiment</span>
                      <span className="text-sm font-medium capitalize">{metrics.sentiment}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Simulator;
