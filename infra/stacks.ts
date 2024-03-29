import { 
  Stack, 
  StackProps,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigw,
  aws_cognito,
  aws_s3 as s3,
  RemovalPolicy,
  aws_iam,
  CfnOutput,
  aws_ssm,
  aws_s3_deployment,
  aws_sns as sns,
  aws_sns_subscriptions as subscriptions,
} from 'aws-cdk-lib'
import { Construct } from 'constructs'
import { GetSystemParameterString } from './lib/constructs/ssm'
import { SharedFunctionLayer, LambdaFunction } from './lib/constructs/lambda'
import { config } from './config'
import { CfnApp, CfnBranch } from 'aws-cdk-lib/aws-amplify';
import { DynamoDbTable } from './lib/constructs/dynamodb';
import { createHash } from 'crypto'

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
        'isAdmin': new aws_cognito.BooleanAttribute({ mutable: false }),
        'locationId': new aws_cognito.StringAttribute({ mutable: true })
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



    // Define an S3 bucket
    const bucket = new s3.Bucket(this, 'MyBucket', {
      versioned: true, // Optional: enable versioning for the bucket
      removalPolicy: RemovalPolicy.DESTROY,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.POST,
            s3.HttpMethods.PUT,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
    });

    // dynamoDB tables
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
    const { table: locations } = new DynamoDbTable(this, {
      prefix: `${config.projectName}`,
      tableName: `${config.projectName}-locations`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      // stream: dynamodb.StreamViewType.KEYS_ONLY,
      globalSecondaryIndexes: [{
        indexName: config.aws.dynamoDB.globalIndexes.locationIndex.indexName,
        // projectionType: dynamodb.ProjectionType.KEYS_ONLY,
        partitionKey: { 
          name: config.aws.dynamoDB.globalIndexes.locationIndex.partitionKeyName, 
          type: dynamodb.AttributeType.STRING
        }
      }],
      removePolicy: true
    })

    const { table: categories } = new DynamoDbTable(this, {
      prefix: `${config.projectName}`,
      tableName: `${config.projectName}-categories`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removePolicy: true
    })

    const { table: products } = new DynamoDbTable(this, {
      prefix: `${config.projectName}`,
      tableName: `${config.projectName}-products`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removePolicy: true
    })
    
    const { table: tables } = new DynamoDbTable(this, {
      prefix: `${config.projectName}`,
      tableName: `${config.projectName}-tables`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removePolicy: true
    })

    const { table: parties } = new DynamoDbTable(this, {
      prefix: `${config.projectName}`,
      tableName: `${config.projectName}-parties`,
      partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'sk', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removePolicy: true
    })

    // lambdas
    const { layer } = new SharedFunctionLayer(this, {
      prefix: `${config.projectName}`,
      assetPath: 'assets/layer.zip'
    })

    const { lambdaFnAlias: createLocation } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'create-location-handler',
      handler: 'handlers/location/create-location.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        EMPLOYEE_TABLE_NAME: employees.tableName,
        LOCATION_TABLE_NAME: locations.tableName,
      },
      role: new aws_iam.PolicyStatement({
        resources: [userPool.userPoolArn, employees.tableArn,locations.tableArn, '*'],
        actions: ['cognito-idp:AdminCreateUser', 'dynamodb:PutItem', 'ssm:GetParameter'],
      })
    })

    const { lambdaFnAlias: getLocationById } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'get-location-by-id-handler',
      handler: 'handlers/location/get-location-by-id.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        LOCATION_TABLE_NAME: locations.tableName,
      },
      role: new aws_iam.PolicyStatement({
        resources: [userPool.userPoolArn, employees.tableArn,locations.tableArn],
        actions: ['dynamodb:GetItem'],
      })
    })

    const { lambdaFnAlias: updateLocation } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'update-location-handler',
      handler: 'handlers/location/update-location.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        LOCATION_TABLE_NAME: locations.tableName,
      },
      role: new aws_iam.PolicyStatement({
        resources: [locations.tableArn],
        actions: ['dynamodb:UpdateItem', 'dynamodb:GetItem'],
      })
    })

    const { lambdaFnAlias: persistEmployee } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'persist-employee-handler',
      handler: 'handlers/employee/persist-employee.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        EMPLOYEE_TABLE_NAME: employees.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [userPool.userPoolArn, employees.tableArn],
        actions: ['cognito-idp:AdminCreateUser', 'dynamodb:PutItem', 'cognito-idp:AdminUpdateUserAttributes'],
      })
    })

    const { lambdaFnAlias: getEmployeeByLocation } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'get-employees-by-location-handler',
      handler: 'handlers/employee/get-employees-by-location.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        EMPLOYEE_TABLE_NAME: employees.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [employees.tableArn],
        actions: ['dynamodb:Query'],
      })
    })
    
    const { lambdaFnAlias: getEmployeeById } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'get-employee-by-id-handler',
      handler: 'handlers/employee/get-employee-by-id.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        EMPLOYEE_TABLE_NAME: employees.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [employees.tableArn],
        actions: ['dynamodb:GetItem'],
      })
    })

    const { lambdaFnAlias: deleteEmployeeById } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'delete-employee-by-id-handler',
      handler: 'handlers/employee/delete-employee-by-id.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        EMPLOYEE_TABLE_NAME: employees.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [employees.tableArn, userPool.userPoolArn],
        actions: ['dynamodb:DeleteItem', 'cognito-idp:AdminDeleteUser'],
      })
    })

    const { lambdaFnAlias: upsertCategory } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'upsert-category-handler',
      handler: 'handlers/category/upsert-category.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        CATEGORY_TABLE_NAME: categories.tableName,
      },
      role: new aws_iam.PolicyStatement({
        resources: [categories.tableArn],
        actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:UpdateItem']
      })
    })

    const { lambdaFnAlias: getCategories } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'get-categories-handler',
      handler: 'handlers/category/get-categories.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        CATEGORY_TABLE_NAME: categories.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [categories.tableArn],
        actions: ['dynamodb:Scan','dynamodb:Query'],
      })
    })


    const { lambdaFnAlias: deleteCategoryById } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'delete-category-handler',
      handler: 'handlers/category/delete-category.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        CATEGORY_TABLE_NAME: categories.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [categories.tableArn],
        actions: ['dynamodb:DeleteItem'],
      })
    })


    const { lambdaFnAlias: upsertProduct } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'upsert-product-handler',
      handler: 'handlers/product/upsert-product.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        PRODUCT_TABLE_NAME: products.tableName,
      },
      role: new aws_iam.PolicyStatement({
        resources: [products.tableArn],
        actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:UpdateItem']
      })
    })

    const { lambdaFnAlias: getProducts } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'get-products-handler',
      handler: 'handlers/product/get-products.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        PRODUCT_TABLE_NAME: products.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [products.tableArn],
        actions: ['dynamodb:Scan','dynamodb:Query'],
      })
    })

    
    const { lambdaFnAlias: deleteProductById } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'delete-product-handler',
      handler: 'handlers/product/delete-product.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        PRODUCT_TABLE_NAME: products.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [products.tableArn],
        actions: ['dynamodb:DeleteItem'],
      })
    })

    const { lambdaFnAlias: getSignedUrl } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'get-signed-URL-handler',
      handler: 'handlers/get-signed-URL.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      environment: {
        BUCKET: bucket.bucketName
      },
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      role: new aws_iam.PolicyStatement({
        resources: [bucket.bucketArn],
        actions: ['s3:PutObject','s3:GetObject']
      })
    })

    const embeddingsBucket = new s3.Bucket(this, 'VectorDBBucket', {
      versioned: false,
    });

    new aws_s3_deployment.BucketDeployment(this, 'DeployRestaurantFile', {
      sources: [aws_s3_deployment.Source.asset('./data')],
      destinationBucket: embeddingsBucket,
      destinationKeyPrefix: '', // Opcional: si deseas agregar un prefijo al nombre del archivo
    });

    const vectorStoreKey = 'vector-store'

    const { lambdaFnAlias: generateEmbeddings } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'generate-embeddings-handler',
      handler: 'handlers/chatbot/generate-embeddings.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      sourceCodePath: 'assets/dist',
      environment: {
        BUCKET: embeddingsBucket.bucketName,
        OPEN_AI_KEY: config.chatbot.apiKey,
        BUCKET_KEY: vectorStoreKey
      },
      role: new aws_iam.PolicyStatement({
        resources: [embeddingsBucket.bucketArn],
        actions: ['s3:PutObject','s3:GetObject']
      })
    })

    const { lambdaFnAlias: postChatbotMsg } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'post-chatbot-msg-handler',
      handler: 'handlers/chatbot/post-chatbot-msg.handler',
      timeoutSecs: 120,
      memoryMB: 1536,
      sourceCodePath: 'assets/dist',
      environment: {
        BUCKET: embeddingsBucket.bucketName,
        OPEN_AI_KEY: config.chatbot.apiKey,
        BUCKET_KEY: vectorStoreKey
      },
      role: new aws_iam.PolicyStatement({
        resources: [embeddingsBucket.bucketArn],
        actions: ['s3:PutObject','s3:GetObject']
      })
    })

    bucket.grantPublicAccess();
    bucket.grantPut(getSignedUrl);
    bucket.grantReadWrite(getSignedUrl);
    embeddingsBucket.grantPublicAccess()
    embeddingsBucket.grantPut(generateEmbeddings)
    embeddingsBucket.grantReadWrite(generateEmbeddings)
    embeddingsBucket.grantPut(postChatbotMsg)
    embeddingsBucket.grantReadWrite(postChatbotMsg)

    const { lambdaFnAlias: createOrUpdateTable } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'create-or-update-table',
      handler: 'handlers/table/create-or-update-table.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        TABLES_TABLE_NAME: tables.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [tables.tableArn],
        actions: [
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:CreateTable'
        ],
      })
    })

    const { lambdaFnAlias: deleteTable } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'delete-table',
      handler: 'handlers/table/delete-table.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        TABLES_TABLE_NAME: tables.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [tables.tableArn],
        actions: [
          'dynamodb:DeleteItem',
        ],
      })
    })

    const { lambdaFnAlias: getTables } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'get-tables',
      handler: 'handlers/table/get-tables.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        TABLES_TABLE_NAME: tables.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [tables.tableArn],
        actions: [
          'dynamodb:Query','dynamodb:GetItem'
        ],
      })
    })

    // Create an SNS topic
    const smsTopic = new sns.Topic(this, 'SMSNotificationTopic');
        
    const { lambdaFnAlias: upsertParty } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'upsert-party-handler',
      handler: 'handlers/party/upsert-party.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        PARTY_TABLE_NAME: parties.tableName,
        TABLES_TABLE_NAME: tables.tableName,
        LOCATION_TABLE_NAME:  locations.tableName,
      },
      role: new aws_iam.PolicyStatement({
        resources: [parties.tableArn, locations.tableArn, tables.tableArn, '*'],
        actions: ['dynamodb:PutItem', 'dynamodb:GetItem', 'dynamodb:UpdateItem', 'SNS:Publish', 'ssm:GetParameter']
      })
    })

    smsTopic.grantPublish(upsertParty)
    smsTopic.addSubscription(new subscriptions.LambdaSubscription(upsertParty));

    const { lambdaFnAlias: deleteParty } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'delete-party-handler',
      handler: 'handlers/party/delete-party.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        PARTY_TABLE_NAME: parties.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [parties.tableArn],
        actions: ['dynamodb:DeleteItem']
      })
    })

    const { lambdaFnAlias: listPartyByType } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'list-party-by-type-handler',
      handler: 'handlers/party/list-party-by-type.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        PARTY_TABLE_NAME: parties.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [parties.tableArn],
        actions: ['dynamodb:Query']
      })
    })

    const { lambdaFnAlias: getPartyById } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'get-party-by-id-handler',
      handler: 'handlers/party/get-party-by-id.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        PARTY_TABLE_NAME: parties.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [parties.tableArn],
        actions: ['dynamodb:GetItem']
      })
    })

    // apis
    const restaurantApi = new apigw.RestApi(this, 'api-restaurant',{
        defaultCorsPreflightOptions: {
          allowHeaders: [
            'Content-Type',
            'X-Amz-Date',
            'Authorization',
            'X-Api-Key',
          ],
          allowMethods: ['OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
          allowCredentials: true,
          allowOrigins: ['*'],
        }
      }
    );

    console.log(`API URL: ${restaurantApi.url}`)

    const usagePlan = new apigw.UsagePlan(this, 'usagePlan', {
      name: 'internal',
      description: 'plan for internal use',
      apiStages: [{
        api: restaurantApi,
        stage: restaurantApi.deploymentStage,
      }],
    });
    

    const stackName = Stack.of(this).stackName;

    const internalApiKey = generateApiKey(`${stackName}-internalKey`);
    const waitlistApiKey = generateApiKey(`${stackName}-waitlistKey`);

    const apiKey = new apigw.ApiKey(this, 'internalKey', {
      apiKeyName: 'internalKey',
      value: internalApiKey
    });

    const waitlistKey = new apigw.ApiKey(this, 'waitlistKey', {
      apiKeyName: 'waitlistKey',
      value: waitlistApiKey
    })

    usagePlan.addApiKey(apiKey);
    usagePlan.addApiKey(waitlistKey);

    const amplifyRestauranApp = new CfnApp(this, 'restaurant-app', {
      name: 'restaurantApp',
      repository: 'https://github.com/sebastianPajes/restaurant-app',
      oauthToken: gitToken,
      environmentVariables: [
        { name: 'REGION', value: config.stack.env.region }, 
        { name: 'API', value:  restaurantApi.url},
        { name: 'USER_POOL_ID', value: userPool.userPoolId },
        { name: 'USER_POOL_CLIENT', value: userPoolClient.userPoolClientId },
    ],
    customRules: [
      {
        source: '</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>',
        target: '/index.html',
        status: '200',
      }
    ]
    });

    new CfnBranch(this, 'MainBranch', {
      appId: amplifyRestauranApp.attrAppId,
      branchName: 'main' 
    });

    const amplifyWaitlistApp = new CfnApp(this, 'waitlist-app', {
      name: 'waitlistApp',
      repository: 'https://github.com/sebastianPajes/waitlist-app',
      oauthToken: gitToken,
      environmentVariables: [
        { name: 'REGION', value: config.stack.env.region }, 
        { name: 'API', value:  restaurantApi.url},
        { name: 'API_KEY', value: waitlistApiKey }
    ],
    customRules: [
      {
        source: '</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>',
        target: '/index.html',
        status: '200',
      }
    ]
    });

    const branchName = 'main'

    new CfnBranch(this, 'waitlist-main-branch', {
      appId: amplifyWaitlistApp.attrAppId,
      branchName
    });

    const amplifyChatbot = new CfnApp(this, 'chatbot', {
      name: 'chatbot',
      repository: 'https://github.com/sebastianPajes/restaurant-chatbot-openai',
      oauthToken: gitToken,
      environmentVariables: [
        { name: 'API', value:  restaurantApi.url},
        { name: 'API_KEY', value: waitlistApiKey }
    ],
    customRules: [
      {
        source: '</^[^.]+$|\\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|ttf|map|json)$)([^.]+$)/>',
        target: '/index.html',
        status: '200',
      }
    ]
    });

    new CfnBranch(this, 'chatbot-main-branch', {
      appId: amplifyChatbot.attrAppId,
      branchName
    });
    

    const amplifyWaitlistAppUrl = `https://${branchName}.${amplifyWaitlistApp.attrAppId}.amplifyapp.com`;

    const amplifyChatbotUrl = `https://${branchName}.${amplifyChatbot.attrAppId}.amplifyapp.com`;

    const baseResource = restaurantApi.root.addResource('api');

    //internalApis
    const baseInternalResource = baseResource.addResource('internal');
    const internalLocationResource = baseInternalResource.addResource('locations').addResource('{locationId}')
    const internalPartyResource = internalLocationResource.addResource('parties')
    const createResource = baseInternalResource.addResource('create');
    const chatbotResource = baseInternalResource.addResource('chatbot')

    const embeddingsResource = chatbotResource.addResource('embeddings')

    chatbotResource.addMethod('POST', new apigw.LambdaIntegration(postChatbotMsg), {
      apiKeyRequired: true
    })

    embeddingsResource.addMethod('POST', new apigw.LambdaIntegration(generateEmbeddings), {
      apiKeyRequired: true
    })
    
    createResource.addMethod('POST', new apigw.LambdaIntegration(createLocation), {
      apiKeyRequired: true
    });

    internalLocationResource.addMethod('GET', new apigw.LambdaIntegration(getLocationById), {
      apiKeyRequired: true
    })

    const internalPartyTypeResource = internalPartyResource.addResource('{type}');

    internalPartyTypeResource.addMethod('POST', new apigw.LambdaIntegration(upsertParty), {
      apiKeyRequired: true
    })

    internalPartyTypeResource.addResource('{id}').addMethod('DELETE', new apigw.LambdaIntegration(deleteParty), {
      apiKeyRequired: true
    })

    internalPartyTypeResource.addMethod('GET', new apigw.LambdaIntegration(listPartyByType), {
      apiKeyRequired: true
    })
    
    //appApis
    const employeesResource = baseResource.addResource('employees');
    const categoriesResource = baseResource.addResource('categories');
    const productsResource = baseResource.addResource('products');
    const tablesResource = baseResource.addResource('tables');
    const uploadsResource = baseResource.addResource('uploads');
    const partyResource = baseResource.addResource('parties');
    const locationResource = baseResource.addResource('locations');


    const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool]
    });

    const cognitoAuthorizer = {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    };

    locationResource.addMethod('GET', new apigw.LambdaIntegration(getLocationById), cognitoAuthorizer)

    locationResource.addMethod('PUT', new apigw.LambdaIntegration(updateLocation), cognitoAuthorizer)
        
    employeesResource.addMethod('POST', new apigw.LambdaIntegration(persistEmployee), cognitoAuthorizer);

    employeesResource.addMethod('GET', new apigw.LambdaIntegration(getEmployeeByLocation), cognitoAuthorizer);

    const employeeResourceById = employeesResource.addResource('{id}');

    employeeResourceById.addMethod('GET', new apigw.LambdaIntegration(getEmployeeById), cognitoAuthorizer);

    employeeResourceById.addMethod('DELETE', new apigw.LambdaIntegration(deleteEmployeeById), cognitoAuthorizer);
    
    categoriesResource.addMethod('POST', new apigw.LambdaIntegration(upsertCategory), cognitoAuthorizer);
    
    categoriesResource.addMethod('PUT', new apigw.LambdaIntegration(upsertCategory), cognitoAuthorizer);

    const categoryIdResource = categoriesResource.addResource("{id}")
    
    categoryIdResource.addMethod('DELETE', new apigw.LambdaIntegration(deleteCategoryById), cognitoAuthorizer);
    
    productsResource.addMethod('POST', new apigw.LambdaIntegration(upsertProduct), cognitoAuthorizer);
    
    productsResource.addMethod('PUT', new apigw.LambdaIntegration(upsertProduct), cognitoAuthorizer);
    
    const productIdResource = productsResource.addResource("{id}")
    
    productIdResource.addMethod('DELETE', new apigw.LambdaIntegration(deleteProductById), cognitoAuthorizer);

    tablesResource.addMethod('POST', new apigw.LambdaIntegration(createOrUpdateTable), cognitoAuthorizer)

    categoriesResource.addMethod('GET', new apigw.LambdaIntegration(getCategories), cognitoAuthorizer);

    tablesResource.addMethod('PUT', new apigw.LambdaIntegration(createOrUpdateTable), cognitoAuthorizer)

    tablesResource.addResource("{code}").addMethod('DELETE', new apigw.LambdaIntegration(deleteTable), cognitoAuthorizer)

    tablesResource.addMethod('GET', new apigw.LambdaIntegration(getTables), cognitoAuthorizer)

    const partyTypeResource = partyResource.addResource("{type}")

    partyTypeResource.addMethod('POST', new apigw.LambdaIntegration(upsertParty), cognitoAuthorizer)

    partyTypeResource.addMethod('GET', new apigw.LambdaIntegration(listPartyByType), cognitoAuthorizer)
    
    const partyTypeIdResource = partyTypeResource.addResource("{id}")

    productsResource.addMethod('GET', new apigw.LambdaIntegration(getProducts), cognitoAuthorizer);

    uploadsResource.addResource("{fileName}").addMethod('GET', new apigw.LambdaIntegration(getSignedUrl), cognitoAuthorizer);

    partyTypeIdResource.addMethod('DELETE', new apigw.LambdaIntegration(deleteParty), cognitoAuthorizer)

    partyTypeIdResource.addMethod('GET', new apigw.LambdaIntegration(getPartyById), cognitoAuthorizer)
    

    new CfnOutput(this, 'WaitlistApiKey', {
      description: 'Waitlist API Key',
      value: waitlistApiKey,
      exportName: 'WaitlistApiKey',
    });

    new CfnOutput(this, 'InternalApiKey', {
      description: 'Internal API Key',
      value: internalApiKey,
      exportName: 'InternalApiKey',
    });

    new CfnOutput(this, 'AmplifyWaitlistUrl', {
      description: 'Amplify waitlist url',
      value: amplifyWaitlistAppUrl,
      exportName: 'AmplifyWaitlistUrl',
    }); 

    new CfnOutput(this, 'AmplifyChatbotUrl', {
      description: 'Amplify chatbot url',
      value: amplifyChatbotUrl,
      exportName: 'AmplifyChatbotUrl',
    });
    new aws_ssm.StringParameter(this, 'WaitlistAppUrlParameter', {
      parameterName: '/admin/waitlist-app-url',
      stringValue: amplifyWaitlistAppUrl,
    });





  }
}

function generateApiKey(input: string): string {
  return createHash('sha256').update(input).digest('hex').substring(0, 32);
}



