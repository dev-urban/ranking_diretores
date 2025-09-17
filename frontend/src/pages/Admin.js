import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Settings, Calendar, Building2, FileText, Save, User, LogOut } from 'lucide-react';

function Admin() {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [message, setMessage] = useState('');
  const [editingValues, setEditingValues] = useState({});
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Verificar se é admin
    if (user?.email !== 'gabriela.copetti@urban.imb.br') {
      navigate('/dashboard');
      return;
    }

    loadDirectors();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDirectors = async () => {
    try {
      setLoading(true);
      console.log('Iniciando busca de diretores...');
      console.log('Token:', authService.getToken());

      const response = await fetch('/api/admin/directors', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Erro na resposta:', errorData);
        throw new Error(`Erro ao carregar diretores: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      console.log('Diretores:', data.directors);
      console.log('Quantidade de diretores:', data.directors?.length);

      if (data.directors && data.directors.length > 0) {
        setDirectors(data.directors);
        console.log('State directors atualizado com:', data.directors);

        // Inicializar valores de edição com os valores atuais
        const initialEditingValues = {};
        data.directors.forEach(director => {
          initialEditingValues[director.id] = {
            agendamentos: director.metrics.agendamentos.toString(),
            visitasRealizadas: director.metrics.visitasRealizadas.toString(),
            contratosAssinados: director.metrics.contratosAssinados.toString()
          };
        });
        setEditingValues(initialEditingValues);
      } else {
        console.warn('Nenhum diretor retornado da API');
        setDirectors([]);
        setEditingValues({});
      }
    } catch (error) {
      console.error('Erro ao carregar diretores:', error);
      setMessage('Erro ao carregar diretores');
    } finally {
      setLoading(false);
    }
  };

  const handleMetricChange = (directorId, field, value) => {
    // Atualizar apenas o estado de edição, não o estado principal
    setEditingValues(prev => ({
      ...prev,
      [directorId]: {
        ...prev[directorId],
        [field]: value
      }
    }));
  };

  const getDisplayValue = (directorId, field) => {
    // Usar valor de edição se existir, senão usar valor original
    return editingValues[directorId]?.[field] ?? '';
  };

  const saveMetrics = async (directorId) => {
    try {
      setSaving(prev => ({ ...prev, [directorId]: true }));
      setMessage('');

      const director = directors.find(d => d.id === directorId);
      const editingData = editingValues[directorId];

      const metrics = {
        agendamentos: editingData?.agendamentos === '' ? 0 : parseInt(editingData?.agendamentos, 10) || 0,
        visitasRealizadas: editingData?.visitasRealizadas === '' ? 0 : parseInt(editingData?.visitasRealizadas, 10) || 0,
        contratosAssinados: editingData?.contratosAssinados === '' ? 0 : parseInt(editingData?.contratosAssinados, 10) || 0
      };

      const response = await fetch(`/api/admin/directors/${directorId}/metrics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify(metrics)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar métricas');
      }

      // Atualizar o estado principal dos diretores
      setDirectors(prev => prev.map(d =>
        d.id === directorId
          ? { ...d, metrics: { ...d.metrics, ...metrics } }
          : d
      ));

      // Atualizar valores de edição para refletir os valores salvos
      setEditingValues(prev => ({
        ...prev,
        [directorId]: {
          agendamentos: metrics.agendamentos.toString(),
          visitasRealizadas: metrics.visitasRealizadas.toString(),
          contratosAssinados: metrics.contratosAssinados.toString()
        }
      }));

      setMessage(`Métricas de ${director.username} atualizadas com sucesso!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar métricas:', error);
      setMessage('Erro ao salvar métricas');
    } finally {
      setSaving(prev => ({ ...prev, [directorId]: false }));
    }
  };

  const calculatePoints = (directorId) => {
    const editingData = editingValues[directorId];
    if (!editingData) return { pontosAgendamentos: 0, pontosVisitas: 0, pontosContratos: 0, total: 0 };

    const agendamentos = editingData.agendamentos === '' ? 0 : parseInt(editingData.agendamentos, 10) || 0;
    const visitas = editingData.visitasRealizadas === '' ? 0 : parseInt(editingData.visitasRealizadas, 10) || 0;
    const contratos = editingData.contratosAssinados === '' ? 0 : parseInt(editingData.contratosAssinados, 10) || 0;

    const pontosAgendamentos = agendamentos * 5;
    const pontosVisitas = visitas * 20;
    const pontosContratos = contratos * 50;
    const total = pontosAgendamentos + pontosVisitas + pontosContratos;

    return { pontosAgendamentos, pontosVisitas, pontosContratos, total };
  };

  console.log('Estado atual - loading:', loading);
  console.log('Estado atual - directors:', directors);
  console.log('Estado atual - directors.length:', directors.length);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Painel Administrativo
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie as métricas dos diretores no ranking
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Olá, {user?.username}</span>
            <Button
              onClick={authService.logout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {message && (
          <div className={`mb-6 text-sm p-3 rounded-md border animate-in slide-in-from-bottom-1 duration-200 ${
            message.includes('sucesso')
              ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
              : 'text-destructive bg-destructive/10 border-destructive/20'
          }`}>
            {message}
          </div>
        )}

        <div className="grid gap-6">
          {console.log('Renderizando directors:', directors)}
          {directors && directors.length > 0 ? (
            directors.map((director) => {
              const points = calculatePoints(director.id);
              const isSaving = saving[director.id];
              console.log('Renderizando diretor:', director);

              return (
                <Card key={`director-${director.id}`} className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground font-semibold flex items-center gap-2">
                    <User className="h-5 w-5" />
                    {director.username}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{director.email}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Agendamentos (5 pts cada)
                      </label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={getDisplayValue(director.id, 'agendamentos')}
                          onChange={(e) => handleMetricChange(director.id, 'agendamentos', e.target.value)}
                          min="0"
                          disabled={isSaving}
                          className="h-10"
                        />
                        <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 block text-center">
                          {points.pontosAgendamentos} pontos
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Visitas (20 pts cada)
                      </label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={getDisplayValue(director.id, 'visitasRealizadas')}
                          onChange={(e) => handleMetricChange(director.id, 'visitasRealizadas', e.target.value)}
                          min="0"
                          disabled={isSaving}
                          className="h-10"
                        />
                        <span className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-200 block text-center">
                          {points.pontosVisitas} pontos
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Contratos (50 pts cada)
                      </label>
                      <div className="space-y-2">
                        <Input
                          type="number"
                          value={getDisplayValue(director.id, 'contratosAssinados')}
                          onChange={(e) => handleMetricChange(director.id, 'contratosAssinados', e.target.value)}
                          min="0"
                          disabled={isSaving}
                          className="h-10"
                        />
                        <span className="text-xs text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-200 block text-center">
                          {points.pontosContratos} pontos
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-4">
                      <Card className="border-primary/20 bg-primary/5 p-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-foreground">
                            {points.total}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total de Pontos
                          </div>
                        </div>
                      </Card>

                      <Button
                        onClick={() => saveMetrics(director.id)}
                        disabled={isSaving}
                        className="w-full gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {isSaving ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
          ) : (
            <p className="text-center text-muted-foreground">Nenhum diretor para exibir</p>
          )}
        </div>

        {directors.length === 0 && (
          <Card className="border text-center p-8">
            <CardContent>
              <p className="text-muted-foreground">
                Nenhum diretor encontrado para administrar.
              </p>
            </CardContent>
          </Card>
        )}

        {directors.length > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                💡 <strong>Nota:</strong> Como administradora, você não participa do ranking.
                Esta página permite gerenciar as métricas dos 4 diretores que competem no ranking.
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default Admin;