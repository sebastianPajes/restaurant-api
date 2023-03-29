import { Context } from 'aws-lambda/handler'
import { ICallbackResponse } from './ICallbackResponse'

export interface IAPIGatewayWrapperProps<T> {
  context: Context
  callback: () => Promise<ICallbackResponse<T>>
}