import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuditLog } from "common/entities/audit-log.entity";
import { AuditLogsController } from "./audit-logs.controller";
import { AuditLogsService } from "./audit-logs.service";
import { AuditLogSubscriber } from "./audit-log.subscriber";


@Module({
    imports: [TypeOrmModule.forFeature([AuditLog])],
    controllers: [AuditLogsController],
    providers: [
        AuditLogsService,
        AuditLogSubscriber
    ]
})
export class AuditLogsModule { }