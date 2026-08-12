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

async function findOwnComment(id: string, userId: string) {
  const comment = await projectCommentRepository.findById(id)
  if (!comment) throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment not found')
  if (comment.userId !== userId) throw new AppError(403, 'FORBIDDEN', 'Forbidden')
  return comment
}

export async function updateOwnProjectComment(id: string, userId: string, input: { content: string }) {
  await findOwnComment(id, userId)
  return { comment: toProjectCommentDto(await projectCommentRepository.update(id, input)) }
}

export async function deleteOwnProjectComment(id: string, userId: string) {
  await findOwnComment(id, userId)
  await projectCommentRepository.delete(id)
}

async function findCommentOrThrow(id: string) {
  const comment = await projectCommentRepository.findById(id)
  if (!comment) throw new AppError(404, 'COMMENT_NOT_FOUND', 'Comment not found')
  return comment
}

export async function listAdminProjectComments() {
  return { comments: (await projectCommentRepository.findMany()).map(toProjectCommentDto) }
}

export async function updateProjectCommentStatus(id: string, input: { status: 'VISIBLE' | 'HIDDEN' }) {
  await findCommentOrThrow(id)
  return { comment: toProjectCommentDto(await projectCommentRepository.updateStatus(id, input.status)) }
}

export async function deleteAdminProjectComment(id: string) {
  await findCommentOrThrow(id)
  await projectCommentRepository.delete(id)
}
