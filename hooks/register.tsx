import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Advice } from '../types'
import { pick, tierOf } from './pick'

const advice = atom({ plugin: 'model-advisor', key: 'advice' } as const, null)
// null = follow the userConfig default; a button press overrides it for the session
const isAuto = atom({ plugin: 'model-advisor', key: 'isAuto' } as const, null)
const isHidden = atom({ plugin: 'model-advisor', key: 'isHidden' } as const, false)

const TIERS = ['haiku', 'sonnet', 'opus'] as const

async function switchTo($: any, tier: string) {
  try {
    const r = await $.config.set({ key: 'model', value: tier })
    if (!r?.deny) return
  } catch {}
  // fallback: queued, takes effect once the session is idle
  await $.command.run({ command: 'model', args: tier }).catch(() => {})
}

export const register: Register = (on, options) => {
  const defaultAuto = options?.autoSwitch === true

  on('prompt.submit', async ($, e, next) => {
    if (e.command || e.isMeta) return next(e)

    const { tier, why } = pick(e.text)
    const current = await $.session.model().catch(() => '')
    const entry: Advice = { tier, why, current }
    await update($, advice, () => entry)
    await update($, isHidden, () => false)

    const isMatch = tierOf(current) === tier

    const auto = (await read($, isAuto)) ?? defaultAuto
    if (auto && !isMatch) {
      await switchTo($, tier)
      $.ui.toast(`model-advisor: switched to ${tier} (${why})`)
    }

    return next(e)
  }).catch(($, e, next) => {
    $.ui.log(`model-advisor: prompt.submit failed`)
    return next(e)
  })

  on('session.start', ($, e, next) => {
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const a = await read($, advice)
    if (a === null || e.props.hasSurvey || (await read($, isHidden))) return next(e)

    const auto = (await read($, isAuto)) ?? defaultAuto
    const cur = tierOf(a.current)
    const isMatch = cur === a.tier
    const { Box, Button, Text } = $.ui.resolve(e)

    return (
      <Box>
        <Text color={isMatch ? 'success' : 'warning'}>
          {isMatch ? '✓' : '→'} {a.tier}{' '}
        </Text>
        <Text dimColor>({a.why}) </Text>
        {TIERS.map(t => (
          <Button
            key={t}
            label={`${t === cur ? '●' : '○'} ${t}`}
            onPress={() => switchTo($, t)}
          />
        ))}
        <Text> </Text>
        <Button
          key="auto"
          label={`auto ${auto ? 'on' : 'off'}`}
          onPress={() => update($, isAuto, v => !(v ?? defaultAuto))}
        />
        <Button key="hide" label="✕" onPress={() => update($, isHidden, () => true)} />
      </Box>
    )
  })
}
