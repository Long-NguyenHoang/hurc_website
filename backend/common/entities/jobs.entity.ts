import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractBaseEntity } from "./base.entity";
import { Department, JobStatus, JobType } from "common/enums";
import { User } from "./users.entity";

@Entity('jobs')
export class Job extends AbstractBaseEntity {
    @Column({ type: 'varchar' })
    title: string;

    @Column({ type: 'varchar', unique: true })
    slug: string;

    @Column({ type: 'enum', enum: Department })
    department: Department;

    @Column({ type: 'varchar', nullable: true })
    location: string;

    @Column({ type: 'enum', enum: JobType })
    job_type: JobType;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'text' })
    requirements: string;

    @Column({ type: 'text', nullable: true })
    benefits: string;

    @Column({ type: 'date' })
    deadline: string;

    @Column({ type: 'enum', enum: JobStatus, default: JobStatus.OPEN })
    status: JobStatus;

    // --- Foreign Keys ---
    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    created_by_user: User
}