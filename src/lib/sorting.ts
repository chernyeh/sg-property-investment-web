export type SortDirection = 'asc' | 'desc' | null

export interface SortState {
  column: string | null
  direction: SortDirection
}

export function toggleSort(current: SortState, column: string): SortState {
  if (current.column === column) {
    // Cycle: asc -> desc -> null
    if (current.direction === 'asc') {
      return { column, direction: 'desc' }
    } else if (current.direction === 'desc') {
      return { column: null, direction: null }
    }
  }
  return { column, direction: 'asc' }
}

export function sortData<T extends Record<string, any>>(
  data: T[],
  sortState: SortState
): T[] {
  if (!sortState.column || !sortState.direction) {
    return data
  }

  return [...data].sort((a, b) => {
    const aVal = a[sortState.column!]
    const bVal = b[sortState.column!]

    if (aVal == null) return 1
    if (bVal == null) return -1

    let comparison = 0
    if (typeof aVal === 'number') {
      comparison = aVal - bVal
    } else if (typeof aVal === 'string') {
      comparison = aVal.localeCompare(bVal)
    } else if (aVal instanceof Date) {
      comparison = aVal.getTime() - bVal.getTime()
    }

    return sortState.direction === 'asc' ? comparison : -comparison
  })
}
