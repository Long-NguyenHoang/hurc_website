'use server';

import { revalidatePath } from 'next/cache';

/**
 * Xóa bộ nhớ đệm (Cache) của Next.js cho một đường dẫn cụ thể.
 * Được gọi từ Client Component (Admin) sau khi có thay đổi dữ liệu.
 */
export async function clearCacheByPath(path: string, type?: 'page' | 'layout') {
    revalidatePath(path, type);
    console.log(`[Cache Cleared] Đã xóa cache cho: ${path} (type: ${type || 'default'})`);
}
