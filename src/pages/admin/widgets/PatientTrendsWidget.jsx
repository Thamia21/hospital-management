import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const PatientTrendsWidget = ({ trends }) => {
  const data = {
    labels: trends?.labels || [],
    datasets: [
      {
        label: 'New Patients',
        data: trends?.data || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.1)'
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
          stepSize: 1
        }
      }
    },
    maintainAspectRatio: false
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Patient Trends</Typography>
        <div style={{ height: '250px' }}>
          <Line data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientTrendsWidget;
