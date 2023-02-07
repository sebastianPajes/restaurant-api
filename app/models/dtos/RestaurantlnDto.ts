export interface ICreateRestaurantEvent {
    Payload: {
        body: string
    }
}

export interface ICreateRestaurantInDto {
    email: string,
    password: string,
    phone: string,
    firstName: string,
    lastName: string
}