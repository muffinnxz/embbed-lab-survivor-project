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
import styles from './LineGraph.module.css';  

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
  const [stats, setStats] = useState<any>({});

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

        const calculateStats = (data: any[]) => {
          const values = data.map(d => d.y);
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = (sum / values.length).toFixed(2);
          const min = Math.min(...values);
          const max = Math.max(...values);
          return { avg, min, max };
        };

        const sensor1Stats = calculateStats(sensor1Data);
        const sensor2Stats = calculateStats(sensor2Data);

        setStats({
          sensor1: sensor1Stats,
          sensor2: sensor2Stats,
        });

        setData({
          datasets: [
            {
              label: 'Soil Moisture Sensor',
              data: sensor1Data,
              borderColor: 'red',
              backgroundColor: 'rgba(255, 0, 0, 0.5)',
              borderWidth: 2,
              tension: 0.1,
            },
            {
              label: 'Sound Sensor',
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
    <div className={styles.container}>
      <div className={styles.statsContainer}>
        <h2 className={styles.title}>Statistics</h2>
        <div className={styles.sensorStats}>
          <h3 className={styles.subtitle}>Soil Moisture Sensor</h3>
          <p>Average: {stats.sensor1?.avg}</p>
          <p>Min: {stats.sensor1?.min}</p>
          <p>Max: {stats.sensor1?.max}</p>
        </div>
        <div className={styles.sensorStats}>
          <h3 className={styles.subtitle}>Sound Sensor</h3>
          <p>Average: {stats.sensor2?.avg}</p>
          <p>Min: {stats.sensor2?.min}</p>
          <p>Max: {stats.sensor2?.max}</p>
        </div>
      </div>
      <div className={styles.chartContainer}>
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
    </div>
  );
};

export default LineGraph;





