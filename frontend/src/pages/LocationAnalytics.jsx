import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { MapPin, AlertTriangle } from 'lucide-react';
import { analyticsService } from '../services/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ff5722', '#795548'];

const LocationAnalytics = () => {
  const [stateRanking, setStateRanking] = useState([]);
  const [problemRanking, setProblemRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statesRes, problemsRes] = await Promise.all([
        analyticsService.getStates(),
        analyticsService.getProblemsByRegion()
      ]);
      setStateRanking(statesRes.data);
      setProblemRanking(problemsRes.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics", error);
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <MapPin className="text-green-600" />
        Análise Regional
      </h1>

      {/* State Ranking */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Ranking de Estados (Volume de Contatos)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stateRanking} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="state" type="category" width={50} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Conversas" fill="#8884d8">
                {stateRanking.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Problems by Region */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
          <AlertTriangle className="text-orange-500" />
          Principais Problemas por Região
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {problemRanking.map((region) => (
            <div key={region.state} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-bold text-lg text-gray-800 mb-2 border-b pb-2 flex justify-between">
                {region.state}
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Total: {region.problems.reduce((acc, curr) => acc + curr.count, 0)}
                </span>
              </h3>
              <ul className="space-y-2">
                {region.problems.map((prob, idx) => (
                  <li key={idx} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">{prob.problem}</span>
                    <span className="font-medium text-gray-900 bg-white px-2 py-0.5 rounded border">
                      {prob.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LocationAnalytics;
