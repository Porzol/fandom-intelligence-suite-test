import React, { useState, useEffect } from 'react';
import { getChatters } from '../api/dashboard';
import { Chatter } from '../types';

const Team: React.FC = () => {
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'performance' | 'shifts' | 'leaderboard'>('performance');

  useEffect(() => {
    fetchChatters();
  }, []);

  const fetchChatters = async () => {
    try {
      setLoading(true);
      const data = await getChatters();
      setChatters(data);
    } catch (error) {
      console.error('Error fetching chatters:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for shifts
  const mockShifts = [
    { id: 1, chatter_id: 1, chatter_name: 'Chatter 1', start_time: '2025-04-12T08:00:00Z', end_time: '2025-04-12T16:00:00Z', status: 'active' },
    { id: 2, chatter_id: 2, chatter_name: 'Chatter 2', start_time: '2025-04-12T16:00:00Z', end_time: '2025-04-13T00:00:00Z', status: 'upcoming' },
    { id: 3, chatter_id: 3, chatter_name: 'Chatter 3', start_time: '2025-04-11T08:00:00Z', end_time: '2025-04-11T16:00:00Z', status: 'completed' },
    { id: 4, chatter_id: 4, chatter_name: 'Chatter 4', start_time: '2025-04-11T16:00:00Z', end_time: '2025-04-12T00:00:00Z', status: 'completed' },
    { id: 5, chatter_id: 5, chatter_name: 'Chatter 5', start_time: '2025-04-13T08:00:00Z', end_time: '2025-04-13T16:00:00Z', status: 'upcoming' },
  ];

  // Mock data for leaderboard
  const mockLeaderboard = chatters
    .map(chatter => ({
      ...chatter,
      messages_sent: Math.floor(Math.random() * 500) + 100,
      conversion_rate: Math.random() * 0.3 + 0.1,
      revenue_generated: Math.random() * 5000 + 1000,
    }))
    .sort((a, b) => b.performance_score - a.performance_score);

  const formatShiftTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatShiftDate = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleDateString();
  };

  const getShiftStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-normal">Active</span>;
      case 'upcoming':
        return <span className="badge badge-caution">Upcoming</span>;
      case 'completed':
        return <span className="badge badge-risk">Completed</span>;
      default:
        return null;
    }
  };

  const renderPerformanceTab = () => (
    <div className="card">
      <h2 className="text-xl font-heading mb-4">Team Performance</h2>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Timezone</th>
              <th>Performance Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {chatters.map((chatter) => (
              <tr key={chatter.id}>
                <td className="font-medium">{chatter.name}</td>
                <td>{chatter.timezone || 'Unknown'}</td>
                <td>{chatter.performance_score.toFixed(1)}</td>
                <td>
                  {chatter.performance_score >= 85 ? (
                    <span className="badge badge-normal">High</span>
                  ) : chatter.performance_score >= 70 ? (
                    <span className="badge badge-caution">Average</span>
                  ) : (
                    <span className="badge badge-risk">Low</span>
                  )}
                </td>
                <td>
                  <button className="text-xs text-accent hover:underline mr-2">
                    View Details
                  </button>
                  <button className="text-xs text-light-300 hover:underline">
                    Schedule
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderShiftsTab = () => (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-heading">Shift Schedule</h2>
        <button className="btn btn-primary">Schedule Shift</button>
      </div>
      
      <div className="card mb-6">
        <h3 className="text-lg font-medium mb-3">Active & Upcoming Shifts</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Chatter</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockShifts.filter(shift => shift.status !== 'completed').map((shift) => (
                <tr key={shift.id}>
                  <td className="font-medium">{shift.chatter_name}</td>
                  <td>{formatShiftDate(shift.start_time)}</td>
                  <td>{formatShiftTime(shift.start_time)} - {formatShiftTime(shift.end_time)}</td>
                  <td>{getShiftStatusBadge(shift.status)}</td>
                  <td>
                    {shift.status === 'active' ? (
                      <button className="text-xs text-status-risk hover:underline">
                        End Shift
                      </button>
                    ) : (
                      <button className="text-xs text-light-300 hover:underline">
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-medium mb-3">Completed Shifts</h3>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Chatter</th>
                <th>Date</th>
                <th>Time</th>
                <th>Messages</th>
                <th>Conversions</th>
              </tr>
            </thead>
            <tbody>
              {mockShifts.filter(shift => shift.status === 'completed').map((shift) => (
                <tr key={shift.id}>
                  <td className="font-medium">{shift.chatter_name}</td>
                  <td>{formatShiftDate(shift.start_time)}</td>
                  <td>{formatShiftTime(shift.start_time)} - {formatShiftTime(shift.end_time)}</td>
                  <td>{Math.floor(Math.random() * 100) + 50}</td>
                  <td>{Math.floor(Math.random() * 20) + 5}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderLeaderboardTab = () => (
    <div className="card">
      <h2 className="text-xl font-heading mb-6">Team Leaderboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card bg-dark-200 text-center py-4">
          <p className="text-light-300 mb-1">Top Performer</p>
          <h3 className="text-xl font-medium">{mockLeaderboard[0]?.name || 'N/A'}</h3>
          <p className="text-accent font-medium">{mockLeaderboard[0]?.performance_score.toFixed(1) || 'N/A'}</p>
        </div>
        
        <div className="card bg-dark-200 text-center py-4">
          <p className="text-light-300 mb-1">Most Messages</p>
          <h3 className="text-xl font-medium">
            {mockLeaderboard.sort((a, b) => b.messages_sent - a.messages_sent)[0]?.name || 'N/A'}
          </h3>
          <p className="text-accent font-medium">
            {mockLeaderboard.sort((a, b) => b.messages_sent - a.messages_sent)[0]?.messages_sent || 'N/A'}
          </p>
        </div>
        
        <div className="card bg-dark-200 text-center py-4">
          <p className="text-light-300 mb-1">Highest Revenue</p>
          <h3 className="text-xl font-medium">
            {mockLeaderboard.sort((a, b) => b.revenue_generated - a.revenue_generated)[0]?.name || 'N/A'}
          </h3>
          <p className="text-accent font-medium">
            ${mockLeaderboard.sort((a, b) => b.revenue_generated - a.revenue_generated)[0]?.revenue_generated.toFixed(2) || 'N/A'}
          </p>
        </div>
      </div>
      
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Performance Score</th>
              <th>Messages Sent</th>
              <th>Conversion Rate</th>
              <th>Revenue Generated</th>
            </tr>
          </thead>
          <tbody>
            {mockLeaderboard.map((chatter, index) => (
              <tr key={chatter.id} className={index < 3 ? 'bg-dark-200 bg-opacity-50' : ''}>
                <td className="font-bold">{index + 1}</td>
                <td className="font-medium">{chatter.name}</td>
                <td>{chatter.performance_score.toFixed(1)}</td>
                <td>{chatter.messages_sent}</td>
                <td>{(chatter.conversion_rate * 100).toFixed(1)}%</td>
                <td>${chatter.revenue_generated.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">Team Ops Dashboard</h1>
        <p className="text-light-300 mt-1">Monitor team performance and manage shifts</p>
      </div>

      <div className="flex border-b border-dark-300 mb-6">
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'performance'
              ? 'border-b-2 border-accent text-accent'
              : 'text-light-300 hover:text-text'
          }`}
          onClick={() => setActiveTab('performance')}
        >
          Performance
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'shifts'
              ? 'border-b-2 border-accent text-accent'
              : 'text-light-300 hover:text-text'
          }`}
          onClick={() => setActiveTab('shifts')}
        >
          Shifts
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'leaderboard'
              ? 'border-b-2 border-accent text-accent'
              : 'text-light-300 hover:text-text'
          }`}
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : (
        <>
          {activeTab === 'performance' && renderPerformanceTab()}
          {activeTab === 'shifts' && renderShiftsTab()}
          {activeTab === 'leaderboard' && renderLeaderboardTab()}
        </>
      )}
    </div>
  );
};

export default Team;
