/**
 * O objeto pode vir em formatos diferentes dependendo do estado do bootstrap.
 * Este Helper garante que sempre extraímos o _id correto.
 */

export function resolveUserId(user: unknown): string {
    if (!user || typeof user !== 'object') return ''
    const record = user as Record<string, unknown>
    return String(
        record._id ??
        record.id ??
        (record.user as Record<string, unknown>)?._id ??
        ''
    )
}