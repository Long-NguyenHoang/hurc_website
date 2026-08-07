import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TicketFare } from "common/entities/ticket_fare.entity";
import { Repository } from "typeorm";
import { StationsService } from "../stations/stations.service";

@Injectable()
export class TicketFaresService {
    constructor(
        @InjectRepository(TicketFare)
        private readonly ticketFaresRepository: Repository<TicketFare>,
        private readonly stationService: StationsService,
        // private readonly mediaService: MediaService,
    ) { }

    async getTicketFare(fromId: string, toId: string) {
        const fromStation = await this.stationService.findOne(fromId);
        const toStation = await this.stationService.findOne(toId);

        if (!fromStation || !toStation) {
            throw new NotFoundException('Không tìm thấy mã nhà ga hợp lệ');
        }

        if (fromId === toId) {
            return {
                price: 0,
                path: [fromStation]
            };
        }

        const ticketInfo = await this.ticketFaresRepository.findOne({
            where: [
                { from_station: { id: fromId }, to_station: { id: toId } },
                { from_station: { id: toId }, to_station: { id: fromId } },
            ]
        });
        const price = ticketInfo ? ticketInfo.price : 0;

        const isForward = fromStation.display_order < toStation.display_order;
        const minOrder = isForward ? fromStation.display_order : toStation.display_order;
        const maxOrder = isForward ? toStation.display_order : fromStation.display_order;

        const pathStations = await this.stationService.findAllStationBetween(minOrder, maxOrder, isForward);

        return {
            price,
            pathStations
        };
    }

}