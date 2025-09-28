import React, { useMemo, useState } from 'react';
import { Plus, CheckCircle2, Clock, AlertCircle, Trash2 } from 'lucide-react';
import { useActionMarketplace } from '../../hooks/useActionMarketplace';
import { ActionModule, ActionModuleStatus, ActionModuleSource } from '../../types/action';

const STATUS_COLORS: Record<ActionModuleStatus, string> = {
  open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200',
  'in-progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200',
  abandoned: 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
};

const SOURCE_LABELS: Record<ActionModuleSource, string> = {
  scenario: 'Scenario',
  disclosure: 'Disclosure',
  regulatory: 'Regulatory',
  custom: 'Custom'
};

export default function ActionMarketplace() {
  const { modules, summary, createModule, updateModule, feedback, removeModule } = useActionMarketplace();
  const [isCreating, setIsCreating] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');

  const openModules = useMemo(() => modules.filter((module) => module.status !== 'completed'), [modules]);

  const handleCreate = () => {
    if (!draftTitle.trim()) return;

    createModule({
      title: draftTitle.trim(),
      description: draftDescription.trim() || 'No description provided.',
      status: 'open',
      source: 'custom',
      steps: [],
      stakeholders: ['investors'],
      evidenceLinks: []
    });

    setDraftTitle('');
    setDraftDescription('');
    setIsCreating(false);
  };

  return (
    <div className="bg-white dark:bg-dark-100 shadow rounded-lg p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-400">Action Marketplace</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">Strategy modules & adoption</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {summary.totalModules} modules • {summary.completedModules} completed • Confidence {(summary.averageConfidence * 100).toFixed(0)}%
          </p>
        </div>
        <button
          onClick={() => setIsCreating((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          New Action
        </button>
      </div>

      {isCreating && (
        <div className="mt-4 border border-gray-200 dark:border-dark-200 rounded-md p-4 space-y-3">
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Action title"
            className="w-full rounded border border-gray-200 dark:border-dark-200 bg-white dark:bg-dark-100 p-2 text-sm"
          />
          <textarea
            value={draftDescription}
            onChange={(e) => setDraftDescription(e.target.value)}
            placeholder="Describe the recommended steps..."
            className="w-full rounded border border-gray-200 dark:border-dark-200 bg-white dark:bg-dark-100 p-2 text-sm"
            rows={3}
          />
          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-500"
            >
              Save Module
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4">
        {modules.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No action modules yet. Create one from scenario or disclosure insights.</p>
        ) : (
          modules.map((module) => (
            <div key={module.id} className="border border-gray-200 dark:border-dark-200 rounded-md p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded ${STATUS_COLORS[module.status]}`}>
                      {module.status.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-400">{SOURCE_LABELS[module.source]}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-2">{module.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{module.description}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    Confidence {(module.confidence ? module.confidence * 100 : 50).toFixed(0)}% | Adoption {module.adoptionCount}
                  </p>
                </div>
                <button
                  onClick={() => removeModule(module.id)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label="Remove module"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <button
                  onClick={() => feedback({ moduleId: module.id, status: 'in-progress' })}
                  className="inline-flex items-center gap-1 text-xs text-amber-600"
                >
                  <Clock className="h-4 w-4" /> In Progress
                </button>
                <button
                  onClick={() => feedback({ moduleId: module.id, status: 'completed' })}
                  className="inline-flex items-center gap-1 text-xs text-green-600"
                >
                  <CheckCircle2 className="h-4 w-4" /> Mark Complete
                </button>
                <button
                  onClick={() => feedback({ moduleId: module.id, status: 'abandoned' })}
                  className="inline-flex items-center gap-1 text-xs text-gray-500"
                >
                  <AlertCircle className="h-4 w-4" /> Flag Issue
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
