import {
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
} from 'typeorm';

export abstract class AbstractBaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ type: 'timestamp' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    // Tính năng Soft Delete: Khi xóa, TypeORM sẽ tự động điền thời gian vào cột này thay vì xóa vật lý
    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deleted_at: Date;
}