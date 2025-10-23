import { useState } from 'react';
import { Child } from '../App';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, Baby } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (type: 'parent' | 'child', childId?: string) => void;
  children: Child[];
}

export function AuthScreen({ onLogin, children }: AuthScreenProps) {
  const [mode, setMode] = useState<'select' | 'child'>('select');

  if (mode === 'select') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">⭐</span>
            </div>
            <CardTitle className="text-2xl">Rotina Divertida</CardTitle>
            <CardDescription>
              Transforme tarefas em diversão!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full h-14 gap-2"
              onClick={() => onLogin('parent')}
            >
              <Users className="w-5 h-5" />
              Sou Responsável
            </Button>
            <Button 
              className="w-full h-14 gap-2"
              variant="secondary"
              onClick={() => setMode('child')}
            >
              <Baby className="w-5 h-5" />
              Sou Criança
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Escolha seu perfil</CardTitle>
          <CardDescription>
            Qual criança vai brincar hoje?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => onLogin('child', child.id)}
              className="w-full p-4 rounded-lg border-2 hover:border-primary transition-all bg-card hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                  style={{ backgroundColor: child.color + '20' }}
                >
                  {child.avatar}
                </div>
                <div className="text-left flex-1">
                  <p className="font-medium">{child.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Nível {child.level} • {child.points} pontos
                  </p>
                </div>
              </div>
            </button>
          ))}
          <Button 
            variant="ghost"
            className="w-full mt-4"
            onClick={() => setMode('select')}
          >
            Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
