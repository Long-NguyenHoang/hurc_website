import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Station } from "common/entities/stations.entity";
import { MediaModule } from "../media/media.module";
import { StationsController } from "./stations.controller";
import { StationsService } from "./stations.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Station]),
        MediaModule,
    ],
    controllers: [StationsController],
    providers: [StationsService],
})

export class StationsModule { }