import { Context } from 'aws-lambda/handler'
import { plainToInstance } from 'class-transformer'
import { ICallbackResponse } from '../../../models/types/ICallbackResponse'
import { LambdaErrorParser } from '../errorHelpers/LambdaErrorParser'

export const errorWrapper = (context: Context, error: any): Required<ICallbackResponse<undefined>> => {
  let parsedError;
  try {
    parsedError = plainToInstance(LambdaErrorParser, { error })
  } catch(error) {
    console.log(error)
  }
  
  
  return {
    statusCode: parsedError.statusCode | error.statusCode,
    message: parsedError.message || error.message,
    data: undefined
  }
}