"use client";

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const LineGraph = () => {
  const [data, setData] = useState<any>({ datasets: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/data');
        const responseData = response.data.data;

        // Sort data by timestamp
        const sensor1Data = responseData
          .filter((d: any) => d.sensorId === '1')
          .map((d: any) => ({ x: new Date(d.timestamp), y: d.value }))
          .sort((a: any, b: any) => a.x - b.x);

        const sensor2Data = responseData
          .filter((d: any) => d.sensorId === '2')
          .map((d: any) => ({ x: new Date(d.timestamp), y: d.value }))
          .sort((a: any, b: any) => a.x - b.x);

        setData({
          datasets: [
            {
              label: 'soil moisture sensor',
              data: sensor1Data,
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.5)',
              borderWidth: 2,
              tension: 0.1,
            },
            {
              label: 'sound sensor',
              data: sensor2Data,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.5)',
              borderWidth: 2,
              tension: 0.1,
            }
          ]
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <Line
        data={data}
        options={{
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'minute',
              },
              title: {
                display: true,
                text: 'Time',
              },
            },
            y: {
              title: {
                display: true,
                text: 'Value',
              },
            },
          },
        }}
      />
    </div>
  );
};

export default LineGraph;


