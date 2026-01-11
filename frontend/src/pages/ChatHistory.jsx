import React, { useState, useEffect } from 'react';
import { X, MessageSquare, User, Bot } from 'lucide-react';
import { chatService } from '../services/api';

const ChatHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchConversations();
  }, [page]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      const response = await chatService.getConversations({ skip, limit });
      
      const items = response.data.items || response.data;
      const totalCount = response.data.total || items.length;

      // Map API response to component state
      const mappedConversations = items.map(c => ({
        id: c.id,
        user: c.whatsapp_id,
        lastMessage: c.problem_category ? `Categoria: ${c.problem_category}` : 'Sem categoria',
        date: new Date(c.updated_at || c.created_at).toLocaleString(),
        status: c.problem_category ? 'Identificado' : 'Pendente',
        location: c.location_state,
        raw: c
      }));
      setConversations(mappedConversations);
      setTotal(totalCount);
    } catch (error) {
      console.error("Error fetching conversations", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChat = async (chat) => {
    setSelectedChat({ ...chat, messages: [] });
    setLoadingMessages(true);
    try {
      const response = await chatService.getMessages(chat.id);
      setSelectedChat(prev => ({
        ...prev,
        messages: response.data.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          time: new Date(m.created_at).toLocaleTimeString(),
          media_url: m.media_url
        }))
      }));
    } catch (error) {
      console.error("Error fetching messages", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading && conversations.length === 0) {
    return <div className="p-8 text-center text-gray-500">Carregando histórico...</div>;
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Info</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {conversations.map((chat) => (
              <tr key={chat.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{chat.user}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {chat.location && <span className="mr-2 font-bold">[{chat.location}]</span>}
                  {chat.lastMessage}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{chat.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${chat.status === 'Identificado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {chat.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => handleSelectChat(chat)}
                    className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                  >
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {conversations.map((chat) => (
          <div key={chat.id} className="bg-white p-4 rounded-lg shadow-md space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{chat.user}</h3>
                <p className="text-xs text-gray-500">{chat.date}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                ${chat.status === 'Identificado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {chat.status}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {chat.location && <span className="font-bold">[{chat.location}] </span>}
              {chat.lastMessage}
            </p>
            <button 
              onClick={() => handleSelectChat(chat)}
              className="w-full mt-2 bg-indigo-50 text-indigo-600 py-2 rounded-md text-sm font-medium hover:bg-indigo-100 transition-colors"
            >
              Ver Conversa
            </button>
          </div>
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg shadow-md">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Anterior
          </button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Próxima
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">{(page - 1) * limit + 1}</span> a <span className="font-medium">{Math.min(page * limit, total)}</span> de <span className="font-medium">{total}</span> resultados
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">Anterior</span>
                <span className="h-5 w-5 flex items-center justify-center">&lt;</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                 <button
                   key={p}
                   onClick={() => setPage(p)}
                   aria-current={page === p ? 'page' : undefined}
                   className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                     page === p 
                       ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600' 
                       : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                   }`}
                 >
                   {p}
                 </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${page === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="sr-only">Próxima</span>
                <span className="h-5 w-5 flex items-center justify-center">&gt;</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Chat Modal/Overlay */}
      {selectedChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
              <div>
                <h3 className="font-semibold text-gray-800">{selectedChat.user}</h3>
                <p className="text-sm text-gray-500">{selectedChat.date}</p>
              </div>
              <button 
                onClick={() => setSelectedChat(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {loadingMessages ? (
                <div className="text-center py-10 text-gray-500">Carregando mensagens...</div>
              ) : selectedChat.messages && selectedChat.messages.length > 0 ? (
                selectedChat.messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      msg.role === 'user' 
                        ? 'bg-green-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        <span className="text-xs opacity-75 capitalize">{msg.role}</span>
                        <span className="text-xs opacity-75 ml-auto">{msg.time}</span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.media_url && (
                         <div className="mt-2">
                           <img src={msg.media_url} alt="Mídia enviada" className="max-w-full rounded-md border border-gray-200" />
                         </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500">Nenhuma mensagem encontrada.</div>
              )}
            </div>

            {/* Input Area (Read Only for now) */}
            <div className="p-4 border-t bg-white rounded-b-lg">
              <div className="flex items-center gap-2 text-gray-400 text-sm italic">
                <MessageSquare size={16} />
                Histórico de conversa (apenas leitura)
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatHistory;
