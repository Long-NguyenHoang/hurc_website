import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractBaseEntity } from "./base.entity";
import { ContactStatus, Subject } from "common/enums";
import { User } from "./users.entity";

@Entity('contacts')
export class Contact extends AbstractBaseEntity {
    @Column({ type: 'varchar' })
    full_name: string;

    @Column({ type: 'varchar', nullable: true })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    phone: string;

    @Column({ type: 'enum', enum: Subject, default: Subject.FEEDBACK })
    subject: Subject;

    @Column({ type: 'text' })
    message: string;

    @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.PENDING })
    status: ContactStatus;

    // --- Foreign Keys ---
    @ManyToOne(() => User)
    @JoinColumn({ name: 'resolved_by' })
    resolved_by_user: User;
}