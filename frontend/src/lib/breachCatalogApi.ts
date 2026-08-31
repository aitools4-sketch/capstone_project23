import { apiGet } from './apiClient'

export type CatalogBreach = {
  name: string
  title: string
  domain: string
  breach_date: string
  added_date: string
  pwn_count: number
  description: string
  data_classes: string[]
  severity: 'low' | 'medium' | 'high'
  is_verified: boolean
  is_sensitive: boolean
  is_stealer_log: boolean
  logo_path: string
}

export function fetchBreachCatalog(): Promise<CatalogBreach[]> {
  return apiGet<CatalogBreach[]>('/api/breach-catalog')
}

export function fetchBreachCatalogEntry(name: string): Promise<CatalogBreach> {
  return apiGet<CatalogBreach>(`/api/breach-catalog/${encodeURIComponent(name)}`)
}
