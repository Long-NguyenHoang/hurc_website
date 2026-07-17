import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors, Query } from "@nestjs/common";
import { StationsService } from "./stations.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "common/decorators/roles.decorator";
import { UserRole } from "common/enums";
import { FileInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "common/config/multer.config";
import { CreateStationDto } from "./dto/create-station.dto";
import { UpdateStationDto } from "./dto/update-station.dto";


@Controller('stations')
export class StationsController {
    constructor(
        private readonly stationsService: StationsService,
    ) { }


    @Get('schedule')
    findAllSchedule() {
        return this.stationsService.findAllSchedule();
    }


    @Get('content')
    findAllContent() {
        return this.stationsService.findAllContent();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    @Get('detail/:id')
    findOnePublic(@Param('id') id: string) {
        return this.stationsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Post()
    @UseInterceptors(FileInterceptor('file', multerOptions))
    create(@Request() req, @Body() createStationDto: CreateStationDto, @UploadedFile() file?: Express.Multer.File) {
        return this.stationsService.create(createStationDto, req.user.id, file);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    @Get('admin/all')
    findAllAdmin(@Query('search') search?: string) {
        return this.stationsService.findAllAdmin(search);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.EDITOR)
    @Patch(':id')
    @UseInterceptors(FileInterceptor('file', multerOptions))
    update(@Request() req, @Param('id') id: string, @Body() updateStationDto: UpdateStationDto, @UploadedFile() file?: Express.Multer.File) {
        return this.stationsService.update(id, updateStationDto, req.user.id, file);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.stationsService.remove(id);
    }
}