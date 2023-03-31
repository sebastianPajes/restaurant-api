export interface ICallbackResponse<T> {
    message: string
    data: T
    statusCode?: number
}