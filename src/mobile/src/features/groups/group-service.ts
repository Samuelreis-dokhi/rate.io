// src/mobile/src/features/groups/group-service.ts
import { request } from '../../../services/api-client'

export interface GroupMember {
  userId: string
  role: 'admin' | 'member'
  joinedAt: string
}

export interface Group {
  _id: string; name: string; description?: string
  createdBy: string; members: GroupMember[]; isActive: boolean; createdAt: string
}

export interface Activity {
  _id: string; groupId: string; actorUserId: string; type: string
  message: string; createdAt: string
}

export function getUserGroups(userId: string): Promise<Group[]> {
  return request(`/api/groups/user/${userId}`)
}

export function createGroup(payload: {
  name: string; description?: string; createdBy: string; membersIds?: string[]
}): Promise<Group> {
  return request('/api/groups', { method: 'POST', body: JSON.stringify(payload) })
}

export function inviteToGroup(groupId: string, payload: {
  email: string; addedBy: string
}): Promise<Group> {
  return request(`/api/groups/${groupId}/invite`, { method: 'POST', body: JSON.stringify(payload) })
}

export function getGroupActivities(groupId: string, userId: string, limit = 50): Promise<Activity[]> {
  return request(`/api/groups/${groupId}/activities?userId=${userId}&limit=${limit}`)
}

export function deleteGroup(groupId: string, userId: string): Promise<{ message: string }> {
  return request(`/api/groups/${groupId}`, { method: 'DELETE', body: JSON.stringify({ userId }) })
}