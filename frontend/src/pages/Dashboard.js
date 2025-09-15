import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, metricsService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

function Dashboard() {
  const [metrics, setMetrics] = useState({
    agendamentos: 0,
    visitasRealizadas: 0,
    contratosAssinados: 0
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadMetrics();
  }, [navigate]);

  const loadMetrics = async () => {
    try {
      const response = await metricsService.getMetrics();
      setMetrics({
        agendamentos: response.data.agendamentos || 0,
        visitasRealizadas: response.data.visitasRealizadas || 0,
        contratosAssinados: response.data.contratosAssinados || 0
      });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    }
  };

  const handleChange = (field, value) => {
    setMetrics(prev => ({
      ...prev,
      [field]: Math.max(0, parseInt(value) || 0)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await metricsService.updateMetrics(metrics);
      setMessage('Métricas atualizadas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erro ao atualizar métricas');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = () => {
    const pontosAgendamentos = metrics.agendamentos * 5;
    const pontosVisitas = metrics.visitasRealizadas * 20;
    const pontosContratos = metrics.contratosAssinados * 50;
    const total = pontosAgendamentos + pontosVisitas + pontosContratos;

    return {
      pontosAgendamentos,
      pontosVisitas,
      pontosContratos,
      total
    };
  };

  const points = calculatePoints();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Painel de Métricas</h1>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">Olá, {user?.username}</span>
            <Button
              onClick={authService.logout}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Sair
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl text-white">Atualizar Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Agendamentos (5 pontos cada)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={metrics.agendamentos}
                        onChange={(e) => handleChange('agendamentos', e.target.value)}
                        min="0"
                        disabled={loading}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <span className="text-sm text-orange-400 font-medium min-w-[80px]">
                        {points.pontosAgendamentos} pontos
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Visitas Realizadas (20 pontos cada)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={metrics.visitasRealizadas}
                        onChange={(e) => handleChange('visitasRealizadas', e.target.value)}
                        min="0"
                        disabled={loading}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <span className="text-sm text-orange-400 font-medium min-w-[80px]">
                        {points.pontosVisitas} pontos
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">
                      Contratos Assinados (50 pontos cada)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={metrics.contratosAssinados}
                        onChange={(e) => handleChange('contratosAssinados', e.target.value)}
                        min="0"
                        disabled={loading}
                        className="bg-slate-700/50 border-slate-600 text-white"
                      />
                      <span className="text-sm text-orange-400 font-medium min-w-[80px]">
                        {points.pontosContratos} pontos
                      </span>
                    </div>
                  </div>
                </div>

                <Card className="border-orange-500/30 bg-orange-950/30">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-xl font-bold text-orange-400">
                        Total de Pontos: {points.total}
                      </h3>
                    </div>
                  </CardContent>
                </Card>

                {message && (
                  <div className={`text-sm p-3 rounded-md border ${
                    message.includes('sucesso')
                      ? 'text-green-400 bg-green-950/50 border-green-500/20'
                      : 'text-red-400 bg-red-950/50 border-red-500/20'
                  }`}>
                    {message}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                >
                  {loading ? 'Salvando...' : 'Salvar Métricas'}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <Button
                  asChild
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <a href="/ranking" target="_blank" rel="noopener noreferrer">
                    Ver Ranking Público
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;