import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { AbstractBaseEntity } from "./base.entity";
import { User } from "./users.entity";
import { Article } from "./articles.entity";
import { Banner } from "./banners.entity";

@Entity('media')
export class Media extends AbstractBaseEntity {
    @Column({ type: 'varchar' })
    file_name: string;

    @Column({ type: 'varchar' })
    original_name: string;

    @Column({ type: 'varchar' })
    mime_type: string;

    @Column({ type: 'int' })
    size: number;

    @Column({ type: 'varchar' })
    url: string;

    // --- Foreign Keys ---
    @ManyToOne(() => User, (user) => user.uploaded_media)
    @JoinColumn({ name: 'uploaded_by' })
    uploaded_by_user: User;

    @OneToMany(() => Article, (article) => article.thumbnail)
    articles: Article[];

    @OneToMany(() => Banner, (banner) => banner.image)
    banners: Banner[];
}