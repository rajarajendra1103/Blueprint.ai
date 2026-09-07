import { FullProjectState, UserProviderConfig } from '@blueprint/shared';

const STORAGE_KEYS = {
  PROVIDER_CONFIG: 'blueprint_provider_config',
  PROJECT_STATE: 'blueprint_project_state',
};

export const DEFAULT_PROVIDER_CONFIG: UserProviderConfig = {
  provider: 'gemini',
  apiKey: '',
  model: 'gemini-1.5-flash',
};

export function loadProviderConfig(): UserProviderConfig {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.PROVIDER_CONFIG);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.provider === 'openrouter' && (parsed.model?.includes('llama-3.3-70b-instruct:free') || parsed.model?.includes('gemini-flash-1.5'))) {
        parsed.model = 'openrouter/free';
      }
      return parsed;
    }
  } catch (err) {
    console.warn('Could not parse saved provider config from sessionStorage', err);
  }
  return DEFAULT_PROVIDER_CONFIG;
}

export function saveProviderConfig(config: UserProviderConfig): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.PROVIDER_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.warn('Could not save provider config to sessionStorage', err);
  }
}

export function clearStoredApiKey(): void {
  try {
    const current = loadProviderConfig();
    current.apiKey = '';
    // Keep provider selection but wipe the secret API key
    sessionStorage.setItem(STORAGE_KEYS.PROVIDER_CONFIG, JSON.stringify(current));
  } catch (err) {
    console.warn('Could not clear api key from sessionStorage', err);
  }
}

export function loadProjectState(): Partial<FullProjectState> | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.PROJECT_STATE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Could not parse project state from sessionStorage', err);
  }
  return null;
}

export function saveProjectState(state: Partial<FullProjectState>): void {
  try {
    sessionStorage.setItem(STORAGE_KEYS.PROJECT_STATE, JSON.stringify(state));
  } catch (err) {
    console.warn('Could not save project state to sessionStorage', err);
  }
}

export function clearAllSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.PROJECT_STATE);
    sessionStorage.removeItem(STORAGE_KEYS.PROVIDER_CONFIG);
  } catch (err) {
    console.warn('Could not clear session storage', err);
  }
}
