import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, MessageCircle, AlertTriangle } from 'lucide-react';
import { dashboardService } from '../services/api';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center gap-4">
    <div className={`p-4 rounded-full ${color} text-white`}>
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: 'Conversas Hoje', value: '0', icon: MessageCircle, color: 'bg-blue-500' },
    { title: 'Usuários Ativos', value: '0', icon: Users, color: 'bg-green-500' },
    { title: 'Alertas de Pragas', value: '0', icon: AlertTriangle, color: 'bg-red-500' },
  ]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { conversations } = await dashboardService.getStats();
      processStats(conversations);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const processStats = (conversations) => {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Calculate Stats
    const todayConversations = conversations.filter(c => c.updated_at?.startsWith(today) || c.created_at?.startsWith(today));
    const uniqueUsers = new Set(conversations.map(c => c.whatsapp_id)).size;
    const pestAlerts = conversations.filter(c => c.problem_category === 'Praga').length;

    setStats([
      { title: 'Conversas Hoje', value: todayConversations.length.toString(), icon: MessageCircle, color: 'bg-blue-500' },
      { title: 'Usuários Ativos', value: uniqueUsers.toString(), icon: Users, color: 'bg-green-500' },
      { title: 'Alertas de Pragas', value: pestAlerts.toString(), icon: AlertTriangle, color: 'bg-red-500' },
    ]);

    // 2. Calculate Chart Data (Last 7 days)
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d;
    }).reverse();

    const newChartData = last7Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const dayName = days[date.getDay()];
      
      const dayConvs = conversations.filter(c => c.created_at?.startsWith(dateStr));
      const problems = dayConvs.filter(c => c.problem_category).length;

      return {
        name: dayName,
        mensagens: dayConvs.length, // Using conversation count as proxy for messages for now
        problemas: problems
      };
    });

    setChartData(newChartData);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Volume de Mensagens e Problemas Identificados (Últimos 7 dias)</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="mensagens" fill="#8884d8" name="Conversas" />
              <Bar dataKey="problemas" fill="#82ca9d" name="Problemas Identificados" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;
