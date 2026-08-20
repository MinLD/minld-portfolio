import { computed } from 'vue'

import { keepPreviousData, useQuery } from '@tanstack/vue-query'

import { getProjectRelations, getProjects } from '@/services/admin-project.service'

export const projectKeys = {
  all: ['admin-projects'],
  lists: () => [...projectKeys.all, 'list'],

  list: (params) => [...projectKeys.lists(), params],

  relations: () => [...projectKeys.all, 'relations'],
}

export function useProjectsQuery({ page, limit, search, status }) {
  const params = computed(() => {
    const value = {
      page: page.value,
      limit: limit.value,
    }

    const searchValue = search.value.trim()

    if (searchValue) {
      value.search = searchValue
    }

    if (status.value && status.value !== 'all') {
      value.status = status.value
    }

    return value
  })

  return useQuery({
    queryKey: computed(() => projectKeys.list(params.value)),

    queryFn: () => getProjects(params.value),

    placeholderData: keepPreviousData,

    staleTime: 30 * 1000,
  })
}

export function useProjectRelationsQuery() {
  return useQuery({
    queryKey: projectKeys.relations(),

    queryFn: getProjectRelations,

    staleTime: 5 * 60 * 1000,
  })
}
