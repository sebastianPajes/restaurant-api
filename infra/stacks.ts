import { 
  Stack, 
  StackProps,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigw,
  aws_cognito,
  RemovalPolicy,
  aws_iam,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { GetSystemParameterString } from './lib/constructs/ssm'
import { SharedFunctionLayer, LambdaFunction } from './lib/constructs/lambda'
import { config } from './config'
import { CfnApp, CfnBranch } from 'aws-cdk-lib/aws-amplify';
import { DynamoDbTable } from './lib/constructs/dynamodb';

export class RestaurantApiStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props)


    // cognito
    const userPool = new aws_cognito.UserPool(this, "RestaurantUserPool", {
      removalPolicy: RemovalPolicy.DESTROY,
      signInAliases: {
        username: false,
        email: true
      },
      customAttributes: {
        'isAdmin': new aws_cognito.BooleanAttribute({ mutable: false })
      } 
    })

    const userPoolClient = userPool.addClient('RestaurantUserPoolClient', {
      userPoolClientName: "RestaurantUserPoolClient",
    })

    // amplify
    const { value: gitToken } = new GetSystemParameterString(this, {
      prefix: `${config.stage}-restaurant-api`,
      path: 'github-access-token',
    })

    const amplifyRestauranApp = new CfnApp(this, 'restaurant-app', {
      name: 'restaurantApp',
      repository: 'https://github.com/sebastianPajes/restaurant-app',
      oauthToken: gitToken,
      environmentVariables: [
        { name: 'USER_POOL_ID', value: userPool.userPoolId },
        { name: 'USER_POOL_CLIENT', value: userPoolClient.userPoolClientId },
        { name: 'REGION', value: config.stack.env.region }, 
    ]
    });

    new CfnBranch(this, 'MainBranch', {
      appId: amplifyRestauranApp.attrAppId,
      branchName: 'main' 
    });

    // dynamoDB

    const { table: employees } = new DynamoDbTable(this, {
      prefix: `${config.projectName}`,
      tableName: `${config.projectName}-employees`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      // stream: dynamodb.StreamViewType.KEYS_ONLY,
      globalSecondaryIndexes: [{
        indexName: config.aws.dynamoDB.globalIndexes.employeeIndex.indexName,
        // projectionType: dynamodb.ProjectionType.KEYS_ONLY,
        partitionKey: { 
          name: config.aws.dynamoDB.globalIndexes.employeeIndex.partitionKeyName, 
          type: dynamodb.AttributeType.STRING
        }
      }],
      removePolicy: true
    })

    // lambdas
    const { layer } = new SharedFunctionLayer(this, {
      prefix: `${config.projectName}`,
      assetPath: 'assets/layer.zip'
    })

    const { lambdaFnAlias: createRestaurant } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'create-restaurant-handler',
      handler: 'handlers/create-restaurant.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        TABLE_NAME: employees.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [userPool.userPoolArn, employees.tableArn],
        actions: ['cognito-idp:AdminCreateUser', 'dynamodb:PutItem'],
      })
    })

    // apis
    const restaurantApi = new apigw.RestApi(this, 'api-restaurant');
    const internalBaseResource = restaurantApi.root.addResource('internal')
    const createRestaurantResource = internalBaseResource.addResource('create');

    const internalUsagePlan = new apigw.UsagePlan(this, 'internalUsagePlan', {
      name: 'internal',
      description: 'plan for internal use',
      apiStages: [{
        api: restaurantApi,
        stage: restaurantApi.deploymentStage
      }],
    });
    
    const internalKey = new apigw.ApiKey(this, 'internalKey', {
      apiKeyName: 'internalKey',
    });

    internalUsagePlan.addApiKey(internalKey);

    createRestaurantResource.addMethod('POST', new apigw.LambdaIntegration(createRestaurant), {
      apiKeyRequired: true
    });

    

  }
}



