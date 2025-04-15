import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, 
  XAxis, YAxis, 
  Tooltip, Legend, 
  ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import './AdvisorAnalytics.css';

const AdvisorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/analytics/advisor-performance', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!res.data?.advisors) {
          throw new Error('No advisor data received');
        }
        
        // Transform data for the current advisor
        const advisorId = localStorage.getItem('advisor_id'); // Assuming you store this
        const allAdvisors = res.data.advisors;
        const currentAdvisor = allAdvisors.find(a => a._id === advisorId) || allAdvisors[0];
        
        setAnalytics({
          current: currentAdvisor,
          all: allAdvisors
        });
      } catch (err) {
        setError(err.message);
        console.error('Error:', err.response?.data || err.message);
      }
    };
    
    fetchData();
  }, []);

  if (error) return <div className="error">Error: {error}</div>;
  if (!analytics) return <div className="loading">Loading advisor analytics...</div>;

  // Prepare chart data
  const performanceData = [
    {
      name: 'Completed',
      value: analytics.current.completed
    },
    {
      name: 'Pending',
      value: analytics.current.total_appointments - analytics.current.completed
    }
  ];

  const comparisonData = analytics.all.slice(0, 5).map(advisor => ({
    name: advisor._id, // You might want to lookup advisor names
    appointments: advisor.total_appointments,
    completion: advisor.completion_rate
  }));

  return (
    <div className="advisor-analytics">
      <h2>Advisor Performance Dashboard</h2>
      
      {/* Current Advisor Stats */}
      <div className="advisor-stats">
        <div className="stat-card">
          <h3>Total Appointments</h3>
          <p>{analytics.current.total_appointments}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p>{analytics.current.completed}</p>
        </div>
        <div className="stat-card">
          <h3>Completion Rate</h3>
          <p>{analytics.current.completion_rate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="charts-container">
        <div className="chart-card">
          <h3>Your Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={performanceData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#2ecc71" />
                <Cell fill="#b32129" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Team Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={comparisonData}>
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="appointments" name="Total Appointments" fill="#3498db" />
              <Bar yAxisId="right" dataKey="completion" name="Completion %" fill="#f1c40f" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdvisorAnalytics;