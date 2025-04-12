import React, { useState, useEffect } from 'react';
import { getCreators } from '../api/dashboard';
import { Creator } from '../types';

interface CreatorCardProps {
  creator: Creator;
  onClick: (creator: Creator) => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onClick }) => {
  return (
    <div 
      className="card cursor-pointer hover:bg-dark-200 transition-colors"
      onClick={() => onClick(creator)}
    >
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-background font-bold text-xl">
          {creator.name.charAt(0)}
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium">{creator.name}</h3>
          <p className="text-xs text-light-300">
            Joined {creator.join_date ? new Date(creator.join_date).toLocaleDateString() : 'Unknown'}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-light-300">Total Earnings</p>
          <p className="font-medium">${creator.earnings_total.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-light-300">Status</p>
          <p className={`font-medium ${creator.earnings_total > 5000 ? 'text-status-normal' : 'text-status-caution'}`}>
            {creator.earnings_total > 5000 ? 'Top Earner' : 'Growing'}
          </p>
        </div>
      </div>
    </div>
  );
};

const Creators: React.FC = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const data = await getCreators();
      setCreators(data);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCreator = (creator: Creator) => {
    setSelectedCreator(creator);
  };

  const filteredCreators = searchTerm
    ? creators.filter(creator => 
        creator.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : creators;

  // Mock data for creator details
  const mockTopFans = [
    { id: 1, name: 'Fan 1', spent: 450.0, lastActive: '2025-04-10' },
    { id: 2, name: 'Fan 2', spent: 320.0, lastActive: '2025-04-11' },
    { id: 3, name: 'Fan 3', spent: 280.0, lastActive: '2025-04-09' },
    { id: 4, name: 'Fan 4', spent: 210.0, lastActive: '2025-04-08' },
    { id: 5, name: 'Fan 5', spent: 180.0, lastActive: '2025-04-11' },
  ];

  const mockSilentFans = [
    { id: 6, name: 'Fan 6', lastActive: '2025-03-15', daysSilent: 28 },
    { id: 7, name: 'Fan 7', lastActive: '2025-03-20', daysSilent: 23 },
    { id: 8, name: 'Fan 8', lastActive: '2025-03-25', daysSilent: 18 },
  ];

  const mockAssignedChatters = [
    { id: 1, name: 'Chatter 1', performance: 92 },
    { id: 2, name: 'Chatter 2', performance: 87 },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">Creator Command Center</h1>
        <p className="text-light-300 mt-1">Manage creators and their performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Creator List */}
        <div>
          <div className="mb-4">
            <input
              type="text"
              className="input w-full"
              placeholder="Search creators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="card p-6 text-center">
              <p className="text-light-300">No creators found</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {filteredCreators.map(creator => (
                <CreatorCard 
                  key={creator.id} 
                  creator={creator} 
                  onClick={handleSelectCreator}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Creator Details */}
        <div className="lg:col-span-2">
          {selectedCreator ? (
            <div>
              <div className="card mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-background font-bold text-2xl">
                      {selectedCreator.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-heading font-semibold">{selectedCreator.name}</h2>
                      <p className="text-light-300">
                        Joined {selectedCreator.join_date ? new Date(selectedCreator.join_date).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-light-300">Total Earnings</p>
                    <p className="text-2xl font-semibold">${selectedCreator.earnings_total.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-dark-200 rounded-lg">
                    <p className="text-sm text-light-300">Fan Count</p>
                    <p className="text-xl font-semibold">127</p>
                  </div>
                  <div className="p-3 bg-dark-200 rounded-lg">
                    <p className="text-sm text-light-300">Avg. Response Time</p>
                    <p className="text-xl font-semibold">2.4 hours</p>
                  </div>
                  <div className="p-3 bg-dark-200 rounded-lg">
                    <p className="text-sm text-light-300">Content Pieces</p>
                    <p className="text-xl font-semibold">83</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Top Fans */}
                <div className="card">
                  <h3 className="text-lg font-medium mb-3">Top Fans</h3>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Spent</th>
                          <th>Last Active</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockTopFans.map(fan => (
                          <tr key={fan.id}>
                            <td>{fan.name}</td>
                            <td>${fan.spent.toFixed(2)}</td>
                            <td>{new Date(fan.lastActive).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Silent Fan Recovery */}
                <div className="card">
                  <h3 className="text-lg font-medium mb-3">Silent Fan Recovery</h3>
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Last Active</th>
                          <th>Days Silent</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockSilentFans.map(fan => (
                          <tr key={fan.id}>
                            <td>{fan.name}</td>
                            <td>{new Date(fan.lastActive).toLocaleDateString()}</td>
                            <td>{fan.daysSilent}</td>
                            <td>
                              <button className="text-xs text-accent hover:underline">
                                Re-engage
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Assigned Chatters */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Assigned Chatters</h3>
                  <button className="btn btn-secondary text-sm">Assign Chatter</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAssignedChatters.map(chatter => (
                    <div key={chatter.id} className="p-4 bg-dark-200 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{chatter.name}</p>
                        <p className="text-xs text-light-300">Performance Score: {chatter.performance}</p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${chatter.performance > 85 ? 'bg-status-normal' : 'bg-status-caution'}`}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center h-full flex flex-col items-center justify-center">
              <div className="text-5xl mb-4">👈</div>
              <h3 className="text-xl font-medium mb-2">Select a Creator</h3>
              <p className="text-light-300">Choose a creator from the list to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Creators;
