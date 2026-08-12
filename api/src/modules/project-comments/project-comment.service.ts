import { AppError } from '../../common/errors/AppError.js'
import { projectRepository } from '../projects/project.repository.js'
import { toProjectCommentDto } from './project-comment.mapper.js'
import { projectCommentRepository } from './project-comment.repository.js'

async function findPublishedProject(slug: string) {
  const project = await projectRepository.findPublishedBySlug(slug)
  if (!project) throw new AppError(404, 'PROJECT_NOT_FOUND', 'Project not found')
  return project
}

export async function listProjectComments(slug: string) {
  const project = await findPublishedProject(slug)
  return { comments: (await projectCommentRepository.findVisibleByProjectId(project.id)).map(toProjectCommentDto) }
}

export async function createProjectComment(slug: string, userId: string, input: { content: string }) {
  const project = await findPublishedProject(slug)
  return { comment: toProjectCommentDto(await projectCommentRepository.create({ projectId: project.id, userId, content: input.content })) }
}
