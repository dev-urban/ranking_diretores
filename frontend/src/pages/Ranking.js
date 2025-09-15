import React, { useState, useEffect, useCallback } from 'react';
import { rankingService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

function Ranking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const loadRanking = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await rankingService.getRanking();
      setRanking(response.data);
      setLastUpdate(new Date());
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

  const getPositionClass = (position) => {
    switch (position) {
      case 1: return 'first-place';
      case 2: return 'second-place';
      case 3: return 'third-place';
      default: return '';
    }
  };

  if (loading && ranking.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">🏆 Ranking de Diretores</h1>
          </div>
          <div className="text-center text-white">Carregando ranking...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏆 Ranking de Diretores</h1>
          {lastUpdate && (
            <div className="text-sm text-slate-300">
              Última atualização: {lastUpdate.toLocaleTimeString()}
            </div>
          )}
        </div>

        {error && (
          <Card className="mb-6 border-red-500/20 bg-red-950/50">
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
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="text-center text-slate-300">
                Nenhum diretor encontrado no ranking.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {ranking.map((director) => (
              <Card
                key={director.id}
                className={`border-slate-700 ${
                  director.posicao === 1
                    ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 border-orange-500/50'
                    : director.posicao === 2
                    ? 'bg-gradient-to-r from-slate-400/20 to-slate-500/20 border-slate-400/50'
                    : director.posicao === 3
                    ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/20 border-amber-600/50'
                    : 'bg-slate-800/50'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-white">
                        #{director.posicao}
                      </span>
                      <span className="text-2xl">
                        {getPositionEmoji(director.posicao)}
                      </span>
                      <div>
                        <CardTitle className="text-xl text-white">
                          Plataforma {director.username}
                        </CardTitle>
                        <p className="text-sm text-slate-400">{director.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {director.pontuacaoTotal}
                      </div>
                      <div className="text-sm text-slate-400">pts</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">
                        {director.agendamentos}
                      </div>
                      <div className="text-sm text-slate-400">Agendamentos</div>
                      <div className="text-xs text-slate-500">
                        ({director.detalhePontos.pontosAgendamentos}pts)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">
                        {director.visitasRealizadas}
                      </div>
                      <div className="text-sm text-slate-400">Visitas</div>
                      <div className="text-xs text-slate-500">
                        ({director.detalhePontos.pontosVisitas}pts)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white">
                        {director.contratosAssinados}
                      </div>
                      <div className="text-sm text-slate-400">Contratos</div>
                      <div className="text-xs text-slate-500">
                        ({director.detalhePontos.pontosContratos}pts)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <p className="text-sm text-slate-400">
            📱 Esta página atualiza automaticamente a cada 30 segundos
          </p>
        </div>
      </div>
    </div>
  );
}

export default Ranking;