import { Context } from 'aws-lambda/handler'
import { plainToInstance } from 'class-transformer'
import { ICallbackResponse } from '../../../models/types/ICallbackResponse'
import { LambdaErrorParser } from '../errorHelpers/LambdaErrorParser'

export const errorWrapper = (context: Context, error: any): Required<ICallbackResponse<undefined>> => {
  const parsedError = plainToInstance(LambdaErrorParser, { error })
  
  return {
    statusCode: parsedError.statusCode | error.statusCode,
    message: parsedError.message || error.message,
    data: undefined
  }
}