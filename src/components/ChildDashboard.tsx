import { useState } from 'react';
import { Child, Task, Reward, Transaction } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Star, Trophy, Sparkles, CheckCircle2, Circle, Coins, Wallet, TrendingUp, ArrowUpCircle, ArrowDownCircle, Repeat } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner@2.0.3';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChildDashboardProps {
  child: Child;
  setChild: (child: Child) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  rewards: Reward[];
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  onLogout: () => void;
}

const categoryIcons: Record<string, string> = {
  higiene: '🧼',
  estudos: '📚',
  comportamento: '⭐',
  lazer: '🎈',
  tarefas: '🧹'
};

const categoryColors: Record<string, string> = {
  higiene: 'bg-blue-100 text-blue-700',
  estudos: 'bg-purple-100 text-purple-700',
  comportamento: 'bg-yellow-100 text-yellow-700',
  lazer: 'bg-pink-100 text-pink-700',
  tarefas: 'bg-green-100 text-green-700'
};

const achievements = [
  { id: '1', title: 'Primeira Tarefa', description: 'Complete sua primeira tarefa', icon: '🎯', requirement: 1 },
  { id: '2', title: 'Herói da Rotina', description: 'Complete 7 tarefas', icon: '🦸', requirement: 7 },
  { id: '3', title: 'Super Estudante', description: 'Complete 5 tarefas de estudos', icon: '🎓', requirement: 5 },
  { id: '4', title: 'Mestre da Limpeza', description: 'Complete 10 tarefas de higiene', icon: '✨', requirement: 10 },
];

