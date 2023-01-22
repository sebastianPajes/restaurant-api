import { 
  Stack, 
  StackProps,
  CfnOutput,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigw,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { SQSQueue } from './lib/constructs/sqs'
import { SharedFunctionLayer, LambdaFunction } from './lib/constructs/lambda'
import { config } from './config'
// import { DynamoDbTable } from './lib/constructs/dynamodb'
export class FooStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)


    const { queue: fooQueue } = new SQSQueue(this, {
      queueName: `${config.projectName}-queue`,
    })

    // How to create a dynamodb table

    // const { table: fooTable } = new DynamoDbTable(this, {
    //   prefix: `${config.projectName}`,
    //   tableName: `${config.projectName}-foo-table`,
    //   partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
    //   sortKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
    //   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    //   stream: dynamodb.StreamViewType.KEYS_ONLY,
    //   globalSecondaryIndexes: [{
    //     indexName: config.aws.dynamoDB.globalIndexes.connectionIdKeyOnlyIndex.indexName,
    //     projectionType: dynamodb.ProjectionType.KEYS_ONLY,
    //     partitionKey: { 
    //       name: config.aws.dynamoDB.globalIndexes.connectionIdKeyOnlyIndex.partitionKeyName, 
    //       type: dynamodb.AttributeType.STRING
    //     }
    //   }]
    // })


    const { layer } = new SharedFunctionLayer(this, {
      prefix: `${config.projectName}`,
      assetPath: 'assets/layer.zip'
    })

    const { lambdaFnAlias: fooFunction } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'foo-handler',
      handler: 'handlers/foo-operation.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        SQS_QUEUE_URL: fooQueue.queueUrl,
      }
    })

    // const { lambdaFn: wooFunction } = new LambdaFunction(this, {
    //   prefix: config.projectName,
    //   layer,
    //   functionName: 'woo-handler',
    //   handler: 'handlers/woo-operation.handler',
    //   timeoutSecs: 30,
    //   memoryMB: 256,
    //   // reservedConcurrentExecutions: 10,
    //   sourceCodePath: 'assets/dist',
    //   environment: {
    //     SOME_ENV_FOR_YOUR_FUNCTION: 'some-value',
    //   },
    //   eventSources: {
    //     queues: [fooQueue],
    //     props: { batchSize: 10 }
    //   }
    // })

    const gateway = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: fooFunction
    })

  }
}


