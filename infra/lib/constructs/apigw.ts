import { Construct } from 'constructs'
import { 
  aws_lambda as lambda,
  aws_apigateway as apigw
} from 'aws-cdk-lib'

interface ExistingAPIGatewayRestApiProps {
  prefix: string
  restApiId: string
  rootResourceId: string
  requestAuthorizerId: string
  serviceName: string
  routes: { 
    method: string
    resourcePath: string
    handler: lambda.IFunction 
    operationName: string
  }[]
}


export class ExistingAPIGatewayRestApi {
  public readonly restApi: apigw.IRestApi

  constructor(scope: Construct, props: ExistingAPIGatewayRestApiProps) {
    this.restApi = apigw.RestApi.fromRestApiAttributes(scope, `${props.prefix}-rest-api`, {
      restApiId: props.restApiId,
      rootResourceId: props.rootResourceId,
    })

    const requestAuthorizer: apigw.IAuthorizer = {
      authorizationType: apigw.AuthorizationType.CUSTOM,
      authorizerId: props.requestAuthorizerId
    }
    
    const serviceResource = this.restApi.root
      .addResource(props.serviceName, {
        defaultMethodOptions: {
          authorizationType: apigw.AuthorizationType.CUSTOM,
          authorizer: requestAuthorizer
        }
      })

    for (const route of props.routes)
      serviceResource
        .addResource(route.resourcePath)
        .addMethod(route.method, new apigw.LambdaIntegration(route.handler), {
        operationName: route.operationName,
      })

    // Force a new deployment
    const deployment = new apigw.Deployment(scope, `${props.prefix}-rest-api-deployment`, {
      api: this.restApi,
    }) as any

    deployment.resource.stageName = 'prod'
  }
}