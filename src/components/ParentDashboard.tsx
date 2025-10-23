import { useState } from 'react';
import { Child, Task, Reward, Transaction } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { LogOut, Plus, TrendingUp, Award, DollarSign, CheckCircle2, Circle, Wallet, ArrowUpCircle, ArrowDownCircle, RefreshCcw, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ParentDashboardProps {
  children: Child[];
  setChildren: (children: Child[]) => void;
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  rewards: Reward[];
  setRewards: (rewards: Reward[]) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  onLogout: () => void;
}

export function ParentDashboard({ children, setChildren, tasks, setTasks, rewards, setRewards, transactions, setTransactions, onLogout }: ParentDashboardProps) {
  const [selectedChild, setSelectedChild] = useState(children[0]?.id);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newRewardOpen, setNewRewardOpen] = useState(false);
  const [newChildOpen, setNewChildOpen] = useState(false);
  const [allowanceDialogOpen, setAllowanceDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [selectedChildForAllowance, setSelectedChildForAllowance] = useState<string | null>(null);
  const [birthdate, setBirthdate] = useState('');
  const [calculatedAge, setCalculatedAge] = useState(6);

  const handleCreateTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newTask: Task = {
      id: Date.now().toString(),
      childId: formData.get('childId') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as any,
      points: parseInt(formData.get('points') as string),
      frequency: formData.get('frequency') as any,
      completed: false
    };

    setTasks([...tasks, newTask]);
    setNewTaskOpen(false);
    toast.success('Tarefa criada com sucesso!');
  };

  const handleCreateReward = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newReward: Reward = {
      id: Date.now().toString(),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      pointsCost: parseInt(formData.get('pointsCost') as string),
      icon: formData.get('icon') as string,
      category: formData.get('category') as string
    };

    setRewards([...rewards, newReward]);
    setNewRewardOpen(false);
    toast.success('Recompensa criada com sucesso!');
  };

  const handleApproveTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, completed: true, completedDate: new Date() } : t));
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const child = children.find(c => c.id === task.childId);
      if (child) {
        const newXp = child.xp + task.points;
        const newLevel = Math.floor(newXp / 100) + 1;
        
        setChildren(children.map(c => 
          c.id === task.childId 
            ? { ...c, points: c.points + task.points, xp: newXp, level: newLevel }
            : c
        ));
      }
    }
    
    toast.success('Tarefa aprovada!');
  };

  const handleAddAllowance = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const childId = formData.get('childId') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;
    const type = formData.get('type') as 'adicao' | 'remocao';

    const finalAmount = type === 'remocao' ? -amount : amount;
    
    const child = children.find(c => c.id === childId);
    if (!child) return;

    setChildren(children.map(c => 
      c.id === childId 
        ? { ...c, allowance: Math.max(0, c.allowance + finalAmount) }
        : c
    ));

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      childId,
      type,
      amount: finalAmount,
      description: description || (type === 'adicao' ? 'Adição manual' : 'Remoção manual'),
      date: new Date()
    };

    setTransactions([...transactions, newTransaction]);
    setTransactionDialogOpen(false);
    toast.success(type === 'adicao' ? 'Saldo adicionado!' : 'Saldo removido!');
  };

  const handleUpdateAllowanceSettings = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const childId = selectedChildForAllowance;
    if (!childId) return;

    const frequency = formData.get('frequency') as 'semanal' | 'mensal';
    const amount = parseFloat(formData.get('amount') as string);
    const pointsToMoneyRate = parseFloat(formData.get('pointsToMoneyRate') as string);
    
    setChildren(children.map(c => 
      c.id === childId 
        ? { 
            ...c, 
            allowanceSettings: {
              ...c.allowanceSettings,
              frequency,
              amount,
              pointsToMoneyRate
            }
          }
        : c
    ));

    setAllowanceDialogOpen(false);
    toast.success('Configurações de mesada atualizadas!');
  };

  const handlePayAllowance = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    const amount = child.allowanceSettings.amount;
    
    setChildren(children.map(c => 
      c.id === childId 
        ? { ...c, allowance: c.allowance + amount }
        : c
    ));

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      childId,
      type: 'mesada',
      amount,
      description: `Mesada ${child.allowanceSettings.frequency}`,
      date: new Date()
    };

    setTransactions([...transactions, newTransaction]);
    toast.success(`Mesada de R$ ${amount.toFixed(2)} paga para ${child.name}!`);
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleBirthdateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setBirthdate(date);
    
    if (date) {
      const age = calculateAge(date);
      setCalculatedAge(age);
    }
  };

  const handleCreateChild = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newChild: Child = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      age: calculatedAge,
      avatar: formData.get('avatar') as string,
      color: formData.get('color') as string,
      level: 1,
      xp: 0,
      points: 0,
      allowance: 0,
      allowanceSettings: {
        frequency: formData.get('frequency') as 'semanal' | 'mensal',
        amount: parseFloat(formData.get('amount') as string),
        dayOfWeek: formData.get('frequency') === 'semanal' ? parseInt(formData.get('dayOfWeek') as string) : undefined,
        dayOfMonth: formData.get('frequency') === 'mensal' ? parseInt(formData.get('dayOfMonth') as string) : undefined,
        pointsToMoneyRate: parseFloat(formData.get('pointsToMoneyRate') as string)
      }
    };

    setChildren([...children, newChild]);
    setNewChildOpen(false);
    setBirthdate('');
    setCalculatedAge(6);
    toast.success(`${newChild.name} foi adicionado(a) à família! 🎉`);
  };

  const handleDeleteChild = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (!child) return;

    // Remove a criança
    setChildren(children.filter(c => c.id !== childId));
    
    // Remove todas as tarefas da criança
    setTasks(tasks.filter(t => t.childId !== childId));
    
    // Remove todas as transações da criança
    setTransactions(transactions.filter(t => t.childId !== childId));
    
    toast.success(`${child.name} foi removido(a) da família.`);
  };

  const childTasks = tasks.filter(t => t.childId === selectedChild);
  const completedToday = childTasks.filter(t => t.completed && t.completedDate && 
    new Date(t.completedDate).toDateString() === new Date().toDateString()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
            <div>
              <h1 className="text-lg">Painel dos Pais</h1>
              <p className="text-sm text-muted-foreground">Gerencie a família</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onLogout}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Statistics Panel */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Filhos Cadastrados</p>
                <p className="text-3xl">{children.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tarefas Completadas</p>
                <p className="text-3xl">{tasks.filter(t => t.completed).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Recompensas Criadas</p>
                <p className="text-3xl">{rewards.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-0 shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total de Pontos</p>
                <p className="text-3xl">{children.reduce((sum, child) => sum + child.points, 0)}</p>
              </div>
              <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Children Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children.map((child) => (
            <Card key={child.id} className="overflow-hidden">
              <div 
                className="h-3"
                style={{ backgroundColor: child.color }}
              />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                    style={{ backgroundColor: child.color + '20' }}
                  >
                    {child.avatar}
                  </div>
                  <div className="flex-1">
                    <CardTitle>{child.name}</CardTitle>
                    <CardDescription>{child.age} anos</CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir {child.name}? Esta ação não pode ser desfeita e irá remover todas as tarefas, transações e dados associados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteChild(child.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Nível {child.level}</span>
                    <span>{child.xp % 100}/100 XP</span>
                  </div>
                  <Progress value={(child.xp % 100)} className="h-2" />
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="text-2xl">{child.points}</p>
                    <p className="text-xs text-muted-foreground">Pontos</p>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <p className="text-2xl">R$ {child.allowance}</p>
                    <p className="text-xs text-muted-foreground">Mesada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Add Child Card */}
          <Dialog open={newChildOpen} onOpenChange={setNewChildOpen}>
            <DialogTrigger asChild>
              <Card className="overflow-hidden border-2 border-dashed hover:border-primary hover:bg-accent/50 cursor-pointer transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full min-h-[280px] gap-3">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="w-8 h-8 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">Adicionar Filho(a)</p>
                    <p className="text-sm text-muted-foreground">Cadastrar nova criança</p>
                  </div>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Filho(a)</DialogTitle>
                <DialogDescription>
                  Preencha as informações para adicionar uma nova criança à família
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateChild} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input name="name" placeholder="Ex: Maria" required />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="birthdate">Data de Nascimento</Label>
                    <Input 
                      name="birthdate" 
                      type="date" 
                      value={birthdate}
                      onChange={handleBirthdateChange}
                      max={new Date().toISOString().split('T')[0]}
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="age">Idade</Label>
                    <Input 
                      name="age" 
                      type="number" 
                      value={calculatedAge} 
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculada automaticamente
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="avatar">Avatar (Emoji)</Label>
                    <Select name="avatar" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha um emoji" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="👧">👧 Menina</SelectItem>
                        <SelectItem value="👦">👦 Menino</SelectItem>
                        <SelectItem value="👶">👶 Bebê</SelectItem>
                        <SelectItem value="🧒">🧒 Criança</SelectItem>
                        <SelectItem value="👨">👨 Menino mais velho</SelectItem>
                        <SelectItem value="👩">👩 Menina mais velha</SelectItem>
                        <SelectItem value="🦸‍♂️">🦸‍♂️ Super-herói</SelectItem>
                        <SelectItem value="🦸‍♀️">🦸‍♀️ Super-heroína</SelectItem>
                        <SelectItem value="🧙‍♂️">🧙‍♂️ Mago</SelectItem>
                        <SelectItem value="🧙‍♀️">🧙‍♀️ Bruxa</SelectItem>
                        <SelectItem value="🧚‍♂️">🧚‍♂️ Fada (M)</SelectItem>
                        <SelectItem value="🧚‍♀️">🧚‍♀️ Fada (F)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="color">Cor Favorita</Label>
                    <Select name="color" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma cor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="#FF6B9D">💗 Rosa</SelectItem>
                        <SelectItem value="#4ECDC4">💙 Azul Turquesa</SelectItem>
                        <SelectItem value="#95E1D3">💚 Verde Menta</SelectItem>
                        <SelectItem value="#F38181">❤️ Vermelho Coral</SelectItem>
                        <SelectItem value="#AA96DA">💜 Roxo</SelectItem>
                        <SelectItem value="#FCBAD3">🌸 Rosa Claro</SelectItem>
                        <SelectItem value="#A8D8EA">🔵 Azul Bebê</SelectItem>
                        <SelectItem value="#FFD93D">💛 Amarelo</SelectItem>
                        <SelectItem value="#FF8066">🧡 Laranja</SelectItem>
                        <SelectItem value="#6BCB77">🍀 Verde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="mb-3">Configurações de Mesada</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="frequency">Frequência</Label>
                      <Select name="frequency" defaultValue="semanal" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensal">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Valor da Mesada (R$)</Label>
                      <Input 
                        name="amount" 
                        type="number" 
                        step="0.01" 
                        min="0.01" 
                        defaultValue="15.00"
                        required 
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="pointsToMoneyRate">Taxa de Conversão Pontos → Dinheiro</Label>
                    <Input 
                      name="pointsToMoneyRate" 
                      type="number" 
                      min="1" 
                      defaultValue="10"
                      required 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Quantos pontos valem R$ 1,00. Exemplo: 10 = cada 10 pontos podem ser convertidos em R$ 1,00
                    </p>
                  </div>

                  <input type="hidden" name="dayOfWeek" value="0" />
                  <input type="hidden" name="dayOfMonth" value="1" />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setNewChildOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="allowance">Mesada</TabsTrigger>
            <TabsTrigger value="rewards">Recompensas</TabsTrigger>
            <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <h3>Tarefas da Família</h3>
                <p className="text-sm text-muted-foreground">
                  {tasks.filter(t => t.completed).length} de {tasks.length} concluídas
                </p>
              </div>
              <Dialog open={newTaskOpen} onOpenChange={setNewTaskOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Tarefa</DialogTitle>
                    <DialogDescription>
                      Adicione uma tarefa para seus filhos
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div>
                      <Label htmlFor="childId">Para quem?</Label>
                      <Select name="childId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a criança" />
                        </SelectTrigger>
                        <SelectContent>
                          {children.map(child => (
                            <SelectItem key={child.id} value={child.id}>
                              {child.avatar} {child.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input name="title" placeholder="Ex: Escovar os dentes" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea name="description" placeholder="Detalhes da tarefa" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Categoria</Label>
                        <Select name="category" required>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="higiene">Higiene</SelectItem>
                            <SelectItem value="estudos">Estudos</SelectItem>
                            <SelectItem value="comportamento">Comportamento</SelectItem>
                            <SelectItem value="lazer">Lazer</SelectItem>
                            <SelectItem value="tarefas">Tarefas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="points">Pontos</Label>
                        <Input name="points" type="number" min="1" defaultValue="10" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="frequency">Frequência</Label>
                      <Select name="frequency" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diaria">Diária</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="personalizada">Personalizada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Criar Tarefa</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {tasks.map((task) => {
                const child = children.find(c => c.id === task.childId);
                return (
                  <Card key={task.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <button 
                          onClick={() => !task.completed && handleApproveTask(task.id)}
                          className="mt-1"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                          )}
                        </button>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={task.completed ? 'line-through text-muted-foreground' : ''}>
                                {task.title}
                              </p>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-medium">{task.points} pts</p>
                              <p className="text-xs text-muted-foreground">{child?.avatar} {child?.name}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="allowance" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3>Controle de Mesada</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie a mesada e finanças dos seus filhos
                </p>
              </div>
              <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Transação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar/Remover Saldo</DialogTitle>
                    <DialogDescription>
                      Ajuste manualmente o saldo da criança
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddAllowance} className="space-y-4">
                    <div>
                      <Label htmlFor="childId">Para quem?</Label>
                      <Select name="childId" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a criança" />
                        </SelectTrigger>
                        <SelectContent>
                          {children.map(child => (
                            <SelectItem key={child.id} value={child.id}>
                              {child.avatar} {child.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Tipo</Label>
                      <Select name="type" required>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adicao">Adicionar Saldo</SelectItem>
                          <SelectItem value="remocao">Remover Saldo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Valor (R$)</Label>
                      <Input name="amount" type="number" step="0.01" min="0.01" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea name="description" placeholder="Motivo da transação" />
                    </div>
                    <Button type="submit" className="w-full">Confirmar Transação</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => {
                const childTransactions = transactions.filter(t => t.childId === child.id);
                const lastMonth = childTransactions.filter(t => {
                  const diffTime = Date.now() - new Date(t.date).getTime();
                  const diffDays = diffTime / (1000 * 60 * 60 * 24);
                  return diffDays <= 30;
                });
                
                const income = lastMonth.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
                const expenses = Math.abs(lastMonth.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
                const savings = child.allowance;

                return (
                  <Card key={child.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{child.avatar}</span>
                          <div>
                            <CardTitle className="text-base">{child.name}</CardTitle>
                            <CardDescription>{child.age} anos</CardDescription>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedChildForAllowance(child.id);
                            setAllowanceDialogOpen(true);
                          }}
                        >
                          <RefreshCcw className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
                        <p className="text-3xl">R$ {child.allowance.toFixed(2)}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Mesada {child.allowanceSettings.frequency}</span>
                          <span>R$ {child.allowanceSettings.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Taxa de conversão</span>
                          <span>{child.allowanceSettings.pointsToMoneyRate} pts = R$ 1</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full"
                        onClick={() => handlePayAllowance(child.id)}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Pagar Mesada
                      </Button>

                      <div className="pt-2 border-t space-y-2">
                        <p className="text-sm">Últimos 30 dias</p>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-green-50 rounded text-center">
                            <p className="text-xs text-muted-foreground">Recebido</p>
                            <p className="text-sm">R$ {income.toFixed(2)}</p>
                          </div>
                          <div className="p-2 bg-red-50 rounded text-center">
                            <p className="text-xs text-muted-foreground">Gasto</p>
                            <p className="text-sm">R$ {expenses.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Histórico de Transações */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Transações</CardTitle>
                <CardDescription>Todas as movimentações financeiras</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {transactions
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 20)
                    .map((transaction) => {
                      const child = children.find(c => c.id === transaction.childId);
                      const isPositive = transaction.amount > 0;
                      
                      return (
                        <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {isPositive ? (
                              <ArrowUpCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <ArrowDownCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <p className="text-sm">{transaction.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {child?.avatar} {child?.name} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                              </p>
                              {transaction.pointsConverted && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                  {transaction.pointsConverted} pontos convertidos
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className={`text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            <p>{isPositive ? '+' : ''}R$ {transaction.amount.toFixed(2)}</p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Poupança */}
            <Card>
              <CardHeader>
                <CardTitle>Análise Financeira</CardTitle>
                <CardDescription>Visão geral das finanças da família</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={children.map(child => ({
                          name: child.name,
                          value: child.allowance,
                          fill: child.color
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: R$ ${value.toFixed(2)}`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {children.map((child, index) => (
                          <Cell key={`cell-${index}`} fill={child.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3>Recompensas</h3>
                <p className="text-sm text-muted-foreground">
                  Configure prêmios para trocar por pontos
                </p>
              </div>
              <Dialog open={newRewardOpen} onOpenChange={setNewRewardOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Recompensa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Recompensa</DialogTitle>
                    <DialogDescription>
                      Adicione um prêmio que pode ser resgatado
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateReward} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input name="title" placeholder="Ex: 1 hora de videogame" required />
                    </div>
                    <div>
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea name="description" placeholder="Detalhes da recompensa" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="icon">Emoji</Label>
                        <Input name="icon" placeholder="🎮" maxLength={2} required />
                      </div>
                      <div>
                        <Label htmlFor="pointsCost">Custo em Pontos</Label>
                        <Input name="pointsCost" type="number" min="1" defaultValue="30" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="category">Categoria</Label>
                      <Input name="category" placeholder="Ex: lazer" required />
                    </div>
                    <Button type="submit" className="w-full">Criar Recompensa</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id}>
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{reward.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{reward.title}</CardTitle>
                        <CardDescription>{reward.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{reward.category}</span>
                      <span className="font-medium">{reward.pointsCost} pontos</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas da Família</CardTitle>
                <CardDescription>Acompanhe o progresso geral</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {children.map((child) => {
                  const childTasks = tasks.filter(t => t.childId === child.id);
                  const completed = childTasks.filter(t => t.completed).length;
                  const percentage = childTasks.length > 0 ? (completed / childTasks.length) * 100 : 0;

                  return (
                    <div key={child.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{child.avatar}</span>
                          <span>{child.name}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {completed}/{childTasks.length} tarefas
                        </span>
                      </div>
                      <Progress value={percentage} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog para Configurações de Mesada */}
      <Dialog open={allowanceDialogOpen} onOpenChange={setAllowanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Mesada</DialogTitle>
            <DialogDescription>
              Ajuste as configurações de mesada para {children.find(c => c.id === selectedChildForAllowance)?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateAllowanceSettings} className="space-y-4">
            <div>
              <Label htmlFor="frequency">Frequência</Label>
              <Select 
                name="frequency" 
                defaultValue={children.find(c => c.id === selectedChildForAllowance)?.allowanceSettings.frequency}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">Semanal</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input 
                name="amount" 
                type="number" 
                step="0.01" 
                min="0.01"
                defaultValue={children.find(c => c.id === selectedChildForAllowance)?.allowanceSettings.amount}
                required 
              />
            </div>
            <div>
              <Label htmlFor="pointsToMoneyRate">Taxa de Conversão (Pontos por R$ 1)</Label>
              <Input 
                name="pointsToMoneyRate" 
                type="number" 
                min="1"
                defaultValue={children.find(c => c.id === selectedChildForAllowance)?.allowanceSettings.pointsToMoneyRate}
                required 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ex: 10 significa que 10 pontos = R$ 1,00
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAllowanceDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
