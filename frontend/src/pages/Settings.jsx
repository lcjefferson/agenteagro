import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Settings = () => {
  const [instructions, setInstructions] = useState(`Você é o AgenteAgro, um assistente especialista em agricultura e pecuária.
Sua missão é ajudar produtores a identificar pragas, doenças e encontrar profissionais.
Sempre responda de forma clara e objetiva.`);
  
  const [whatsappConfig, setWhatsappConfig] = useState({
    numberId: '',
    accessToken: '',
    verifyToken: 'agenteagro_token'
  });

  const [openaiApiToken, setOpenaiApiToken] = useState('');
  
  const [webhookUrl, setWebhookUrl] = useState('');
  
  const [knowledgeSources, setKnowledgeSources] = useState([
    'EMBRAPA', 'MAPA', 'SciELO', 'PlantVillage'
  ]);
  const [newSource, setNewSource] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugUrl, setDebugUrl] = useState('');

  useEffect(() => {
    // Determine Webhook URL based on current host as fallback
    let backendBase = api.defaults.baseURL;
    setDebugUrl(backendBase); // For debugging purposes
    
    if (backendBase) {
      // Remove trailing slash if present
      if (backendBase.endsWith('/')) {
        backendBase = backendBase.slice(0, -1);
      }
      // Remove /api/v1 suffix to get the root
      backendBase = backendBase.replace('/api/v1', '');
      
      setWebhookUrl(`${backendBase}/api/v1/whatsapp/webhook`);
    } else {
        // Fallback for development if VITE_API_URL is missing
        setWebhookUrl('http://localhost:8000/api/v1/whatsapp/webhook');
    }

    // Fetch existing configs
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/config/');
      const configs = response.data;
      const newConfig = { ...whatsappConfig };
      
      configs.forEach(cfg => {
        if (cfg.key === 'whatsapp_number_id') newConfig.numberId = cfg.value;
        if (cfg.key === 'whatsapp_access_token') newConfig.accessToken = cfg.value;
        if (cfg.key === 'whatsapp_verify_token') newConfig.verifyToken = cfg.value;
        if (cfg.key === 'openai_api_key') setOpenaiApiToken(cfg.value);
        if (cfg.key === 'system_prompt') setInstructions(cfg.value);
        if (cfg.key === 'webhook_url') setWebhookUrl(cfg.value);
        if (cfg.key === 'knowledge_sources') {
          try {
            setKnowledgeSources(JSON.parse(cfg.value));
          } catch (e) {
            console.error("Error parsing knowledge sources", e);
          }
        }
      });
      
      setWhatsappConfig(newConfig);
    } catch (error) {
      console.error("Error fetching configs", error);
      setError('Erro ao carregar configurações. Verifique a conexão com o backend.');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (key, value) => {
    try {
      await api.put(`/config/${key}`, { value });
      return true;
    } catch (error) {
      console.error(`Error saving ${key}`, error);
      return false;
    }
  };

  const handleSaveAll = async () => {
    setLoading(true);
    try {
      const results = await Promise.all([
        saveConfig('system_prompt', instructions),
        saveConfig('whatsapp_number_id', whatsappConfig.numberId),
        saveConfig('whatsapp_access_token', whatsappConfig.accessToken),
        saveConfig('whatsapp_verify_token', whatsappConfig.verifyToken),
        saveConfig('openai_api_key', openaiApiToken),
        saveConfig('knowledge_sources', JSON.stringify(knowledgeSources))
      ]);

      if (results.every(r => r)) {
        alert('Configurações salvas com sucesso!');
      } else {
        alert('Algumas configurações não puderam ser salvas. Verifique o console.');
      }
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const addSource = () => {
    if (newSource && !knowledgeSources.includes(newSource)) {
      setKnowledgeSources([...knowledgeSources, newSource]);
      setNewSource('');
    }
  };

  const removeSource = (source) => {
    setKnowledgeSources(knowledgeSources.filter(s => s !== source));
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      
      {/* WhatsApp Configuration */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-green-600">📱</span> Configuração WhatsApp (Meta/UazApi)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Webhook URL Display */}
           <div className="bg-blue-50 p-4 rounded-md border border-blue-200 md:col-span-2">
            <label className="block text-sm font-medium text-blue-700 mb-1">Seu Webhook URL</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white p-2 rounded border border-blue-200 text-sm font-mono text-gray-700">
                {webhookUrl}
              </code>
              <button 
                onClick={() => navigator.clipboard.writeText(webhookUrl)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Copiar
              </button>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Insira esta URL no painel de desenvolvedor do Facebook (Meta) ou na configuração do UazApi.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number ID</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Ex: 10593..."
              value={whatsappConfig.numberId}
              onChange={(e) => setWhatsappConfig({...whatsappConfig, numberId: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access Token (Permanente ou Temporário)</label>
            <input
              type="password"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="EAAG..."
              value={whatsappConfig.accessToken}
              onChange={(e) => setWhatsappConfig({...whatsappConfig, accessToken: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verify Token</label>
            <input
              type="text"
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="agenteagro_token"
              value={whatsappConfig.verifyToken}
              onChange={(e) => setWhatsappConfig({...whatsappConfig, verifyToken: e.target.value})}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use este mesmo token ao verificar o webhook no painel da Meta.
            </p>
          </div>
        </div>
      </div>

      {/* AI Prompt Configuration */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">🧠 Configuração do Agente (IA)</h2>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">OpenAI API Token</label>
          <input
            type="password"
            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
            placeholder="sk-..."
            value={openaiApiToken}
            onChange={(e) => setOpenaiApiToken(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Chave de API da OpenAI (GPT-4/3.5) para processamento de linguagem natural.
          </p>
        </div>

        <label className="block text-sm font-medium text-gray-700 mb-2">System Prompt (Instruções Base)</label>
        <p className="text-sm text-gray-500 mb-2">Edite as instruções base para a IA.</p>
        <textarea
          className="w-full h-40 p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>

      {/* Knowledge Sources Configuration */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">📚 Fontes de Conhecimento</h2>
        <div className="space-y-2">
          {knowledgeSources.map((source) => (
            <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-100">
              <span className="text-gray-700">{source}</span>
              <button 
                onClick={() => removeSource(source)}
                className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-50"
              >
                Remover
              </button>
            </div>
          ))}
          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Adicionar nova fonte (ex: Site, Link, Nome)"
              className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSource()}
            />
            <button 
              onClick={addSource}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Save Button & Feedback */}
      <div className="flex flex-col items-end gap-2 sticky bottom-6 bg-gray-50 p-4 rounded-t-lg md:bg-transparent md:p-0">
        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm mb-2 w-full md:w-auto" role="alert">
                <strong className="font-bold">Erro: </strong>
                <span className="block sm:inline">{error}</span>
            </div>
        )}
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className={`bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg font-medium flex items-center justify-center gap-2 w-full md:w-auto ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading && (
             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
          )}
          {loading ? 'Salvando...' : 'Salvar Todas as Configurações'}
        </button>
      </div>

      <div className="text-center text-xs text-gray-400 pb-10 mt-8">
        <p>Debug Info:</p>
        <p>API: {debugUrl || 'Detecting...'}</p>
        <p>Mode: {import.meta.env.VITE_API_URL ? 'Production (Env)' : 'Development (Fallback)'}</p>
      </div>
    </div>
  );
};

export default Settings;
// Force redeploy Sun Jan 11 19:32:58 -03 2026
