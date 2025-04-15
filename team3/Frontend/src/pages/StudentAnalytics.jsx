import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  PieChart, Pie, Cell,
  BarChart, Bar,
  XAxis, YAxis, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import './Analytics.css'; // Make sure this path is correct

const StudentAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/analytics/summary', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}` // Add auth if needed
          }
        });
        
        if (!res.data) {
          throw new Error('No data received');
        }
        
        setAnalytics(res.data);
      } catch (err) {
        setError(err.message);
        console.error('Error:', err.response?.data || err.message);
      }
    };
    
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="analytics-dashboard">
        <div className="error-message">
          <h2>Error Loading Analytics</h2>
          <p>{error}</p>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="analytics-dashboard">
        <div className="loading">Loading your analytics...</div>
      </div>
    );
  }

  // Chart data
  const pieData = [
    { name: 'Completed', value: analytics.completed, color: '#2ecc71' },
    { name: 'Upcoming', value: analytics.upcoming, color: '#3498db' }
  ];

  const barData = [
    { name: 'Total', value: analytics.total_appointments },
    { name: 'Completed', value: analytics.completed },
    { name: 'Upcoming', value: analytics.upcoming }
  ];

  return (
    <div className="analytics-dashboard">
      <h2>Your Appointment Analytics</h2>
      
      <div className="charts-container">
        <div className="chart-card">
          <h3>Appointment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Appointment Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#b32129" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Appointments</h3>
          <p>{analytics.total_appointments}</p>
        </div>
        <div className="stat-card">
          <h3>Upcoming</h3>
          <p>{analytics.upcoming}</p>
        </div>
        <div className="stat-card">
          <h3>Completed</h3>
          <p>{analytics.completed}</p>
        </div>
        <div className="stat-card">
          <h3>Completion Rate</h3>
          <p>{analytics.completion_rate}%</p>
        </div>
      </div>
    </div>
  );
};

export default StudentAnalytics;