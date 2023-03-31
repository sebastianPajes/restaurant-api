import { ClassConstructor, plainToInstance } from "class-transformer";
import { validateOrReject } from "class-validator";
import { LambdaErrorParser } from "../errorHelpers/LambdaErrorParser";
import { createError } from "../errorHelpers/createError";

export const validationWrapper = async <T, U>(Validator: ClassConstructor<T>, plain: U) => {
    try {
        const instance = plainToInstance(Validator, plain, { excludeExtraneousValues: true, exposeDefaultValues: true })

        await validateOrReject(instance as unknown as object)

        return instance
    } catch (error) {
        const parsedError = plainToInstance(LambdaErrorParser, { error })

        throw new createError[parsedError.statusCode](parsedError.message)
    }
}