import { apiGet, apiPostAuthed } from './apiClient'

export type Feedback = {
  id: string
  rating: number
  comment: string | null
  created_at: string
}

export type FeaturedFeedback = {
  rating: number
  comment: string
}

export function submitFeedback(rating: number, comment: string): Promise<Feedback> {
  return apiPostAuthed<Feedback>('/api/feedback', { rating, comment: comment.trim() || null })
}

export function fetchFeaturedFeedback(): Promise<FeaturedFeedback[]> {
  return apiGet<FeaturedFeedback[]>('/api/feedback/featured')
}
