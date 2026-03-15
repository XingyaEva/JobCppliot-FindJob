import { createContext, useContext, useState, ReactNode } from 'react';

interface SavedContext {
  action: 'save-job' | 'save-resume' | 'save-interview' | 'upgrade';
  data?: Record<string, any>;
  returnUrl: string;
  timestamp: number;
}

interface NavigationContextType {
  savedContext: SavedContext | null;
  saveContext: (context: Omit<SavedContext, 'timestamp'>) => void;
  restoreContext: () => SavedContext | null;
  clearContext: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [savedContext, setSavedContext] = useState<SavedContext | null>(() => {
    try {
      const saved = localStorage.getItem('navigationContext');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Failed to parse saved context:', error);
      return null;
    }
  });

  const saveContext = (context: Omit<SavedContext, 'timestamp'>) => {
    const fullContext = { ...context, timestamp: Date.now() };
    setSavedContext(fullContext);
    localStorage.setItem('navigationContext', JSON.stringify(fullContext));
  };

  const restoreContext = () => {
    const context = savedContext;
    
    // 检查是否过期（30分钟）
    if (context && Date.now() - context.timestamp > 30 * 60 * 1000) {
      clearContext();
      return null;
    }
    
    return context;
  };

  const clearContext = () => {
    setSavedContext(null);
    localStorage.removeItem('navigationContext');
  };

  return (
    <NavigationContext.Provider value={{
      savedContext,
      saveContext,
      restoreContext,
      clearContext,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
