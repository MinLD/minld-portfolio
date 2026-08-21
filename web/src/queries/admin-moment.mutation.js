import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { momentKeys } from './admin-moment.query'
import { createMoment, updateMoment } from '../services/admin-moment.service'
import { deleteAdminMomentApi } from '../api/admin-moment'

export function useCreateMomentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMoment,
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: momentKeys.lists(),
      })
    },
  })
}

export function useUpdateMomentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateMoment(id, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: momentKeys.lists(),
      })
    },
  })
}

export function useDeleteMomentMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }) => deleteAdminMomentApi(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: momentKeys.lists(),
      })
    },
  })
}
