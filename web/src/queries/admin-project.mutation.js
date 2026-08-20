import { useMutation, useQueryClient } from '@tanstack/vue-query'

import { createProject, deleteProject, updateProject } from '@/services/admin-project.service'

import { projectTagService } from '@/services/project-tag.service'
import { technologyService } from '@/services/technology.service'

import { projectKeys } from './admin-project.query'

export function useCreateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      })
    },
  })
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }) => updateProject(id, data),

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      })
    },
  })
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProject,

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: projectKeys.lists(),
      })
    },
  })
}

export function useCreateProjectTagMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: projectTagService.create,

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: projectKeys.relations(),
      })
    },
  })
}

export function useCreateTechnologyMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: technologyService.create,

    onSuccess: () => {
      return queryClient.invalidateQueries({
        queryKey: projectKeys.relations(),
      })
    },
  })
}
