import React, { useState, useEffect } from 'react';
import { Plus, Search, MapPin, Phone, Mail, User, Briefcase, Trash2 } from 'lucide-react';
import { professionalsService } from '../services/api';

const Professionals = () => {
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Filter states
  const [filterState, setFilterState] = useState('');
  const [filterType, setFilterType] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    type: 'Veterinário',
    state: '',
    city: '',
    phone: '',
    email: '',
    specialties: ''
  });

  const professionalTypes = ['Veterinário', 'Agrônomo', 'Zootecnista', 'Técnico Agrícola', 'Agricultor', 'Fornecedor'];
  const brazilianStates = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

  useEffect(() => {
    fetchProfessionals();
  }, [filterState, filterType]);

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterState) params.state = filterState;
      if (filterType) params.type = filterType;
      
      const response = await professionalsService.getAll(params);
      setProfessionals(response.data);
    } catch (error) {
      console.error("Error fetching professionals", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await professionalsService.create(formData);
      setShowForm(false);
      setFormData({
        name: '',
        type: 'Veterinário',
        state: '',
        city: '',
        phone: '',
        email: '',
        specialties: ''
      });
      fetchProfessionals();
      alert('Profissional cadastrado com sucesso!');
    } catch (error) {
      console.error("Error creating professional", error);
      alert('Erro ao cadastrar profissional.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este profissional?')) {
      try {
        await professionalsService.delete(id);
        fetchProfessionals();
      } catch (error) {
        console.error("Error deleting professional", error);
      }
    }
  };


  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Briefcase className="text-green-600" />
          Profissionais
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors w-full md:w-auto justify-center"
        >
          <Plus size={20} />
          {showForm ? 'Cancelar Cadastro' : 'Novo Profissional'}
        </button>
      </div>

      {/* Registration Form */}
      {showForm && (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md animate-fade-in-down">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Cadastrar Novo Profissional</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                name="name"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Profissional</label>
              <select
                name="type"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={formData.type}
                onChange={handleInputChange}
              >
                {professionalTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado (UF)</label>
              <select
                name="state"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={formData.state}
                onChange={handleInputChange}
              >
                <option value="">Selecione...</option>
                {brazilianStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
              <input
                type="text"
                name="city"
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={formData.city}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="text"
                name="phone"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Especialidades (Opcional)</label>
              <textarea
                name="specialties"
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                value={formData.specialties}
                onChange={handleInputChange}
                placeholder="Ex: Cirurgia, Nutrição, Soja, Milho..."
                rows="2"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium w-full md:w-auto"
              >
                Salvar Cadastro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 w-full md:w-auto text-gray-500">
          <Search size={20} />
          <span className="font-medium">Filtrar:</span>
        </div>
        <select
          className="p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none w-full md:w-auto"
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
        >
          <option value="">Todos os Estados</option>
          {brazilianStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        <select
          className="p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none w-full md:w-auto"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">Todos os Tipos</option>
          {professionalTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <p className="col-span-full text-center text-gray-500 py-8">Carregando profissionais...</p>
        ) : professionals.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <User size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Nenhum profissional encontrado.</p>
          </div>
        ) : (
          professionals.map((prof) => (
            <div key={prof.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-100 relative group">
              <button 
                onClick={() => handleDelete(prof.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remover"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-full text-green-700">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">{prof.name}</h3>
                  <span className="inline-block bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full font-medium border border-green-100">
                    {prof.type}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span>{prof.city} - {prof.state}</span>
                </div>
                {prof.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span>{prof.phone}</span>
                  </div>
                )}
                {prof.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span>{prof.email}</span>
                  </div>
                )}
                {prof.specialties && (
                  <div className="pt-2 border-t mt-3">
                    <p className="text-xs text-gray-500 mb-1 font-medium">Especialidades:</p>
                    <p className="text-gray-700">{prof.specialties}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Professionals;
