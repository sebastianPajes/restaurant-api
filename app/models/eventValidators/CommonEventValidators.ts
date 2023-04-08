import { Expose } from 'class-transformer'
import { IsBoolean, IsDefined, IsOptional, IsString } from 'class-validator'

export class CommonEventValidator {
    @Expose()
    @IsDefined()
    @IsString()
    locationId: string
    
    @Expose()
    @IsOptional()
    @IsString()
    employeeId: string

    @Expose()
    @IsDefined()
    @IsBoolean()
    isInternal: boolean
}

export class CommonEventByIdValidator extends CommonEventValidator {
    @Expose()
    @IsDefined()
    @IsString()
    id: string
}