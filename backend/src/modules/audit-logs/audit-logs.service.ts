import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationDto } from "common/dto/pagination.dto";
import { AuditLog } from "common/entities/audit-log.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuditLogsService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) { }

    async findAll(paginationDto: PaginationDto) {
        const { page = 1, limit = 20 } = paginationDto;
        const [auditLogs, total] = await this.auditLogRepository.findAndCount({
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return { data: auditLogs, meta: { total, page, limit, lastPage: Math.ceil(total / limit) } };
    }

    async findOne(id: string) {
        const log = await this.auditLogRepository.findOne({ where: { id } });
        if (!log) {
            throw new NotFoundException('Không tìm thấy bản ghi log này')
        }

        return log;
    }
}