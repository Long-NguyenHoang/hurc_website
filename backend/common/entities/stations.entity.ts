import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { AbstractBaseEntity } from "./base.entity";
import { Media } from "./media.entity";
import { TicketFare } from "./ticket_fare.entity";

@Entity('stations')
export class Station extends AbstractBaseEntity {
    @Column({ type: 'varchar', unique: true })
    name: string;

    @Column({ type: 'varchar', unique: true })
    code: string;

    @Index()
    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'int', default: 0 })
    display_order: number;

    @Index()
    @ManyToOne(() => Media, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'schedule_image_id' })
    schedule_image: Media | null;

    @OneToMany(() => TicketFare, ticketFare => ticketFare.from_station)
    ticket_fares_from: TicketFare[];

    @OneToMany(() => TicketFare, ticketFare => ticketFare.to_station)
    ticket_fares_to: TicketFare[];
}