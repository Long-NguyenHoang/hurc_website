import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractBaseEntity } from "./base.entity";
import { Media } from "./media.entity";

@Entity('stations')
export class Station extends AbstractBaseEntity {
    @Column({ type: 'varchar', unique: true })
    name: string;

    @Column({ type: 'varchar', unique: true })
    code: string;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'int', default: 0 })
    display_order: number;

    @ManyToOne(() => Media, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'schedule_image_id' })
    schedule_image: Media | null;
}