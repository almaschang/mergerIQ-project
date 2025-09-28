import { ActionModule, ActionFeedbackInput, ActionMarketplaceSummary, ActionModuleStatus } from '../../types/action';
import { roundTo } from '../intelligence/textMetrics';

const STORAGE_KEY = 'mergeriq_action_modules_v1';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function hydrate(): ActionModule[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActionModule[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((module) => ({
      ...module,
      createdAt: module.createdAt ?? Date.now(),
      updatedAt: module.updatedAt ?? Date.now(),
      adoptionCount: module.adoptionCount ?? 0,
      status: module.status as ActionModuleStatus
    }));
  } catch (error) {
    console.warn('Failed to hydrate action modules from storage:', error);
    return [];
  }
}

let actionModules: ActionModule[] = hydrate();

function persist() {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(actionModules));
  } catch (error) {
    console.warn('Failed to persist action modules:', error);
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function listActionModules(): ActionModule[] {
  return actionModules.slice().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createActionModule(module: Omit<ActionModule, 'id' | 'createdAt' | 'updatedAt' | 'adoptionCount'>): ActionModule {
  const timestamp = Date.now();
  const newModule: ActionModule = {
    ...module,
    id: generateId('action'),
    createdAt: timestamp,
    updatedAt: timestamp,
    adoptionCount: 0
  };
  actionModules.push(newModule);
  persist();
  return newModule;
}

export function updateActionModule(moduleId: string, changes: Partial<ActionModule>): ActionModule | null {
  const index = actionModules.findIndex((module) => module.id === moduleId);
  if (index === -1) return null;

  const updated: ActionModule = {
    ...actionModules[index],
    ...changes,
    updatedAt: Date.now()
  };
  actionModules[index] = updated;
  persist();
  return updated;
}

export function recordActionFeedback({ moduleId, status, note, outcomeDelta }: ActionFeedbackInput): ActionModule | null {
  const index = actionModules.findIndex((module) => module.id === moduleId);
  if (index === -1) return null;

  const target = actionModules[index];
  const notes = note ? [...(target.notes || []), note] : target.notes;
  const adoptionCount = status === 'completed' ? target.adoptionCount + 1 : target.adoptionCount;

  const updated: ActionModule = {
    ...target,
    status,
    notes,
    adoptionCount,
    outcomeDelta: typeof outcomeDelta === 'number' ? roundTo(outcomeDelta, 3) : target.outcomeDelta,
    updatedAt: Date.now()
  };

  actionModules[index] = updated;
  persist();
  return updated;
}

export function removeActionModule(moduleId: string): void {
  actionModules = actionModules.filter((module) => module.id !== moduleId);
  persist();
}

export function summarizeMarketplace(): ActionMarketplaceSummary {
  if (actionModules.length === 0) {
    return {
      totalModules: 0,
      openModules: 0,
      completedModules: 0,
      averageConfidence: 0,
      averageOutcomeDelta: 0
    };
  }

  const totalModules = actionModules.length;
  const openModules = actionModules.filter((module) => module.status === 'open' || module.status === 'in-progress').length;
  const completedModules = actionModules.filter((module) => module.status === 'completed').length;
  const confidenceSum = actionModules.reduce((sum, module) => sum + (module.confidence ?? 0.5), 0);
  const outcomeSum = actionModules.reduce((sum, module) => sum + (module.outcomeDelta ?? 0), 0);

  return {
    totalModules,
    openModules,
    completedModules,
    averageConfidence: roundTo(confidenceSum / totalModules, 3),
    averageOutcomeDelta: roundTo(outcomeSum / totalModules, 3)
  };
}
