import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractBaseEntity } from "./base.entity";
import { ArticleStatus } from "common/enums";
import { Media } from "./media.entity";
import { User } from "./users.entity";

@Entity('articles')
export class Article extends AbstractBaseEntity {
    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'varchar', unique: true })
    slug: string;

    @Column({ type: 'varchar', nullable: true })
    summary: string;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'enum', enum: ArticleStatus, default: ArticleStatus.DRAFT })
    status: ArticleStatus;

    @Column({ type: 'timestamp', nullable: true })
    published_at: Date | null;

    // --- Foreign Keys ---
    @ManyToOne(() => Media, (media) => media.articles)
    @JoinColumn({ name: 'thumbnail_id' })
    thumbnail: Media;

    @ManyToOne(() => User, (user) => user.articles)
    @JoinColumn({ name: 'author_id' })
    author: User;
}