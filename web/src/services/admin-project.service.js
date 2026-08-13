import {
  createAdminProjectApi,
  deleteAdminProjectApi,
  deleteProjectThumbnailApi,
  getAdminProjectApi,
  listAdminCategoriesApi,
  listAdminProjectsApi,
  listAdminTechnologiesApi,
  updateAdminProjectApi,
  uploadProjectThumbnailApi,
} from '@/api/admin-project'

export async function getProjects() {
  const data = await listAdminProjectsApi()

  return data.projects
}

export async function getProject(id) {
  const data = await getAdminProjectApi(id)

  return data.project
}

export async function createProject(payload) {
  const data = await createAdminProjectApi(payload)

  return data.project
}

export async function updateProject(id, payload) {
  const data = await updateAdminProjectApi(id, payload)

  return data.project
}

export async function deleteProject(id) {
  return deleteAdminProjectApi(id)
}

export async function uploadThumbnail(id, file) {
  const data = await uploadProjectThumbnailApi(id, file)

  return data.project
}

export async function deleteThumbnail(id) {
  return deleteProjectThumbnailApi(id)
}

export async function getProjectRelations() {
  const [categoryData, technologyData] = await Promise.all([
    listAdminCategoriesApi(),
    listAdminTechnologiesApi(),
  ])

  return {
    categories: categoryData.categories,
    technologies: technologyData.technologies,
  }
}
