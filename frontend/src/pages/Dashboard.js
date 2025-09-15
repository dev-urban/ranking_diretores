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
    // Se o valor está vazio, mantém vazio, senão converte para número
    const numericValue = value === '' ? '' : Math.max(0, parseInt(value) || 0);
    setMetrics(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Converte valores vazios em 0 antes de enviar
      const metricsToSend = {
        agendamentos: metrics.agendamentos === '' ? 0 : parseInt(metrics.agendamentos) || 0,
        visitasRealizadas: metrics.visitasRealizadas === '' ? 0 : parseInt(metrics.visitasRealizadas) || 0,
        contratosAssinados: metrics.contratosAssinados === '' ? 0 : parseInt(metrics.contratosAssinados) || 0
      };

      await metricsService.updateMetrics(metricsToSend);
      setMessage('Métricas atualizadas com sucesso!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Erro ao atualizar métricas');
    } finally {
      setLoading(false);
    }
  };

  const calculatePoints = () => {
    const agendamentos = metrics.agendamentos === '' ? 0 : parseInt(metrics.agendamentos) || 0;
    const visitas = metrics.visitasRealizadas === '' ? 0 : parseInt(metrics.visitasRealizadas) || 0;
    const contratos = metrics.contratosAssinados === '' ? 0 : parseInt(metrics.contratosAssinados) || 0;

    const pontosAgendamentos = agendamentos * 5;
    const pontosVisitas = visitas * 20;
    const pontosContratos = contratos * 50;
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
    <div className="min-h-screen bg-black p-4">
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
          <Card className="border-white/20 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">Atualizar Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-800">
                      Agendamentos (5 pontos cada)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={metrics.agendamentos}
                        onChange={(e) => handleChange('agendamentos', e.target.value)}
                        min="0"
                        disabled={loading}
                        className="bg-white border-gray-300 text-gray-800"
                      />
                      <span className="text-sm text-orange-600 font-medium min-w-[80px] bg-orange-100 px-3 py-1 rounded-full">
                        {points.pontosAgendamentos} pontos
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-800">
                      Visitas Realizadas (20 pontos cada)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={metrics.visitasRealizadas}
                        onChange={(e) => handleChange('visitasRealizadas', e.target.value)}
                        min="0"
                        disabled={loading}
                        className="bg-white border-gray-300 text-gray-800"
                      />
                      <span className="text-sm text-orange-600 font-medium min-w-[80px] bg-orange-100 px-3 py-1 rounded-full">
                        {points.pontosVisitas} pontos
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-800">
                      Contratos Assinados (50 pontos cada)
                    </label>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        value={metrics.contratosAssinados}
                        onChange={(e) => handleChange('contratosAssinados', e.target.value)}
                        min="0"
                        disabled={loading}
                        className="bg-white border-gray-300 text-gray-800"
                      />
                      <span className="text-sm text-orange-600 font-medium min-w-[80px] bg-orange-100 px-3 py-1 rounded-full">
                        {points.pontosContratos} pontos
                      </span>
                    </div>
                  </div>
                </div>

                <Card className="border-orange-300 bg-gradient-to-r from-orange-400 to-orange-500 shadow-lg">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-white">
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

          <Card className="border-white/20 bg-white/90 backdrop-blur-sm shadow-xl">
            <CardContent className="pt-6">
              <div className="text-center">
                <Button
                  asChild
                  variant="outline"
                  className="border-gray-300 text-gray-800 hover:bg-gray-100"
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