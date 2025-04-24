export function parseBoolean(value: string): boolean {
    if (typeof value === 'boolean') return value
    if (typeof value === 'string') {
      const lower = value.trim().toLowerCase()
      if (lower === 'true') return true
      if (lower === 'false') return false
    }
    throw new Error(`Failed to parse boolean: ${value}`)
  }