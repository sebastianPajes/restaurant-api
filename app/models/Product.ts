
export interface IProduct{
    locationId:string;
    categoryId:string;
    name:string;
    description?:string;
    price:number;
    isVisibleInMenu:boolean;
    assetKey?:string;
}