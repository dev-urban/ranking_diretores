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
          <div className="flex items-end justify-center gap-3 md:gap-6 min-h-[500px] md:min-h-[600px] relative overflow-x-auto px-4">
            {ranking.map((director, index) => {
              const podiumHeight = director.posicao === 1 ? 'h-80 md:h-96' :
                                  director.posicao === 2 ? 'h-64 md:h-80' :
                                  director.posicao === 3 ? 'h-48 md:h-64' : 'h-32 md:h-48';

              const podiumOrder = director.posicao === 1 ? 'order-2' :
                                 director.posicao === 2 ? 'order-1' :
                                 director.posicao === 3 ? 'order-3' :
                                 'order-4';

              return (
                <div key={director.id} className={`flex flex-col items-center ${podiumOrder}`}>
                  {/* Pódio Base */}
                  <div className={`w-48 md:w-64 lg:w-72 ${podiumHeight} ${
                    director.posicao === 1
                      ? 'bg-gradient-to-t from-orange-600/40 to-orange-400/20 border-orange-500/50'
                      : director.posicao === 2
                      ? 'bg-gradient-to-t from-slate-500/40 to-slate-300/20 border-slate-400/50'
                      : director.posicao === 3
                      ? 'bg-gradient-to-t from-amber-700/40 to-amber-500/20 border-amber-600/50'
                      : 'bg-gradient-to-t from-slate-700/40 to-slate-500/20 border-slate-600/50'
                  } backdrop-blur-xl border-2 rounded-t-3xl flex flex-col justify-between p-4 relative transition-all duration-500 hover:scale-105`}
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animation: 'podiumRise 0.8s ease-out forwards'
                  }}>

                    {/* Card do Diretor no topo do pódio */}
                    <div className="bg-white/90 backdrop-blur-sm border border-white/30 rounded-2xl p-4 mb-4 shadow-lg">
                      <div className="text-center">
                        {/* Posição e Emoji */}
                        <div className="flex items-center justify-center gap-2 mb-3">
                          <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center border-2 border-gray-200 shadow-md">
                            <span className="text-xl font-bold text-gray-800">
                              #{director.posicao}
                            </span>
                          </div>
                          <span className="text-3xl">
                            {getPositionEmoji(director.posicao)}
                          </span>
                        </div>

                        {/* Nome */}
                        <h3 className="text-lg font-bold text-gray-800 mb-2">
                          Plataforma {director.username}
                        </h3>

                        {/* Pontuação Total */}
                        <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl px-4 py-2 mb-3 shadow-md">
                          <div className="text-2xl font-bold text-white">
                            {director.pontuacaoTotal}
                          </div>
                          <div className="text-xs text-orange-100">pontos</div>
                        </div>
                      </div>
                    </div>

                    {/* Métricas no corpo do pódio - lado a lado */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center shadow-md">
                        <div className="text-sm font-bold text-gray-800">{director.agendamentos}</div>
                        <div className="text-xs text-gray-600 mb-1">Agendamentos</div>
                        <div className="text-xs text-orange-600 bg-orange-100 rounded-full px-1 py-0.5">
                          {director.detalhePontos.pontosAgendamentos}pts
                        </div>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center shadow-md">
                        <div className="text-sm font-bold text-gray-800">{director.visitasRealizadas}</div>
                        <div className="text-xs text-gray-600 mb-1">Visitas</div>
                        <div className="text-xs text-orange-600 bg-orange-100 rounded-full px-1 py-0.5">
                          {director.detalhePontos.pontosVisitas}pts
                        </div>
                      </div>

                      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-2 text-center shadow-md">
                        <div className="text-sm font-bold text-gray-800">{director.contratosAssinados}</div>
                        <div className="text-xs text-gray-600 mb-1">Contratos</div>
                        <div className="text-xs text-orange-600 bg-orange-100 rounded-full px-1 py-0.5">
                          {director.detalhePontos.pontosContratos}pts
                        </div>
                      </div>
                    </div>

                    {/* Número da posição na base */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-6xl font-bold opacity-20">
                      {director.posicao}
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