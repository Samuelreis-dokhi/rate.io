/**
 * O objeto pode vir em formatos diferentes dependendo do estado do bootstrap.
 * Este Helper garante que sempre extraímos o _id correto.
 */

export function resolveUserId(user: Record<string, unknown> | null): string{
    if(!user) return ''
    return String(
        user._id ??
        user.id ??
        (user.user as Record<string, unknown>)?._id ??
        ''
    )
}