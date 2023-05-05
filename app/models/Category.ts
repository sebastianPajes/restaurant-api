import { Expose, Type } from "class-transformer"
import { IsBoolean, IsDefined, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, ValidateNested } from "class-validator"
import { CommonEventValidator } from "./eventValidators/CommonEventValidators"

export interface ICategory{
    name:string;
    description?:string;
    isVisibleInMenu:boolean;
    assetKey?:string;
}



export interface ICategoryPrimaryKeyParams {
    locationId: string,
    id: string,
}