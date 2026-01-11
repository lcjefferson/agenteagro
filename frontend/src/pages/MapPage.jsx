import React, { useState, useEffect } from 'react';
import MapComponent from '../components/MapComponent';
import { professionalsService } from '../services/api';

const MapPage = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const response = await professionalsService.getAll();
      setProfessionals(response.data);
    } catch (error) {
      console.error("Error fetching professionals for map", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      <h1 className="text-2xl font-bold text-gray-800">Mapa de Profissionais</h1>
      
      <div className="flex-1 bg-white rounded-lg shadow-md overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <p className="text-gray-500">Carregando mapa...</p>
          </div>
        ) : (
          <MapComponent professionals={professionals} />
        )}
      </div>
    </div>
  );
};

export default MapPage;
