export enum UserRole {
    ADMIN = 'ADMIN',
    EDITOR = 'EDITOR',
}

export enum ArticleStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED'
}

export enum JobType {
    FULL_TIME = 'FULL_TIME',
    PART_TIME = 'PART_TIME',
    INTERN = 'INTERN',
}

export enum JobStatus {
    OPEN = 'OPEN',
    CLOSED = 'CLOSED',
}

export enum ContactStatus {
    PENDING = 'PENDING',
    RESOLVED = 'RESOLVED',
}

export enum Department {
    HCTC = 'HCTC',
    KHTC = 'KHTC',
    KDQHCC = 'KDQHCC',
    KTAT = 'KTAT',
    VTTBDV = 'VTTBDV',
    XNBD = 'XNBD',
    XNVH = 'XNVH',
}

export enum Subject {
    FEEDBACK = 'FEEDBACK',
    LOST_ITEMS = 'LOST_ITEMS',
}

export enum AuditAction {
    CREATE = 'CREATE',
    UPDATE = 'UPDATE',
    DELETE = 'DELETE',
}