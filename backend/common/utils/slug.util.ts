// src/common/utils/slug.util.ts
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Tách dấu ra khỏi chữ gốc
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/[đĐ]/g, 'd')
    .replace(/([^a-z0-8\s-])/g, '') // Xóa ký tự đặc biệt
    .trim()
    .replace(/[\s-]+/g, '-') // Thay khoảng trắng bằng dấu -
    .replace(/^-+|-+$/g, ''); // Xóa dấu - thừa ở đầu/cuối
}