import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('blacklisted_tokens')
export class BlacklistedToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })
    token: string;

    @Column({ type: 'timestamp' })
    expires_at: Date;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;
}