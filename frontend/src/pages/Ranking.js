import React, { useState, useEffect, useCallback } from 'react';
import { rankingService } from '../services/api';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await rankingService.getRanking();
      setRanking(response.data);
    } catch (err) {
      setError('Erro ao carregar ranking');
      console.error('Erro ao carregar ranking:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRanking();

    const interval = setInterval(loadRanking, 30000);

    return () => clearInterval(interval);
  }, [loadRanking]);

  const getPositionEmoji = (position) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };


  if (loading && ranking.length === 0) {
    return (
      <div className="min-h-screen bg-black p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">🏆 Ranking de Plataforma</h1>
          </div>
          <div className="text-center text-white">Carregando ranking...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 tracking-wide">🏆 Ranking de Plataforma</h1>
        </div>

        {error && (
          <Card className="mb-6 border-red-500/30 bg-red-900/80 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="text-center text-red-200">
                {error}
                <Button
                  onClick={loadRanking}
                  variant="destructive"
                  className="mt-4"
                >
                  Tentar novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {ranking.length === 0 && !loading ? (
          <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
            <CardContent className="pt-6">
              <div className="text-center text-slate-300">
                Nenhum diretor encontrado no ranking.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex items-end justify-center gap-4 md:gap-8 min-h-[calc(100vh-200px)] relative px-8" style={{paddingLeft: '30px', paddingRight: '30px'}}>
            {ranking.map((director, index) => {
              const podiumHeight = director.posicao === 1 ? 'h-96 md:h-[420px]' :
                                  director.posicao === 2 ? 'h-80 md:h-96' :
                                  director.posicao === 3 ? 'h-72 md:h-80' : 'h-64 md:h-72';

              const podiumOrder = director.posicao === 1 ? 'order-2' :
                                 director.posicao === 2 ? 'order-1' :
                                 director.posicao === 3 ? 'order-3' :
                                 'order-4';

              return (
                <div key={director.id} className={`flex flex-col items-center ${podiumOrder} animate-in column-delay-${index}`}>
                  {/* Pódio Base */}
                  <div className={`w-56 md:w-72 lg:w-80 ${podiumHeight} ${
                    director.posicao === 1
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 border-b-4 border-emerald-500'
                      : director.posicao === 2
                      ? 'bg-gradient-to-t from-blue-600 to-blue-400 border-b-4 border-blue-500'
                      : director.posicao === 3
                      ? 'bg-gradient-to-t from-purple-600 to-purple-400 border-b-4 border-purple-500'
                      : 'bg-gradient-to-t from-gray-600 to-gray-400 border-b-4 border-gray-500'
                  } backdrop-blur-xl rounded-t-3xl flex flex-col justify-start p-4 relative transition-all duration-500 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl`}
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animation: 'podiumRise 0.8s ease-out forwards'
                  }}>

                    {/* Card do Diretor no topo do pódio */}
                    <div className={`border-l-4 ${
                      director.posicao === 1
                        ? 'border-l-emerald-500'
                        : director.posicao === 2
                        ? 'border-l-blue-500'
                        : director.posicao === 3
                        ? 'border-l-purple-500'
                        : 'border-l-gray-500'
                    } rounded-lg p-4 mb-4 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative z-10`}
                    style={{
                      backgroundColor: director.posicao === 1 ? '#FAA533' :
                                     director.posicao === 2 ? '#F0F0F0' :
                                     director.posicao === 3 ? '#B87C4C' : '#37353E'
                    }}>
                      <div className="text-center">
                        {/* Posição e Emoji */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className={`rounded-full w-12 h-12 flex items-center justify-center border-2 shadow-md ${
                            director.posicao === 1
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : director.posicao === 2
                              ? 'bg-blue-500 border-blue-600 text-white'
                              : director.posicao === 3
                              ? 'bg-purple-500 border-purple-600 text-white'
                              : 'bg-gray-500 border-gray-600 text-white'
                          }`}>
                            <span className="text-xl font-bold">
                              #{director.posicao}
                            </span>
                          </div>
                          <span className="text-3xl">
                            {getPositionEmoji(director.posicao)}
                          </span>
                        </div>

                        {/* Nome */}
                        <h3 className={`text-lg font-bold mb-2 ${
                          director.posicao === 1 ? 'text-white' :
                          director.posicao === 2 ? 'text-gray-800' :
                          director.posicao === 3 ? 'text-white' : 'text-white'
                        }`}>
                          Plataforma {director.username}
                        </h3>

                        {/* Pontuação Total */}
                        <div className="rounded-xl px-4 py-2 mb-3 shadow-md bg-black/20 border border-white/30">
                          <div className="text-2xl font-bold text-white">
                            {director.pontuacaoTotal}
                          </div>
                          <div className="text-xs text-white/80">pontos</div>
                        </div>
                      </div>
                    </div>

                    {/* Métricas no corpo do pódio - lado a lado */}
                    <div className="grid grid-cols-3 gap-3 mb-6 relative z-10">
                      <div className="bg-white border-l-4 border-l-emerald-500 rounded-lg p-3 text-center shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="text-base font-bold text-gray-800 mb-1">{director.agendamentos}</div>
                        <div className="text-xs text-gray-600 mb-2">Agendamentos</div>
                        <div className="text-xs text-emerald-700 bg-emerald-500/25 rounded-full px-2 py-1">
                          {director.detalhePontos.pontosAgendamentos}pts
                        </div>
                      </div>

                      <div className="bg-white border-l-4 border-l-blue-500 rounded-lg p-3 text-center shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="text-base font-bold text-gray-800 mb-1">{director.visitasRealizadas}</div>
                        <div className="text-xs text-gray-600 mb-2">Visitas</div>
                        <div className="text-xs text-blue-700 bg-blue-500/25 rounded-full px-2 py-1">
                          {director.detalhePontos.pontosVisitas}pts
                        </div>
                      </div>

                      <div className="bg-white border-l-4 border-l-purple-500 rounded-lg p-3 text-center shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="text-base font-bold text-gray-800 mb-1">{director.contratosAssinados}</div>
                        <div className="text-xs text-gray-600 mb-2">Contratos</div>
                        <div className="text-xs text-purple-700 bg-purple-500/25 rounded-full px-2 py-1">
                          {director.detalhePontos.pontosContratos}pts
                        </div>
                      </div>
                    </div>

                    {/* Número da posição ao fundo */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-8xl md:text-9xl font-bold opacity-10 text-white">
                        {director.posicao}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Ranking;