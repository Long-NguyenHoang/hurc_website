import { Controller, Get, Param, UseGuards, Query } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "common/decorators/roles.decorator";
import { UserRole } from "common/enums";
import { AuditLogsService } from "./audit-logs.service";
import { PaginationDto } from "common/dto/pagination.dto";

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditLogsController {
    constructor(
        private readonly auditLogsService: AuditLogsService
    ) { }

    @Get()
    async findAll(@Query() paginationDto: PaginationDto) {
        return this.auditLogsService.findAll(paginationDto);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.auditLogsService.findOne(id);
    }
}