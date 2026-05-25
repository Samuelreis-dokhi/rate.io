// src/mobile/src/features/groups/group-service.ts
import { request } from '@/services/api-client'
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

export function getGroupActivities(groupId: string, userId: string, limit = 50): Promise<Activity[]> {
  return request(`/api/groups/${groupId}/activities?userId=${userId}&limit=${limit}`)
}