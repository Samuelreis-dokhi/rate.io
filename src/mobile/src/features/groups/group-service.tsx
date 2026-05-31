import { request } from '@/services/api-client'

export interface GroupMember {
  userId: string
  role: 'admin' | 'member'
  joinedAt: string
}

export interface Group {
  _id: string
  name: string
  description?: string
  createdBy: string
  members: GroupMember[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateGroupPayload {
  name: string
  description?: string
  createdBy: string
  membersIds?: string[]
}

export function getUserGroups(userId: string): Promise<Group[]> {
  return request(`/api/groups/user/${userId}`)
}

export function createGroup(payload: CreateGroupPayload): Promise<Group> {
  return request('/api/groups', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
