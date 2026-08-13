export const projectStatusOptions = [
  {
    label: 'Draft',
    value: 'DRAFT',
  },
  {
    label: 'Published',
    value: 'PUBLISHED',
  },
  {
    label: 'Archived',
    value: 'ARCHIVED',
  },
]

export const projectStatusStyles = {
  DRAFT: 'border-amber-900/70 bg-amber-950/40 text-amber-400',

  PUBLISHED: 'border-emerald-900/70 bg-emerald-950/40 text-emerald-400',

  ARCHIVED: 'border-zinc-700 bg-zinc-800 text-zinc-400',
}

export const technologyTypeOrder = ['LANGUAGE', 'FRAMEWORK', 'LIBRARY', 'DATABASE', 'TOOL', 'OTHER']

export const technologyTypeLabels = {
  LANGUAGE: 'Languages',
  FRAMEWORK: 'Frameworks',
  LIBRARY: 'Libraries',
  DATABASE: 'Databases',
  TOOL: 'Tools',
  OTHER: 'Other',
}
