import { computed } from 'vue'

import { keepPreviousData, useQuery } from '@tanstack/vue-query'
import { getMoment, getMomentRelations } from '../services/admin-moment.service'

export const momentKeys = {
  all: ['admin-moment'],

  lists: () => [...momentKeys.all, 'list'],

  list: (params) => [...momentKeys.lists(), params],

  relations: () => [...momentKeys.all, 'relations'],
}
export function useMomentsQuery({ page, limit, search, status }) {
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
    queryKey: computed(() => momentKeys.list(params.value)),
    queryFn: () => getMoment(params.value),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}
export function useMomentRelationsQuery() {
  return useQuery({
    queryKey: momentKeys.relations(),
    queryFn: getMomentRelations,
    staleTime: 5 * 60 * 1000,
  })
}
