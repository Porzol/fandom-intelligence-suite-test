import React, { useState, useEffect } from 'react';
import { getInsights, generateInsights } from '../api/insights';
import { AIInsight, TargetType } from '../types';

interface InsightCardProps {
  insight: AIInsight;
  onArchive: (id: number) => void;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onArchive }) => {
  const getTargetTypeIcon = (type: TargetType) => {
    switch (type) {
      case TargetType.FAN:
        return '👤';
      case TargetType.CHATTER:
        return '💬';
      case TargetType.CREATOR:
        return '🌟';
      case TargetType.MESSAGE:
        return '📝';
      default:
        return '📊';
    }
  };

  return (
    <div className="card mb-4">
      <div className="flex items-start">
        <div className="text-2xl mr-3">{getTargetTypeIcon(insight.target_type)}</div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium">
              {insight.target_type} {insight.target_id ? `#${insight.target_id}` : 'Overview'}
            </h3>
            <div className="flex items-center">
              <span className="text-xs text-light-300 mr-2">
                {new Date(insight.created_at).toLocaleDateString()}
              </span>
              <button 
                onClick={() => onArchive(insight.id)}
                className="text-xs text-light-300 hover:text-status-risk"
              >
                Archive
              </button>
            </div>
          </div>
          
          <p className="mt-2 text-light-200">{insight.summary}</p>
          
          <div className="mt-3">
            <button 
              className="text-xs text-accent hover:underline mr-2"
              onClick={() => document.getElementById(`details-${insight.id}`)?.classList.toggle('hidden')}
            >
              View Details
            </button>
            <span className="text-xs text-light-300">
              Confidence: {(insight.confidence_score * 100).toFixed(0)}%
            </span>
          </div>
          
          <div id={`details-${insight.id}`} className="hidden mt-3 p-3 bg-dark-200 rounded-md">
            <p className="text-sm mb-3">{insight.details}</p>
            
            {insight.action_items && insight.action_items.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-medium mb-1">Action Items:</h4>
                <ul className="text-sm space-y-1">
                  {insight.action_items.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-accent mr-2">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {insight.tags && insight.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {insight.tags.map((tag, index) => (
                  <span key={index} className="badge badge-normal">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Insights: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter] = useState<TargetType | 'all'>('all');
  const [targetId, setTargetId] = useState<string>('');
  const [targetType, setTargetType] = useState<TargetType>(TargetType.FAN);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const data = await getInsights();
      setInsights(data);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateInsight = async () => {
    try {
      setGenerating(true);
      
      const params: any = {
        target_type: targetType
      };
      
      if (targetId.trim()) {
        params.target_id = parseInt(targetId);
      }
      
      if (customPrompt.trim()) {
        params.custom_prompt = customPrompt;
      }
      
      await generateInsights(params);
      
      // In a real app, we might poll for completion or use websockets
      // For now, just wait a bit and then fetch the updated insights
      setTimeout(() => {
        fetchInsights();
        setGenerating(false);
        setShowGenerateForm(false);
        setTargetId('');
        setCustomPrompt('');
      }, 2000);
    } catch (error) {
      console.error('Error generating insights:', error);
      setGenerating(false);
    }
  };

  const handleArchiveInsight = async (id: number) => {
    try {
      // In a real implementation, this would call an API endpoint
      // For now, just remove it from the local state
      setInsights(insights.filter(insight => insight.id !== id));
    } catch (error) {
      console.error('Error archiving insight:', error);
    }
  };

  const filteredInsights = filter === 'all' 
    ? insights 
    : insights.filter(insight => insight.target_type === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">AI Insight Engine</h1>
        <p className="text-light-300 mt-1">AI-generated insights and analysis</p>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex space-x-2 mb-4 md:mb-0">
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-dark-300' : 'bg-dark-200'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === TargetType.FAN ? 'bg-dark-300' : 'bg-dark-200'}`}
            onClick={() => setFilter(TargetType.FAN)}
          >
            Fans
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === TargetType.CHATTER ? 'bg-dark-300' : 'bg-dark-200'}`}
            onClick={() => setFilter(TargetType.CHATTER)}
          >
            Chatters
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === TargetType.CREATOR ? 'bg-dark-300' : 'bg-dark-200'}`}
            onClick={() => setFilter(TargetType.CREATOR)}
          >
            Creators
          </button>
          <button 
            className={`px-3 py-1 rounded-full text-sm ${filter === TargetType.MESSAGE ? 'bg-dark-300' : 'bg-dark-200'}`}
            onClick={() => setFilter(TargetType.MESSAGE)}
          >
            Messages
          </button>
        </div>

        <div className="flex space-x-2">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowGenerateForm(!showGenerateForm)}
          >
            {showGenerateForm ? 'Cancel' : 'Generate Insight'}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => fetchInsights()}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {showGenerateForm && (
        <div className="card mb-6">
          <h2 className="text-xl font-heading mb-4">Generate New Insight</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="targetType" className="block text-sm font-medium mb-1">
                Target Type
              </label>
              <select
                id="targetType"
                className="select w-full"
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as TargetType)}
              >
                <option value={TargetType.FAN}>Fan</option>
                <option value={TargetType.CHATTER}>Chatter</option>
                <option value={TargetType.CREATOR}>Creator</option>
                <option value={TargetType.MESSAGE}>Message</option>
                <option value={TargetType.GENERAL}>General</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="targetId" className="block text-sm font-medium mb-1">
                Target ID (optional)
              </label>
              <input
                id="targetId"
                type="text"
                className="input w-full"
                placeholder="Leave empty for general insights"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="customPrompt" className="block text-sm font-medium mb-1">
              Custom Prompt (optional)
            </label>
            <textarea
              id="customPrompt"
              className="input w-full h-32"
              placeholder="Enter custom instructions for the AI..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            <button
              className="btn btn-primary"
              onClick={handleGenerateInsight}
              disabled={generating}
            >
              {generating ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-background rounded-full"></span>
                  Generating...
                </span>
              ) : (
                'Generate Insight'
              )}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : generating ? (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto mb-4"></div>
          <h3 className="text-xl font-medium">Generating new insights...</h3>
          <p className="text-light-300 mt-2">This may take a few moments</p>
        </div>
      ) : filteredInsights.length === 0 ? (
        <div className="card p-8 text-center">
          <h3 className="text-xl font-medium">No insights available</h3>
          <p className="text-light-300 mt-2">Generate new insights or change your filter</p>
        </div>
      ) : (
        <div>
          <div className="card mb-6">
            <h2 className="text-xl font-heading mb-4">Weekly Summary</h2>
            <p className="text-light-200">
              This week's analysis shows increased engagement from top fans, with a 12% rise in premium content purchases. 
              Chatters are maintaining a high response rate, though evening shift performance has dropped slightly. 
              Creator content frequency is up 8% with video content showing the strongest conversion rates.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge badge-normal">High Engagement</span>
              <span className="badge badge-caution">Evening Shift Drop</span>
              <span className="badge badge-normal">Video Content ↑</span>
            </div>
          </div>

          <h2 className="text-xl font-heading mb-4">Recent Insights</h2>
          {filteredInsights.map(insight => (
            <InsightCard 
              key={insight.id} 
              insight={insight} 
              onArchive={handleArchiveInsight}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Insights;