export function ChildDashboard({ child, setChild, tasks, setTasks, rewards, transactions, setTransactions, onLogout }: ChildDashboardProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemDialogOpen, setRedeemDialogOpen] = useState(false);
  const [convertPointsDialogOpen, setConvertPointsDialogOpen] = useState(false);
  const [spendMoneyDialogOpen, setSpendMoneyDialogOpen] = useState(false);

  const handleCompleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    setTasks(tasks.map(t => 
      t.id === taskId 
        ? { ...t, completed: true, completedDate: new Date() }
        : t
    ));

    const newXp = child.xp + task.points;
    const newLevel = Math.floor(newXp / 100) + 1;
    const leveledUp = newLevel > child.level;

    setChild({
      ...child,
      points: child.points + task.points,
      xp: newXp,
      level: newLevel
    });

    if (leveledUp) {
      toast.success(`🎉 Parabéns! Você subiu para o nível ${newLevel}!`, {
        duration: 5000
      });
    } else {
      toast.success(`✨ +${task.points} pontos! Continue assim!`);
    }
  };

  const handleRedeemReward = () => {
    if (!selectedReward) return;

    if (child.points < selectedReward.pointsCost) {
      toast.error('Você não tem pontos suficientes!');
      return;
    }

    setChild({
      ...child,
      points: child.points - selectedReward.pointsCost
    });

    toast.success(`🎁 Recompensa resgatada: ${selectedReward.title}!`, {
      duration: 5000
    });
    setRedeemDialogOpen(false);
    setSelectedReward(null);
  };

  const handleConvertPoints = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const pointsToConvert = parseInt(formData.get('points') as string);

    if (pointsToConvert > child.points) {
      toast.error('Você não tem pontos suficientes!');
      return;
    }

    const moneyAmount = pointsToConvert / child.allowanceSettings.pointsToMoneyRate;

    setChild({
      ...child,
      points: child.points - pointsToConvert,
      allowance: child.allowance + moneyAmount
    });

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      childId: child.id,
      type: 'conversao_pontos',
      amount: moneyAmount,
      description: 'Converteu pontos em dinheiro',
      date: new Date(),
      pointsConverted: pointsToConvert
    };

    setTransactions([...transactions, newTransaction]);
    
    toast.success(`✨ ${pointsToConvert} pontos convertidos em R$ ${moneyAmount.toFixed(2)}!`);
    setConvertPointsDialogOpen(false);
  };

  const handleSpendMoney = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    if (amount > child.allowance) {
      toast.error('Você não tem saldo suficiente!');
      return;
    }

    setChild({
      ...child,
      allowance: child.allowance - amount
    });

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      childId: child.id,
      type: 'gasto',
      amount: -amount,
      description: description || 'Gasto',
      date: new Date()
    };

    setTransactions([...transactions, newTransaction]);
    
    toast.success(`💰 R$ ${amount.toFixed(2)} registrado!`);
    setSpendMoneyDialogOpen(false);
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const totalTasks = tasks.length;
  const xpProgress = (child.xp % 100);
  const todayTasks = tasks.filter(t => !t.completed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg"
                style={{ backgroundColor: child.color }}
              >
                {child.avatar}
              </div>
              <div>
                <h1 className="text-lg">Olá, {child.name}!</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    Nível {child.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {child.points} pontos
                  </span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
          
          {/* XP Bar */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Experiência</span>
              <span>{xpProgress}/100 XP</span>
            </div>
            <Progress value={xpProgress} className="h-3" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 pb-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-3">
          <Card className="bg-gradient-to-br from-yellow-400 to-orange-500 border-0 text-white">
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl">{child.points}</p>
              <p className="text-xs opacity-90">Pontos</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl">{child.level}</p>
              <p className="text-xs opacity-90">Nível</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-400 to-teal-500 border-0 text-white">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl">{completedTasks}</p>
              <p className="text-xs opacity-90">Feitas</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-400 to-cyan-500 border-0 text-white">
            <CardContent className="p-4 text-center">
              <Wallet className="w-8 h-8 mx-auto mb-2" />
              <p className="text-2xl">R$ {child.allowance.toFixed(0)}</p>
              <p className="text-xs opacity-90">Mesada</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/80">
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="money">Mesada</TabsTrigger>
            <TabsTrigger value="rewards">Loja</TabsTrigger>
            <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4 mt-4">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Suas Tarefas</CardTitle>
                    <CardDescription>
                      {todayTasks.length} tarefas para fazer hoje
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl">{completedTasks}/{totalTasks}</p>
                    <p className="text-xs text-muted-foreground">concluídas</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <Card className="bg-white/80">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">Nenhuma tarefa por enquanto!</p>
                    <p className="text-sm text-muted-foreground mt-2">Peça para seus pais adicionarem tarefas 😊</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {todayTasks.map((task) => (
                    <Card 
                      key={task.id}
                      className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {task.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-green-500" />
                            ) : (
                              <Circle className="w-6 h-6 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <p className="font-medium">{task.title}</p>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground">{task.description}</p>
                                )}
                              </div>
                              <Badge variant="secondary" className="shrink-0">
                                +{task.points} pts
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={categoryColors[task.category]}>
                                {categoryIcons[task.category]} {task.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {task.frequency}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Completed Tasks */}
                  {tasks.filter(t => t.completed).length > 0 && (
                    <>
                      <div className="pt-4">
                        <h3 className="text-sm text-white/80 mb-2">✅ Já Concluídas</h3>
                      </div>
                      {tasks.filter(t => t.completed).map((task) => (
                        <Card 
                          key={task.id}
                          className="bg-white/60 backdrop-blur-sm opacity-70"
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
                              <div className="flex-1">
                                <p className="font-medium line-through">{task.title}</p>
                                <Badge className={categoryColors[task.category] + " mt-2"}>
                                  {categoryIcons[task.category]} {task.category}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="money" className="space-y-4 mt-4">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Minha Mesada</CardTitle>
                <CardDescription>
                  Gerencie seu dinheiro!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg mb-4">
                  <Wallet className="w-12 h-12 mx-auto mb-3 text-green-600" />
                  <p className="text-sm text-muted-foreground mb-2">Saldo Disponível</p>
                  <p className="text-5xl">R$ {child.allowance.toFixed(2)}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="h-auto py-4 flex-col gap-2"
                    variant="outline"
                    onClick={() => setConvertPointsDialogOpen(true)}
                  >
                    <Repeat className="w-6 h-6" />
                    <span className="text-sm">Converter Pontos</span>
                  </Button>
                  <Button
                    className="h-auto py-4 flex-col gap-2"
                    variant="outline"
                    onClick={() => setSpendMoneyDialogOpen(true)}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-sm">Registrar Gasto</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Informações sobre conversão */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Coins className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm">💡 Você sabia?</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Você pode converter seus pontos em dinheiro! 
                      {child.allowanceSettings.pointsToMoneyRate} pontos = R$ 1,00
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Seus {child.points} pontos valem R$ {(child.points / child.allowanceSettings.pointsToMoneyRate).toFixed(2)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Histórico */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Histórico</CardTitle>
                <CardDescription>Suas últimas movimentações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      Nenhuma movimentação ainda
                    </p>
                  ) : (
                    transactions
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 10)
                      .map((transaction) => {
                        const isPositive = transaction.amount > 0;
                        
                        return (
                          <div key={transaction.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                            <div className="flex items-center gap-3">
                              {isPositive ? (
                                <ArrowUpCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <ArrowDownCircle className="w-5 h-5 text-red-500" />
                              )}
                              <div>
                                <p className="text-sm">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(transaction.date).toLocaleDateString('pt-BR')}
                                </p>
                                {transaction.pointsConverted && (
                                  <Badge variant="secondary" className="mt-1 text-xs">
                                    {transaction.pointsConverted} pontos
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className={`text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              <p className="text-sm">{isPositive ? '+' : ''}R$ {Math.abs(transaction.amount).toFixed(2)}</p>
                            </div>
                          </div>
                        );
                      })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Mini Gráfico de Economia */}
            {transactions.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Minha Economia</CardTitle>
                  <CardDescription>Como seu dinheiro está crescendo</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={transactions
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .reduce((acc, transaction) => {
                            const lastBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
                            acc.push({
                              date: new Date(transaction.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                              balance: lastBalance + transaction.amount
                            });
                            return acc;
                          }, [] as { date: string; balance: number }[])
                        }
                      >
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                        <Area type="monotone" dataKey="balance" stroke="#10b981" fillOpacity={1} fill="url(#colorBalance)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4 mt-4">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Loja de Recompensas</CardTitle>
                <CardDescription>
                  Troque seus pontos por prêmios incríveis!
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => {
                const canAfford = child.points >= reward.pointsCost;
                
                return (
                  <Card 
                    key={reward.id}
                    className={`bg-white/80 backdrop-blur-sm ${canAfford ? 'hover:shadow-lg cursor-pointer' : 'opacity-60'} transition-all`}
                    onClick={() => {
                      if (canAfford) {
                        setSelectedReward(reward);
                        setRedeemDialogOpen(true);
                      }
                    }}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="text-5xl">{reward.icon}</div>
                        <div className="flex-1">
                          <CardTitle className="text-base">{reward.title}</CardTitle>
                          <CardDescription className="text-sm mt-1">
                            {reward.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant={canAfford ? "default" : "secondary"} className="gap-1">
                          <Coins className="w-3 h-3" />
                          {reward.pointsCost} pontos
                        </Badge>
                        {!canAfford && (
                          <span className="text-xs text-muted-foreground">
                            Faltam {reward.pointsCost - child.points} pontos
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4 mt-4">
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Suas Conquistas</CardTitle>
                <CardDescription>
                  Desbloqueie medalhas especiais!
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map((achievement) => {
                const unlocked = completedTasks >= achievement.requirement;
                
                return (
                  <Card 
                    key={achievement.id}
                    className={`bg-white/80 backdrop-blur-sm ${unlocked ? 'border-yellow-400 border-2' : 'opacity-50'}`}
                  >
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className={`text-4xl ${!unlocked && 'grayscale'}`}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{achievement.title}</CardTitle>
                            {unlocked && <Badge variant="default" className="bg-yellow-500">Desbloqueada!</Badge>}
                          </div>
                          <CardDescription className="mt-1">
                            {achievement.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    {!unlocked && (
                      <CardContent>
                        <Progress value={(completedTasks / achievement.requirement) * 100} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {completedTasks}/{achievement.requirement} tarefas
                        </p>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para Converter Pontos */}
      <Dialog open={convertPointsDialogOpen} onOpenChange={setConvertPointsDialogOpen}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>Converter Pontos em Dinheiro</DialogTitle>
            <DialogDescription>
              Transforme seus pontos em mesada!
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConvertPoints} className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm text-muted-foreground">Você tem</p>
              <p className="text-3xl">{child.points} pontos</p>
              <p className="text-xs text-muted-foreground mt-2">
                Taxa: {child.allowanceSettings.pointsToMoneyRate} pontos = R$ 1,00
              </p>
            </div>
            <div>
              <Label htmlFor="points">Quantos pontos quer converter?</Label>
              <Input 
                name="points" 
                type="number" 
                min="1" 
                max={child.points}
                step={child.allowanceSettings.pointsToMoneyRate}
                placeholder={`Múltiplo de ${child.allowanceSettings.pointsToMoneyRate}`}
                required 
              />
              <p className="text-xs text-muted-foreground mt-2">
                {child.points} pontos = R$ {(child.points / child.allowanceSettings.pointsToMoneyRate).toFixed(2)}
              </p>
            </div>
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setConvertPointsDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Converter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog para Registrar Gasto */}
      <Dialog open={spendMoneyDialogOpen} onOpenChange={setSpendMoneyDialogOpen}>
        <DialogContent className="max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>Registrar um Gasto</DialogTitle>
            <DialogDescription>
              Anote onde você usou seu dinheiro
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSpendMoney} className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <Wallet className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-sm text-muted-foreground">Saldo disponível</p>
              <p className="text-3xl">R$ {child.allowance.toFixed(2)}</p>
            </div>
            <div>
              <Label htmlFor="amount">Quanto você gastou?</Label>
              <Input 
                name="amount" 
                type="number" 
                step="0.01"
                min="0.01"
                max={child.allowance}
                placeholder="0.00"
                required 
              />
            </div>
            <div>
              <Label htmlFor="description">No que você gastou?</Label>
              <Input 
                name="description" 
                placeholder="Ex: Comprei um brinquedo"
                required 
              />
            </div>
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setSpendMoneyDialogOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" className="flex-1">
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Redeem Dialog */}
      <Dialog open={redeemDialogOpen} onOpenChange={setRedeemDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Resgatar Recompensa</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja trocar seus pontos?
            </DialogDescription>
          </DialogHeader>
          {selectedReward && (
            <div className="py-4 text-center">
              <div className="text-6xl mb-4">{selectedReward.icon}</div>
              <p className="text-lg font-medium mb-2">{selectedReward.title}</p>
              <p className="text-sm text-muted-foreground mb-4">{selectedReward.description}</p>
              <Badge variant="secondary" className="gap-1">
                <Coins className="w-4 h-4" />
                {selectedReward.pointsCost} pontos
              </Badge>
              <p className="text-xs text-muted-foreground mt-4">
                Você ficará com {child.points - selectedReward.pointsCost} pontos
              </p>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setRedeemDialogOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleRedeemReward} className="flex-1">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
