export interface ICreateRestaurantEvent {
    Payload: {
        body: string
    }
}

export interface ICreateRestaurantParams {
    email: string,
    password: string,
    phone: string,
    firstName: string,
    lastName: string
}