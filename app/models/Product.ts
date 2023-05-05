import { Expose } from "class-transformer"
import { IsDefined, IsEnum, IsString} from "class-validator"
import { CommonEventValidator } from "./eventValidators/CommonEventValidators"

export interface IProduct{
    name:string;
    description?:string;
    price:number;
    isVisibleInMenu:boolean;
    assetKey?:string;
}


export class DeleteProductEventValidator extends CommonEventValidator {
    @Expose()
    @IsDefined()
    @IsString()
    id: string

    @Expose()
    @IsDefined()
    @IsString()
    categoryId: string
}


export interface IProductPrimaryKeyParams {
    locationId: string,
    categoryId:string,
    id: string,
}