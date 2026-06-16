import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Station } from "common/entities/stations.entity";
import { User } from "common/entities/users.entity";
import { UserRole } from "common/enums";
import { Repository } from "typeorm";
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
    private readonly logger = new Logger(SeederService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Station)
        private readonly stationRepository: Repository<Station>
    ) { }

    async onApplicationBootstrap() {
        this.logger.log('Đang kiểm tra và khởi tạo dữ liệu cơ bản (Seeding)...')

        await this.seedAdminUser();
        await this.seedStations();

        this.logger.log('Quá trình Seeding hoàn tất!');
    }

    private async seedAdminUser() {
        const adminEmail = 'admin@hurc.vn'; // Email gốc của hệ thống

        // Kiểm tra xem admin đã tồn tại chưa
        const existingAdmin = await this.userRepository.findOne({ where: { email: adminEmail } });

        if (!existingAdmin) {
            this.logger.log('Chưa có tài khoản Admin. Đang tiến hành tạo mới...');

            const hashedPassword = await bcrypt.hash('Hurc@123', 10);

            const newAdmin = this.userRepository.create({
                email: adminEmail,
                password: hashedPassword,
                full_name: 'Super Admin',
                role: UserRole.ADMIN,
                is_active: true,
            });

            await this.userRepository.save(newAdmin);
            this.logger.log(`Đã tạo tài khoản Admin thành công: ${adminEmail}`);
        }
    }

    private async seedStations() {
        // Đếm xem trong bảng đã có ga nào chưa
        const stationCount = await this.stationRepository.count();

        if (stationCount === 0) {
            this.logger.log('Chưa có dữ liệu nhà ga. Đang tiến hành tạo 14 nhà ga tuyến số 1...');

            const stationsData = [
                {
                    name: 'Ga Bến Thành',
                    code: 'S01',
                    display_order: 1,
                },
                {
                    name: 'Ga Nhà hát Thành phố',
                    code: 'S02',
                    display_order: 2,
                },
                {
                    name: 'Ga Ba Son',
                    code: 'S03',
                    display_order: 3,
                },
                {
                    name: 'Ga Văn Thánh',
                    code: 'S04',
                    display_order: 4,
                },
                {
                    name: 'Ga Tân Cảng',
                    code: 'S05',
                    display_order: 5,
                },
                {
                    name: 'Ga Thảo Điền',
                    code: 'S06',
                    display_order: 6,
                },
                {
                    name: 'Ga An Phú',
                    code: 'S07',
                    display_order: 7,
                },
                {
                    name: 'Ga Rạch Chiếc',
                    code: 'S08',
                    display_order: 8,
                },
                {
                    name: 'Ga Phước Long',
                    code: 'S09',
                    display_order: 9,
                },
                {
                    name: 'Ga Bình Thái',
                    code: 'S10',
                    display_order: 10,
                },
                {
                    name: 'Ga Thủ Đức',
                    code: 'S11',
                    display_order: 11,
                },
                {
                    name: 'Ga Khu Công nghệ cao',
                    code: 'S12',
                    display_order: 12,
                },
                {
                    name: 'Ga Đại học Quốc Gia',
                    code: 'S13',
                    display_order: 13,
                },
                {
                    name: 'Ga Bến xe Suối Tiên',
                    code: 'S14',
                    display_order: 14,
                },
            ];

            // Insert hàng loạt (Bulk Insert) để tối ưu hiệu năng Database
            await this.stationRepository.insert(stationsData);

            this.logger.log('Đã tạo thành công 14 nhà ga!');
        }
    }
}