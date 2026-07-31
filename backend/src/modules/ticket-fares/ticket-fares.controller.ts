import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors, Query, BadRequestException } from "@nestjs/common";
import { TicketFaresService } from "./ticket-fares.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "common/decorators/roles.decorator";
import { UserRole } from "common/enums";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "common/config/multer.config";
import { CreateTicketFareDto } from "./dto/create-ticket-fare.dto";
import { UpdateTicketFareDto } from "./dto/update-ticket-fare.dto";


@Controller('ticket-fares')
export class TicketFaresController {
    constructor(
        private readonly ticketFaresService: TicketFaresService,
    ) { }

    @Get()
    findPrice(@Query('from') from: string, @Query('to') to: string) {
        if (!from || !to) {
            throw new BadRequestException('Vui lòng chọn ga đi và ga đến');
        }

        return this.ticketFaresService.getTicketFare(from, to);
    }
}