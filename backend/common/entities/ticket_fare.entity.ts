import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractBaseEntity } from "./base.entity";
import { Station } from "./stations.entity";

@Entity('ticket_fares')
export class TicketFare extends AbstractBaseEntity {

    @Column({ type: 'int', default: 0 })
    price: number;

    @ManyToOne(() => Station, station => station.ticket_fares_from, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'from_station_id' })
    from_station: Station;

    @ManyToOne(() => Station, station => station.ticket_fares_to, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'to_station_id' })
    to_station: Station;
}