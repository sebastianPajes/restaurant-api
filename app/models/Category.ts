
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