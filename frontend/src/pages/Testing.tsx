import React, { useState, useEffect } from 'react';
import { startTest, getTestResults } from '../api/testing';
import { TestResult } from '../types';

const Testing: React.FC = () => {
  const [activeTest, setActiveTest] = useState<TestResult | null>(null);
  const [testName, setTestName] = useState('');
  const [variantA, setVariantA] = useState('');
  const [variantB, setVariantB] = useState('');
  const [loading, setLoading] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [error, setError] = useState('');

  // Poll for test results if a test is active
  useEffect(() => {
    if (activeTest && activeTest.status === 'running') {
      const interval = setInterval(() => {
        fetchTestResults(activeTest.id);
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [activeTest]);

  const fetchTestResults = async (testId: string) => {
    try {
      const results = await getTestResults(testId);
      setActiveTest(results);
      
      if (results.status !== 'running') {
        // Test is complete, stop polling
        setTestStarted(false);
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
    }
  };

  const handleStartTest = async () => {
    if (!testName || !variantA || !variantB) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const response = await startTest({
        name: testName,
        variant_a: { content: variantA },
        variant_b: { content: variantB }
      });
      
      setTestStarted(true);
      fetchTestResults(response.test_id);
    } catch (error) {
      console.error('Error starting test:', error);
      setError('Failed to start test');
    } finally {
      setLoading(false);
    }
  };

  const calculateConversionRate = (conversions: number, impressions: number) => {
    if (impressions === 0) return 0;
    return (conversions / impressions) * 100;
  };

  const getWinningVariant = () => {
    if (!activeTest) return null;
    
    const { variant_a, variant_b } = activeTest.metrics;
    const conversionRateA = calculateConversionRate(variant_a.conversions, variant_a.impressions);
    const conversionRateB = calculateConversionRate(variant_b.conversions, variant_b.impressions);
    
    if (conversionRateA > conversionRateB) {
      return 'A';
    } else if (conversionRateB > conversionRateA) {
      return 'B';
    } else {
      return 'Tie';
    }
  };

  const renderTestResults = () => {
    if (!activeTest) return null;
    
    const { variant_a, variant_b } = activeTest.metrics;
    const conversionRateA = calculateConversionRate(variant_a.conversions, variant_a.impressions);
    const conversionRateB = calculateConversionRate(variant_b.conversions, variant_b.impressions);
    const winner = getWinningVariant();
    
    return (
      <div className="mt-8">
        <h2 className="text-xl font-heading mb-4">Test Results: {activeTest.name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className={`card ${winner === 'A' ? 'border-2 border-status-normal' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Variant A</h3>
              {winner === 'A' && <span className="badge badge-normal">Winner</span>}
            </div>
            
            <p className="text-light-200 mb-4">{activeTest.variant_a.content}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-light-300">Impressions</p>
                <p className="text-xl font-semibold">{variant_a.impressions}</p>
              </div>
              <div>
                <p className="text-sm text-light-300">Conversions</p>
                <p className="text-xl font-semibold">{variant_a.conversions}</p>
              </div>
              <div>
                <p className="text-sm text-light-300">Conversion Rate</p>
                <p className="text-xl font-semibold">{conversionRateA.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-light-300">Revenue</p>
                <p className="text-xl font-semibold">${variant_a.revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div className={`card ${winner === 'B' ? 'border-2 border-status-normal' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium">Variant B</h3>
              {winner === 'B' && <span className="badge badge-normal">Winner</span>}
            </div>
            
            <p className="text-light-200 mb-4">{activeTest.variant_b.content}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-light-300">Impressions</p>
                <p className="text-xl font-semibold">{variant_b.impressions}</p>
              </div>
              <div>
                <p className="text-sm text-light-300">Conversions</p>
                <p className="text-xl font-semibold">{variant_b.conversions}</p>
              </div>
              <div>
                <p className="text-sm text-light-300">Conversion Rate</p>
                <p className="text-xl font-semibold">{conversionRateB.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-light-300">Revenue</p>
                <p className="text-xl font-semibold">${variant_b.revenue.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="text-lg font-medium mb-3">AI Analysis</h3>
          
          {activeTest.status === 'running' ? (
            <p className="text-light-300">Test is still running. Analysis will be available when complete.</p>
          ) : (
            <>
              <p className="text-light-200 mb-3">
                {winner === 'A' ? (
                  `Variant A is outperforming Variant B with a ${(conversionRateA - conversionRateB).toFixed(1)}% higher conversion rate. 
                  The more direct language in Variant A appears to resonate better with fans.`
                ) : winner === 'B' ? (
                  `Variant B is outperforming Variant A with a ${(conversionRateB - conversionRateA).toFixed(1)}% higher conversion rate. 
                  The more personalized approach in Variant B appears to connect better with fans.`
                ) : (
                  `Both variants are performing equally. Consider running the test longer or creating more distinct variations.`
                )}
              </p>
              
              <h4 className="font-medium mb-2">Recommendations:</h4>
              <ul className="text-light-200 space-y-1">
                <li>• {winner !== 'Tie' ? `Use Variant ${winner} as your primary message` : 'Create more distinct variants'}</li>
                <li>• Test different times of day for optimal engagement</li>
                <li>• Consider segmenting your audience for more targeted messaging</li>
              </ul>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold">A/B Testing Lab</h1>
        <p className="text-light-300 mt-1">Test different messages to optimize performance</p>
      </div>

      <div className="card">
        <h2 className="text-xl font-heading mb-4">Create New Test</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-status-risk bg-opacity-20 text-status-risk rounded-md">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label htmlFor="testName" className="block text-sm font-medium mb-1">
            Test Name
          </label>
          <input
            id="testName"
            type="text"
            className="input w-full"
            placeholder="e.g., PPV Offer Test"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            disabled={testStarted || loading}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="variantA" className="block text-sm font-medium mb-1">
              Variant A
            </label>
            <textarea
              id="variantA"
              className="input w-full h-32"
              placeholder="Enter message for Variant A"
              value={variantA}
              onChange={(e) => setVariantA(e.target.value)}
              disabled={testStarted || loading}
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="variantB" className="block text-sm font-medium mb-1">
              Variant B
            </label>
            <textarea
              id="variantB"
              className="input w-full h-32"
              placeholder="Enter message for Variant B"
              value={variantB}
              onChange={(e) => setVariantB(e.target.value)}
              disabled={testStarted || loading}
            ></textarea>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            className="btn btn-primary"
            onClick={handleStartTest}
            disabled={testStarted || loading}
          >
            {loading ? (
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-background rounded-full"></span>
                Starting Test...
              </span>
            ) : testStarted ? (
              'Test Running...'
            ) : (
              'Start Test'
            )}
          </button>
        </div>
      </div>

      {activeTest && renderTestResults()}
    </div>
  );
};

export default Testing;
