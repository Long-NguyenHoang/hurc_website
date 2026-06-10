import { Column, Entity, OneToMany } from "typeorm";
import { AbstractBaseEntity } from "./base.entity";
import { UserRole } from "common/enums";
import { Media } from "./media.entity";
import { Article } from "./articles.entity";

@Entity('users')
export class User extends AbstractBaseEntity {
    @Column({ type: 'varchar', unique: true })
    email: string;

    @Column({ type: 'varchar' })
    password: string;

    @Column({ type: 'varchar' })
    full_name: string;

    @Column({ type: 'enum', enum: UserRole, default: UserRole.ADMIN })
    role: UserRole;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    // --- Relations ---
    @OneToMany(() => Media, (media) => media.uploaded_by_user)
    uploaded_media: Media[];

    @OneToMany(() => Article, (article) => article.author)
    articles: Article[];
}