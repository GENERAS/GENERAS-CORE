import { supabase } from '../lib/supabase'

// Presentation labels only. Status comes from the project's own `status`
// field; type is inferred from evidence (an existing client_name) and the
// category — never invented.
export const PROJECT_STATUS_LABELS = {
  completed: 'Completed',
  building: 'In development',
  planned: 'Planned',
}

export function projectStatusLabel(status) {
  return PROJECT_STATUS_LABELS[status] || 'Planned'
}

export function projectTypeLabel(project) {
  if (project.client_name) return 'Client work'
  if (project.category === 'ai') return 'Internal product / prototype'
  return 'Personal project'
}

export async function fetchCoreProjects({ limit } = {}) {
  let query = supabase
    .from('projects')
    .select(
      'id,title,description,category,status,image_url,tech_stack,github_url,live_demo_url,client_name,is_featured,display_order'
    )
    .order('display_order')

  if (limit) query = query.limit(limit)

  const { data, error } = await query
  if (error) throw error
  return data || []
}
