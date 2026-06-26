import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { TicketFaresService } from "./ticket-fares.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "common/decorators/roles.decorator";
import { UserRole } from "common/enums";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "common/config/multer.config";
import { CreateTicketFareDto } from "./dto/create-ticket-fare.dto";
import { UpdateTicketFareDto } from "./dto/update-ticket-fare.dto";
import { CacheInterceptor } from "@nestjs/cache-manager";

@Controller('ticket-fares')
export class TicketFaresController {
    constructor(
        private readonly ticketFaresService: TicketFaresService,
    ) { }

    @UseInterceptors(CacheInterceptor)
    @Get()
    findAllPublic() {
        return this.ticketFaresService.findAllPublic();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    @Get('admin/all')
    findAllAdmin() {
        return this.ticketFaresService.findAllAdmin();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    @Get('admin/:id')
    findOne(@Param('id') id: string) {
        return this.ticketFaresService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    @Post()
    @UseInterceptors(FileInterceptor('file', multerOptions))
    create(@Request() req, @Body() createTicketFareDto: CreateTicketFareDto, @UploadedFile() file?: Express.Multer.File) {
        return this.ticketFaresService.create(createTicketFareDto, req.user.id, file);
    }


    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    @Patch(':id')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    update(@Request() req, @Param('id') id: string, @Body() updateTicketFareDto: UpdateTicketFareDto, @UploadedFile() file?: Express.Multer.File) {
        return this.ticketFaresService.update(id, updateTicketFareDto, req.user.id, file);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.ticketFaresService.remove(id);
    }
}