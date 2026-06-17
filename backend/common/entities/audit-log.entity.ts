import { AuditAction } from "common/enums";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', nullable: true })
    actor_id: string;

    @Column({ type: 'varchar', })
    actor_email: string;

    @Column({ type: 'enum', enum: AuditAction })
    action: AuditAction;

    @Column({ type: 'varchar' })
    entity_name: string;

    @Column({ type: 'varchar' })
    entity_id: string;

    @Column({ type: 'jsonb', nullable: true })
    old_values: any;

    @Column({ type: 'jsonb', nullable: true })
    new_values: any;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}