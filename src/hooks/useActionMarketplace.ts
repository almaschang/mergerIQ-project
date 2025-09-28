import { useState, useCallback } from 'react';
import { ActionModule, ActionFeedbackInput, ActionMarketplaceSummary } from '../types/action';
import {
  listActionModules,
  createActionModule,
  updateActionModule,
  recordActionFeedback,
  removeActionModule,
  summarizeMarketplace
} from '../utils/market/actionModules';

interface UseActionMarketplaceReturn {
  modules: ActionModule[];
  summary: ActionMarketplaceSummary;
  createModule: (module: Omit<ActionModule, 'id' | 'createdAt' | 'updatedAt' | 'adoptionCount'>) => void;
  updateModule: (id: string, changes: Partial<ActionModule>) => void;
  feedback: (input: ActionFeedbackInput) => void;
  removeModule: (id: string) => void;
  refresh: () => void;
}

export function useActionMarketplace(): UseActionMarketplaceReturn {
  const [modules, setModules] = useState<ActionModule[]>(listActionModules());
  const [summary, setSummary] = useState<ActionMarketplaceSummary>(summarizeMarketplace());

  const refresh = useCallback(() => {
    setModules(listActionModules());
    setSummary(summarizeMarketplace());
  }, []);

  const create = useCallback((module: Omit<ActionModule, 'id' | 'createdAt' | 'updatedAt' | 'adoptionCount'>) => {
    createActionModule(module);
    refresh();
  }, [refresh]);

  const update = useCallback((id: string, changes: Partial<ActionModule>) => {
    updateActionModule(id, changes);
    refresh();
  }, [refresh]);

  const feedback = useCallback((input: ActionFeedbackInput) => {
    recordActionFeedback(input);
    refresh();
  }, [refresh]);

  const remove = useCallback((id: string) => {
    removeActionModule(id);
    refresh();
  }, [refresh]);

  return {
    modules,
    summary,
    createModule: create,
    updateModule: update,
    feedback,
    removeModule: remove,
    refresh
  };
}
