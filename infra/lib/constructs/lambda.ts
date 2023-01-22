import { Construct  } from 'constructs'
import { 
  Duration,
  aws_lambda as lambda,
  aws_iam as iam,
  aws_sqs as sqs,
  aws_lambda_event_sources as lambdaEventSources,
} from 'aws-cdk-lib'

interface LambdaFunctionConstructProps {
  prefix: string
  layer: lambda.ILayerVersion
  functionName: string
  handler: string
  timeoutSecs: number
  memoryMB: number
  reservedConcurrentExecutions?: number
  sourceCodePath: string
  environment?: Record<string, string>,
  role?: iam.PolicyStatement,
  eventSources?: { 
    queues?: sqs.IQueue[],
    props?: lambdaEventSources.SqsEventSourceProps
  }
}


interface SharedFunctionLayerConstructProps {
  prefix: string
  assetPath: string
}


export class SharedFunctionLayer {
  public readonly layer: lambda.ILayerVersion

  constructor(scope: Construct, props: SharedFunctionLayerConstructProps){
    this.layer = new lambda.LayerVersion(scope, `${props.prefix}-shared-function-layer`, {
      code: lambda.Code.fromAsset(props.assetPath),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X],
      description: 'Contains node module dependencies for lambda functions'
    })
  }
}

export class LambdaFunction {
    public readonly lambdaFn: lambda.Function
    public readonly lambdaFnAlias: lambda.Alias

    constructor(scope: Construct, props: LambdaFunctionConstructProps) {
      const role = new iam.Role(scope, `${props.prefix}-${props.functionName}-role`, {
          roleName: `${props.prefix}-${props.functionName}-role`,
          assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
      })

      role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"))
      role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AWSXrayWriteOnlyAccess'))

      // Add any additional permissions your lambda needs to the role
      // role.addToPolicy(new iam.PolicyStatement({
      //   effect: iam.Effect.ALLOW,
      //   actions: ['sqs:SendMessage'],
      //   resources: ['some-resource-arn']
      // }))

    
      this.lambdaFn = new lambda.Function(scope, `${props.prefix}-${props.functionName}-fn`, {
        functionName: `${props.prefix}-${props.functionName}`,
        code: lambda.Code.fromAsset(props.sourceCodePath),
        layers: [props.layer],
        handler: props.handler,
        runtime: lambda.Runtime.NODEJS_14_X,
        timeout: Duration.seconds(props.timeoutSecs),
        memorySize: props.memoryMB,
        reservedConcurrentExecutions: props.reservedConcurrentExecutions,
        tracing: lambda.Tracing.ACTIVE,
        role,
        environment: props.environment
      })

      if (props.role) {
        this.lambdaFn.role?.addToPrincipalPolicy(props.role)
      }

      if(props.eventSources?.queues) {
        for(const queue of props.eventSources.queues) {
          this.lambdaFn.addEventSource(new lambdaEventSources.SqsEventSource(queue, props.eventSources.props))
        }
      }

      this.lambdaFnAlias = new lambda.Alias(scope, `${props.prefix}-${props.functionName}-current-alias`, {
        aliasName: 'Current',
        version: this.lambdaFn.currentVersion,
        description: `Deployed on ${ new Date().toISOString() }` 
      })
    }
}