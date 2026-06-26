import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { AbstractBaseEntity } from "./base.entity";
import { Media } from "./media.entity";
import { User } from "./users.entity";

@Entity('banners')
export class Banner extends AbstractBaseEntity {
    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'varchar', nullable: true })
    redirect_url: string;

    @Column({ type: 'int', default: 0 })
    display_order: number;

    @Index()
    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    // --- Foreign Keys ---
    @ManyToOne(() => Media, (media) => media.banners, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'image_id' })
    image: Media | null;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by_user: User;
}