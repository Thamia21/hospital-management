import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';

const RevenueTrendsWidget = ({ trends }) => {
  const data = {
    labels: trends?.labels || [],
    datasets: [
      {
        label: 'Revenue ($)',
        data: trends?.data || [],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Revenue Trends</Typography>
        <div style={{ height: '250px' }}>
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default RevenueTrendsWidget;
