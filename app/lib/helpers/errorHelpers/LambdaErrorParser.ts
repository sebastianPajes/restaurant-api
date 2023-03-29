import { ValidationError } from 'class-validator'

export class LambdaErrorParser {
  error: any

  private getErrorMessageFromValidation = (validations: ValidationError[]): string | null => {

    for (const validation of validations) {
      const errorMessage = this.validateSingularError(validation)

      if (errorMessage) return errorMessage
    }
  
    return null
  }

  private validateSingularError = (validation: ValidationError): string | null => {
    const { constraints } = validation

    for (const key in constraints) {
      if (constraints[key]) return constraints[key]
    }

    for (const child of (validation.children || [])) {
      const errorMessage = this.validateSingularError(child)
      
      if (errorMessage) return errorMessage
    }
    return null
  }

  private get isValidationError() {
    return (this.error || [])[0] instanceof ValidationError
  }

  get statusCode() {
    return this.isValidationError
    ? 400
    : this.error.statusCode || 500
  }

  get message() {
    return this.isValidationError
    ? this.getErrorMessageFromValidation(this.error)
    : this.error.message
  }
}