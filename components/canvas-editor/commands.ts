import type { EditableKind } from './types'

export type CommandHandler<Args> = (args: Args) => void

export type CommandRegistration<Args> = {
  id: string
  appliesTo: EditableKind[]
  handler: CommandHandler<Args>
}

const registry = new Map<string, CommandRegistration<unknown>>()

export function registerCommand<Args>(reg: CommandRegistration<Args>): void {
  registry.set(reg.id, reg as CommandRegistration<unknown>)
}

export function dispatch<Args>(id: string, args: Args): void {
  const reg = registry.get(id)
  if (!reg) {
    if (typeof window !== 'undefined') {
      console.warn(`[canvas-editor] unknown command: ${id}`)
    }
    return
  }
  ;(reg.handler as CommandHandler<Args>)(args)
}

export function getCommand(id: string): CommandRegistration<unknown> | undefined {
  return registry.get(id)
}

export function listCommandsFor(kind: EditableKind): CommandRegistration<unknown>[] {
  return Array.from(registry.values()).filter((c) => c.appliesTo.includes(kind))
}
