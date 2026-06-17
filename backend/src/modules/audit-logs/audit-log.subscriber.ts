import { Injectable } from '@nestjs/common';
import { DataSource, EntitySubscriberInterface, EventSubscriber, InsertEvent, UpdateEvent, RemoveEvent } from 'typeorm';
import { ClsService } from 'nestjs-cls';
import { AuditAction } from 'common/enums';
import { AuditLog } from 'common/entities/audit-log.entity';

@Injectable()
@EventSubscriber()
export class AuditLogSubscriber implements EntitySubscriberInterface {
    private readonly IGNORED_ENTITIES = ['AuditLog', 'BlacklistedToken'];
    // --- KHAI BÁO DANH SÁCH CÁC TRƯỜNG NHẠY CẢM CẦN CHE ---
    private readonly SENSITIVE_FIELDS = ['password', 'token'];

    constructor(
        private dataSource: DataSource,
        private readonly cls: ClsService,
    ) {
        // Đăng ký subscriber này với TypeORM
        this.dataSource.subscribers.push(this);
    }

    // --- 1. Lắng nghe sự kiện TẠO MỚI (CREATE) ---
    async afterInsert(event: InsertEvent<any>) {
        if (this.IGNORED_ENTITIES.includes(event.metadata.targetName)) return;

        await this.logEvent(event, AuditAction.CREATE, null, event.entity);
    }

    // --- 2. Lắng nghe sự kiện CẬP NHẬT (UPDATE) ---
    async afterUpdate(event: UpdateEvent<any>) {
        if (this.IGNORED_ENTITIES.includes(event.metadata.targetName)) return;
        if (!event.entity) return;

        // event.databaseEntity chứa dữ liệu cũ trong DB
        // event.entity chứa dữ liệu mới vừa cập nhật
        await this.logEvent(event, AuditAction.UPDATE, event.databaseEntity, event.entity);
    }

    // --- 3. Lắng nghe sự kiện XÓA (DELETE / SOFT DELETE) ---
    async afterRemove(event: RemoveEvent<any>) {
        if (this.IGNORED_ENTITIES.includes(event.metadata.targetName)) return;

        await this.logEvent(event, AuditAction.DELETE, event.databaseEntity || event.entity, null);
    }

    async afterSoftRemove(event: UpdateEvent<any>) {
        if (this.IGNORED_ENTITIES.includes(event.metadata.targetName)) return;
        await this.logEvent(event, AuditAction.DELETE, event.databaseEntity, null);
    }

    // --- HÀM CHE DỮ LIỆU ---
    private sanitizeData(data: any): any {
        if (!data) return data;

        const sanitized = { ...data }

        for (const field of this.SENSITIVE_FIELDS) {
            if (sanitized[field] !== undefined) {
                sanitized[field] = '***[HIDDEN]***';
            }
        }
        return sanitized;
    }

    // --- HÀM XỬ LÝ CHUNG ---
    private async logEvent(event: any, action: AuditAction, oldValues: any, newValues: any) {
        // Lấy thông tin user đang đăng nhập từ đường hầm CLS
        const user = this.cls.get('user');

        const auditLog = new AuditLog();
        auditLog.actor_id = user?.id || 'SYSTEM'; // Nếu hệ thống tự chạy thì ghi là SYSTEM
        auditLog.actor_email = user?.email || 'SYSTEM';
        auditLog.action = action;
        auditLog.entity_name = event.metadata.targetName;

        // Cố gắng trích xuất ID của bản ghi
        auditLog.entity_id = newValues?.id || oldValues?.id || 'N/A';

        auditLog.old_values = this.sanitizeData(oldValues);
        auditLog.new_values = this.sanitizeData(newValues);

        // Lưu trực tiếp vào Database
        await event.manager.getRepository(AuditLog).save(auditLog);
    }
}