import prisma from 'wasp/server/dbClient.js'
import {
  updateTask as updateTaskUser,
  createTask as createTaskUser,
  deleteTasks as deleteTasksUser,
} from 'wasp/ext-src/actions.js'

export type UpdateTask = typeof updateTask

export const updateTask = async (args, context) => {
  return (updateTaskUser as any)(args, {
    ...context,
    entities: {
      Task: prisma.task,
    },
  })
}

export type CreateTask = typeof createTask

export const createTask = async (args, context) => {
  return (createTaskUser as any)(args, {
    ...context,
    entities: {
      Task: prisma.task,
    },
  })
}

export type DeleteTasks = typeof deleteTasks

export const deleteTasks = async (args, context) => {
  return (deleteTasksUser as any)(args, {
    ...context,
    entities: {
      Task: prisma.task,
    },
  })
}
