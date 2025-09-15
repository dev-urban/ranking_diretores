import React, { useState, useEffect, useCallback } from 'react';
import { rankingService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
          <div className="space-y-6">
            {ranking.map((director, index) => (
              <Card
                key={director.id}
                className={`transition-all duration-500 hover:scale-105 hover:-translate-y-2 hover:shadow-2xl transform ${
                  director.posicao === 1
                    ? 'bg-gradient-to-r from-orange-500/30 to-orange-600/30 border-orange-500/50 shadow-orange-500/20'
                    : director.posicao === 2
                    ? 'bg-gradient-to-r from-slate-400/30 to-slate-500/30 border-slate-400/50 shadow-slate-400/20'
                    : director.posicao === 3
                    ? 'bg-gradient-to-r from-amber-600/30 to-amber-700/30 border-amber-600/50 shadow-amber-600/20'
                    : 'bg-slate-900/80 border-slate-700/50'
                } backdrop-blur-xl border-2`}
                style={{
                  animationDelay: `${index * 150}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-black/60 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center border border-white/20">
                        <span className="text-3xl font-bold text-white">
                          #{director.posicao}
                        </span>
                      </div>
                      <span className="text-4xl">
                        {getPositionEmoji(director.posicao)}
                      </span>
                      <div>
                        <CardTitle className="text-2xl text-white font-bold">
                          Plataforma {director.username}
                        </CardTitle>
                      </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                      <div className="text-3xl font-bold text-white text-center">
                        {director.pontuacaoTotal}
                      </div>
                      <div className="text-sm text-slate-300 text-center">pontos</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {director.agendamentos}
                      </div>
                      <div className="text-sm text-slate-300 mb-2">Agendamentos</div>
                      <div className="text-xs text-orange-400 bg-orange-500/20 rounded-full px-2 py-1">
                        {director.detalhePontos.pontosAgendamentos}pts
                      </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {director.visitasRealizadas}
                      </div>
                      <div className="text-sm text-slate-300 mb-2">Visitas</div>
                      <div className="text-xs text-orange-400 bg-orange-500/20 rounded-full px-2 py-1">
                        {director.detalhePontos.pontosVisitas}pts
                      </div>
                    </div>
                    <div className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-white/10 text-center">
                      <div className="text-2xl font-bold text-white mb-1">
                        {director.contratosAssinados}
                      </div>
                      <div className="text-sm text-slate-300 mb-2">Contratos</div>
                      <div className="text-xs text-orange-400 bg-orange-500/20 rounded-full px-2 py-1">
                        {director.detalhePontos.pontosContratos}pts
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Ranking;