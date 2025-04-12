import React, { useState, useEffect } from 'react';
import { getFans, getChatters, getCreators } from '../api/dashboard';
import { Fan, Chatter, Creator } from '../types';

// Dashboard KPI Card Component
interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, change, isPositive, icon }) => {
  return (
    <div className="card">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm text-light-300">{title}</h3>
          <p className="text-2xl font-semibold mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${isPositive ? 'text-status-normal' : 'text-status-risk'}`}>
              {isPositive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        {icon && <div className="text-accent">{icon}</div>}
      </div>
    </div>
  );
};

// Dashboard Tab Component
interface TabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Tabs: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-dark-300 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === tab
              ? 'border-b-2 border-accent text-accent'
              : 'text-light-300 hover:text-text'
          }`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Fans');
  const [fans, setFans] = useState<Fan[]>([]);
  const [chatters, setChatters] = useState<Chatter[]>([]);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (activeTab) {
          case 'Fans':
            const fansData = await getFans();
            setFans(fansData);
            break;
          case 'Chatters':
            const chattersData = await getChatters();
            setChatters(chattersData);
            break;
          case 'Creators':
            const creatorsData = await getCreators();
            setCreators(creatorsData);
            break;
        }
      } catch (error) {
        console.error(`Error fetching ${activeTab.toLowerCase()} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Render KPI cards based on active tab
  const renderKPICards = () => {
    switch (activeTab) {
      case 'Fans':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard title="Total Fans" value={fans.length} />
            <KPICard 
              title="Average Spend" 
              value={`$${fans.reduce((sum, fan) => sum + fan.total_spent, 0) / fans.length || 0}`} 
              change="12%" 
              isPositive={true} 
            />
            <KPICard title="Active Fans" value={fans.filter(fan => new Date(fan.last_active) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} />
            <KPICard 
              title="Churn Rate" 
              value="4.2%" 
              change="0.5%" 
              isPositive={false} 
            />
          </div>
        );
      case 'Chatters':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard title="Total Chatters" value={chatters.length} />
            <KPICard 
              title="Avg Performance" 
              value={chatters.reduce((sum, chatter) => sum + chatter.performance_score, 0) / chatters.length || 0} 
              change="3.2%" 
              isPositive={true} 
            />
            <KPICard title="Top Performer" value={chatters.sort((a, b) => b.performance_score - a.performance_score)[0]?.name || 'N/A'} />
            <KPICard title="Active Shifts" value="12" />
          </div>
        );
      case 'Creators':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard title="Total Creators" value={creators.length} />
            <KPICard 
              title="Total Earnings" 
              value={`$${creators.reduce((sum, creator) => sum + creator.earnings_total, 0)}`} 
              change="8.7%" 
              isPositive={true} 
            />
            <KPICard 
              title="Avg Earnings/Creator" 
              value={`$${creators.reduce((sum, creator) => sum + creator.earnings_total, 0) / creators.length || 0}`} 
            />
            <KPICard title="New Creators (30d)" value={creators.filter(creator => new Date(creator.join_date || '') > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} />
          </div>
        );
      default:
        return null;
    }
  };

  // Render table based on active tab
  const renderTable = () => {
    switch (activeTab) {
      case 'Fans':
        return (
          <div className="card">
            <h2 className="text-xl font-heading mb-4">Fan Details</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Total Spent</th>
                    <th>First Seen</th>
                    <th>Last Active</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fans.map((fan) => (
                    <tr key={fan.id}>
                      <td className="font-medium">{fan.name}</td>
                      <td>${fan.total_spent.toFixed(2)}</td>
                      <td>{new Date(fan.first_seen).toLocaleDateString()}</td>
                      <td>{new Date(fan.last_active).toLocaleDateString()}</td>
                      <td>
                        {new Date(fan.last_active) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                          <span className="badge badge-normal">Active</span>
                        ) : new Date(fan.last_active) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? (
                          <span className="badge badge-caution">Inactive</span>
                        ) : (
                          <span className="badge badge-risk">Dormant</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Chatters':
        return (
          <div className="card">
            <h2 className="text-xl font-heading mb-4">Chatter Performance</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Timezone</th>
                    <th>Performance Score</th>
                    <th>Status</th>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'Creators':
        return (
          <div className="card">
            <h2 className="text-xl font-heading mb-4">Creator Earnings</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Join Date</th>
                    <th>Total Earnings</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((creator) => (
                    <tr key={creator.id}>
                      <td className="font-medium">{creator.name}</td>
                      <td>{creator.join_date ? new Date(creator.join_date).toLocaleDateString() : 'Unknown'}</td>
                      <td>${creator.earnings_total.toFixed(2)}</td>
                      <td>
                        {creator.earnings_total > 5000 ? (
                          <span className="badge badge-normal">Top Earner</span>
                        ) : creator.earnings_total > 2000 ? (
                          <span className="badge badge-caution">Growing</span>
                        ) : (
                          <span className="badge badge-risk">New</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">Intelligence Dashboard</h1>
        <p className="text-light-300 mt-1">Monitor performance metrics and analytics</p>
      </div>

      <Tabs
        tabs={['Fans', 'Chatters', 'Creators']}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : (
        <>
          {renderKPICards()}
          {renderTable()}
        </>
      )}
    </div>
  );
};

export default Dashboard;
