export type Tier = 'haiku' | 'sonnet' | 'opus'

// ponytail: keyword heuristic, no LLM call; swap for $.model.classify if it misjudges too often
const OPUS = /\b(root.?cause|why (is|does|did|are)|debug|deadlock|race|leak|architect|design|trade.?off|refactor|migrat|audit|investigate|diagnos|plan|review|security|concurren|performance|optimi[sz]e)\b/i
const HAIKU = /\b(rename|typo|format|lint|comment|docstring|list|show|what is|where is|git (status|log|diff)|commit message|translate|summari[sz]e|explain (this|line))\b/i

export function pick(text: string): { tier: Tier; why: string } {
  const t = text.trim()
  if (OPUS.test(t) || t.length > 1200) return { tier: 'opus', why: 'reasoning-heavy' }
  if (t.length < 160 && HAIKU.test(t)) return { tier: 'haiku', why: 'small, mechanical' }
  return { tier: 'sonnet', why: 'general coding' }
}

export const tierOf = (modelId: string): Tier | null =>
  /haiku/i.test(modelId) ? 'haiku' : /sonnet/i.test(modelId) ? 'sonnet' : /opus/i.test(modelId) ? 'opus' : null
