import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TicketFare } from "common/entities/ticket_fare.entity";
import { MediaModule } from "../media/media.module";
import { TicketFaresController } from "./ticket-fares.controller";
import { TicketFaresService } from "./ticket-fares.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([TicketFare]),
        MediaModule,
    ],
    controllers: [TicketFaresController],
    providers: [TicketFaresService]
})
export class TicketFaresModule { }