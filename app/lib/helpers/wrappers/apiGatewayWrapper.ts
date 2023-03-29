import { APIGatewayProxyResult } from "aws-lambda"
import { IAPIGatewayWrapperProps } from "../../../models/types/IAPIGatewayWrapperProps"
import { ICallbackResponse } from "../../../models/types/ICallbackResponse"
import { responseWrapper } from "./responseWrapper"
import { errorWrapper } from "./errorWrapper"
import { createError } from "../errorHelpers/createError"

export const apiGatewayWrapper = async <T>(props: IAPIGatewayWrapperProps<T>): Promise<APIGatewayProxyResult> => {
    const { context, callback } = props

    let errorResponse: Required<ICallbackResponse<undefined>> | undefined

    try {
        const { statusCode, ...result } = await callback()

        return responseWrapper(statusCode || 200, result)
    } catch(error) {
        
        errorResponse = errorWrapper(context, error)
        console.log(errorResponse)
        throw new createError[errorResponse.statusCode](JSON.stringify({ message: errorResponse.message }))
    } finally {
        if (errorResponse) {
            const { statusCode, ...result } = errorResponse
            return responseWrapper(statusCode, result)
        }
    }

}