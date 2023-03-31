import { Expose } from 'class-transformer'
import { IsDefined, IsString } from 'class-validator'

export class CommonEventValidator {
    @Expose()
    @IsDefined()
    @IsString()
    locationId: string
    
    @Expose()
    @IsDefined()
    @IsString()
    employeeId: string
}

export class CommonEventByIdValidator extends CommonEventValidator {
    @Expose()
    @IsDefined()
    @IsString()
    id: string
}