import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractBaseEntity } from "./base.entity";
import { Media } from "./media.entity";

@Entity('ticket_fares')
export class TicketFare extends AbstractBaseEntity {
    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'int', default: 0 })
    display_order: number;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @ManyToOne(() => Media)
    @JoinColumn({ name: 'image_id' })
    image: Media;
}