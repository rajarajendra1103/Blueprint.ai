import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Shield,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { LLMProviderId, ProviderMeta, UserProviderConfig } from '@blueprint/shared';
import { useSession } from '../context/SessionContext';
import * as api from '../lib/api';

interface ProviderKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProviderKeyModal: React.FC<ProviderKeyModalProps> = ({ isOpen, onClose }) => {
  const { providerConfig, updateProviderConfig, clearApiKey } = useSession();

  const [providers, setProviders] = useState<ProviderMeta[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<LLMProviderId>(providerConfig.provider);
  const [apiKey, setApiKey] = useState<string>(providerConfig.apiKey || '');
  const [selectedModel, setSelectedModel] = useState<string>(providerConfig.model || '');
  const [showKey, setShowKey] = useState<boolean>(false);

  // Testing status
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ valid: boolean; message?: string } | null>(null);

  // Fetch providers metadata on mount
  useEffect(() => {
    api.fetchProviders().then(setProviders).catch(console.error);
  }, []);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedProvider(providerConfig.provider);
      setApiKey(providerConfig.apiKey || '');
      setSelectedModel(providerConfig.model || '');
      setTestResult(null);
    }
  }, [isOpen, providerConfig]);

  if (!isOpen) return null;

  const currentMeta = providers.find((p) => p.id === selectedProvider) || {
    id: selectedProvider,
    name: selectedProvider,
    description: '',
    defaultModel: 'default',
    availableModels: [],
    keyPlaceholder: 'Enter API Key...',
    docsUrl: '#',
    requiresKey: true,
  };

  const handleProviderChange = (newProvider: LLMProviderId) => {
    setSelectedProvider(newProvider);
    const meta = providers.find((p) => p.id === newProvider);
    if (meta) {
      setSelectedModel(meta.defaultModel);
    }
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    const cleanKey = apiKey.trim();
    if (!cleanKey) {
      setTestResult({ valid: false, message: 'Please paste your API key first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await api.validateProviderKey({
        provider: selectedProvider,
        apiKey: cleanKey,
        model: selectedModel,
      });
      setTestResult(result);
    } catch (err: any) {
      setTestResult({ valid: false, message: err.message || 'Connection ping failed.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    updateProviderConfig({
      provider: selectedProvider,
      apiKey: apiKey.trim(),
      model: selectedModel || currentMeta.defaultModel,
    });
    onClose();
  };

  const handleClearKey = () => {
    setApiKey('');
    clearApiKey();
    setTestResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#F4F1EC] border border-border-warm rounded-3xl shadow-nm-lg max-w-xl w-full p-6 sm:p-8 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-border-warm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EFECE6] border border-border-warm flex items-center justify-center text-terracotta shadow-nm-inset-sm">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-editorial text-xl font-bold text-charcoal">
                LLM Provider & BYOK Keys
              </h2>
              <p className="text-xs text-subtle">
                Stateless session credentials (never persisted server-side)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-subtle hover:text-charcoal hover:bg-[#EFECE6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Provider Selection */}
        <div className="mt-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
              Select Provider
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {providers.map((p) => {
                const isSelected = p.id === selectedProvider;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleProviderChange(p.id)}
                    className={`p-3 rounded-2xl text-left border transition-all text-xs font-medium flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-terracotta text-charcoal shadow-nm-sm ring-1 ring-terracotta'
                        : 'bg-[#EFECE6] border-transparent text-subtle hover:text-charcoal hover:bg-[#EAE5DC]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-charcoal">{p.name.split(' ')[0]}</span>
                    </div>
                    <span className="text-[11px] line-clamp-1 opacity-80">{p.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-subtle">{currentMeta.description}</p>
          </div>

          {/* Model Selection */}
          {currentMeta.availableModels.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-charcoal uppercase tracking-wider mb-2">
                Model Choice
              </label>
              <select
                value={selectedModel || currentMeta.defaultModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-[#EFECE6] border border-border-warm rounded-xl px-3.5 py-2.5 text-xs text-charcoal font-mono shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none"
              >
                {selectedProvider === 'openrouter' ? (
                  <>
                    <optgroup label="Free Models (:free — $0 Balance Required)">
                      {currentMeta.availableModels
                        .filter((m) => m.includes(':free'))
                        .map((m) => (
                          <option key={m} value={m}>
                            ✨ {m} (100% Free)
                          </option>
                        ))}
                    </optgroup>
                    <optgroup label="Flagship & Premium Models (Requires Credits)">
                      {currentMeta.availableModels
                        .filter((m) => !m.includes(':free'))
                        .map((m) => (
                          <option key={m} value={m}>
                            💎 {m}
                          </option>
                        ))}
                    </optgroup>
                  </>
                ) : (
                  currentMeta.availableModels.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))
                )}
              </select>

              {/* Custom Model Input for maximum flexibility */}
              <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-subtle">
                <span>Or specify custom model ID:</span>
                <input
                  type="text"
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  placeholder="e.g. deepseek/deepseek-r1:free"
                  className="sm:w-72 bg-[#EFECE6] border border-border-warm rounded-lg px-2.5 py-1 text-[11px] font-mono text-charcoal outline-none focus:ring-1 focus:ring-terracotta"
                />
              </div>
            </div>
          )}

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-charcoal uppercase tracking-wider">
                {currentMeta.name} API Key
              </label>
              {currentMeta.docsUrl && currentMeta.docsUrl !== '#' && (
                <a
                  href={currentMeta.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-terracotta hover:underline flex items-center gap-1"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={currentMeta.keyPlaceholder}
                className="w-full bg-[#EFECE6] border border-border-warm rounded-2xl px-4 py-3 text-xs font-mono text-charcoal shadow-nm-inset-sm focus:ring-2 focus:ring-terracotta outline-none pr-24"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="p-1.5 text-subtle hover:text-charcoal rounded-lg hover:bg-white/60 transition-colors"
                  title={showKey ? 'Hide Key' : 'Show Key'}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    title="Clear API Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Explicit Clear API Key Action Row per user comment */}
            {apiKey && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear saved API key</span>
                </button>
              </div>
            )}
          </div>

          {/* Test Connection Feedback */}
          {testResult && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-start gap-2.5 border ${
                testResult.valid
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {testResult.valid ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-semibold">
                  {testResult.valid ? 'Connection Successful!' : 'Connection Failed:'}
                </span>{' '}
                {testResult.message || (testResult.valid ? 'Provider credentials validated.' : '')}
              </div>
            </div>
          )}

          {/* BYOK Privacy Guarantee Banner */}
          <div className="bg-[#EFECE6] border border-border-warm rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-subtle">
            <Shield className="w-4 h-4 text-sage shrink-0" />
            <span>
              <strong>Stateless BYOK:</strong> Keys live strictly in your browser&apos;s sessionStorage and are forwarded solely to provider endpoints per request.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-7 pt-4 border-t border-border-warm flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !apiKey}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold btn-nm text-charcoal disabled:opacity-50 flex items-center gap-2"
          >
            {isTesting ? 'Pinging Provider...' : 'Test Connection'}
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-subtle hover:text-charcoal transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold btn-terracotta text-white"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
