export type Advice = { tier: 'haiku' | 'sonnet' | 'opus'; why: string; current: string }

declare module 'claude-code' {
  interface PluginState {
    'model-advisor': { advice: Advice | null; isAuto: boolean | null; isHidden: boolean }
  }
}
