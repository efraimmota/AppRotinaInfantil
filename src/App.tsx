import { useState } from "react";
import { AuthScreen } from "./components/AuthScreen";
import { ParentDashboard } from "./components/ParentDashboard";
import { Toaster } from "./components/ui/sonner";

export interface Child {
  id: string;
  name: string;
  age: number;
  avatar: string;
  level: number;
  xp: number;
  points: number;
  allowance: number;
  color: string;
  allowanceSettings: {
    frequency: "semanal" | "mensal";
    amount: number;
    dayOfWeek?: number; // 0-6 para semanal
    dayOfMonth?: number; // 1-31 para mensal
    pointsToMoneyRate: number; // ex: 10 pontos = 1 real
  };
}

export interface Task {
  id: string;
  childId: string;
  title: string;
  description: string;
  category:
    | "higiene"
    | "estudos"
    | "comportamento"
    | "lazer"
    | "tarefas";
  points: number;
  frequency: "diaria" | "semanal" | "personalizada";
  completed: boolean;
  completedDate?: Date;
  dueDate?: Date;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  icon: string;
  category: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: Date;
}

export interface Transaction {
  id: string;
  childId: string;
  type:
    | "mesada"
    | "adicao"
    | "remocao"
    | "gasto"
    | "conversao_pontos";
  amount: number;
  description: string;
  date: Date;
  pointsConverted?: number; // se for conversão de pontos
}

export type UserType = "parent" | "child" | null;

export default function App() {
  const [userType, setUserType] = useState<UserType>(null);

  // Mock data - em produção viria do Supabase
  const [children, setChildren] = useState<Child[]>([
    {
      id: "1",
      name: "Ana",
      age: 8,
      avatar: "👧",
      level: 5,
      xp: 450,
      points: 120,
      allowance: 50,
      color: "#FF6B9D",
      allowanceSettings: {
        frequency: "semanal",
        amount: 20,
        dayOfWeek: 0, // Domingo
        pointsToMoneyRate: 10, // 10 pontos = R$ 1
      },
    },
    {
      id: "2",
      name: "Pedro",
      age: 6,
      avatar: "👦",
      level: 3,
      xp: 280,
      points: 85,
      allowance: 35,
      color: "#4ECDC4",
      allowanceSettings: {
        frequency: "semanal",
        amount: 15,
        dayOfWeek: 0,
        pointsToMoneyRate: 10,
      },
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      childId: "1",
      title: "Escovar os dentes",
      description: "Manhã e noite",
      category: "higiene",
      points: 10,
      frequency: "diaria",
      completed: false,
    },
    {
      id: "2",
      childId: "1",
      title: "Fazer lição de casa",
      description: "Matemática e português",
      category: "estudos",
      points: 20,
      frequency: "diaria",
      completed: true,
      completedDate: new Date(),
    },
    {
      id: "3",
      childId: "2",
      title: "Arrumar a cama",
      description: "Ao acordar",
      category: "tarefas",
      points: 15,
      frequency: "diaria",
      completed: false,
    },
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    {
      id: "1",
      title: "1 hora de videogame",
      description: "Tempo extra para jogar",
      pointsCost: 30,
      icon: "🎮",
      category: "lazer",
    },
    {
      id: "2",
      title: "Passeio no shopping",
      description: "Passeio em família",
      pointsCost: 100,
      icon: "🛍️",
      category: "passeio",
    },
    {
      id: "3",
      title: "Sobremesa especial",
      description: "Escolher a sobremesa",
      pointsCost: 25,
      icon: "🍰",
      category: "comida",
    },
  ]);

  const [transactions, setTransactions] = useState<
    Transaction[]
  >([
    {
      id: "1",
      childId: "1",
      type: "mesada",
      amount: 20,
      description: "Mesada semanal",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "2",
      childId: "1",
      type: "gasto",
      amount: -10,
      description: "Comprou um brinquedo",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      id: "3",
      childId: "2",
      type: "mesada",
      amount: 15,
      description: "Mesada semanal",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      id: "4",
      childId: "1",
      type: "conversao_pontos",
      amount: 5,
      description: "Converteu pontos em dinheiro",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      pointsConverted: 50,
    },
  ]);

  const handleLogin = (type: UserType, childId?: string) => {
    // Apenas permite login de responsável - painel de criança removido para demonstração
    if (type === "parent") {
      setUserType(type);
    }
  };

  const handleLogout = () => {
    setUserType(null);
  };

  if (!userType) {
    return (
      <>
        <AuthScreen onLogin={handleLogin} children={children} />
        <Toaster />
      </>
    );
  }

  // Apenas renderiza o ParentDashboard
  return (
    <>
      <ParentDashboard
        children={children}
        setChildren={setChildren}
        tasks={tasks}
        setTasks={setTasks}
        rewards={rewards}
        setRewards={setRewards}
        transactions={transactions}
        setTransactions={setTransactions}
        onLogout={handleLogout}
      />
      <Toaster />
    </>
  );
}