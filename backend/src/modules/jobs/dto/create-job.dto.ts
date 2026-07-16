import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { Department, JobStatus, JobType } from "common/enums";

export class CreateJobDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsEnum(Department)
    @IsNotEmpty()
    department: Department;

    @IsString()
    @IsOptional()
    location?: string;

    @IsEnum(JobType)
    @IsNotEmpty()
    job_type: JobType;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsString()
    @IsNotEmpty()
    requirements: string;

    @IsString()
    @IsOptional()
    benefits?: string;

    @IsDateString()
    @IsNotEmpty()
    deadline: string;

    @IsEnum(JobStatus)
    @IsOptional()
    status?: JobStatus;
}
