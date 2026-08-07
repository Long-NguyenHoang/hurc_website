import { Controller, Get, Query, BadRequestException } from "@nestjs/common";
import { TicketFaresService } from "./ticket-fares.service";


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