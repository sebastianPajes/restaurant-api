import { 
  Stack, 
  StackProps,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigw,
  aws_cognito,
  aws_s3 as s3,
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
        EMPLOYEE_TABLE_NAME: employees.tableName,
        LOCATION_TABLE_NAME: locations.tableName,
      },
      role: new aws_iam.PolicyStatement({
        resources: [userPool.userPoolArn, employees.tableArn,locations.tableArn],
        actions: ['cognito-idp:AdminCreateUser', 'dynamodb:PutItem'],
      })
    })

    const { lambdaFnAlias: createEmployee } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'create-employee-handler',
      handler: 'handlers/employee/create-employee.handler',
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
        actions: ['cognito-idp:AdminCreateUser', 'dynamodb:PutItem'],
      })
    })
    
    const { lambdaFnAlias: getEmployeeByCognitoUser } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'get-employee-by-cognito-user-handler',
      handler: 'handlers/employee/get-employee-by-cognito-user.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        EMPLOYEE_TABLE_NAME: employees.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [employees.tableArn],
        actions: ['dynamodb:Scan','dynamodb:Query'],
      })
    })


    const { lambdaFnAlias: deleteEmployee } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'delete-employee',
      handler: 'handlers/employee/delete-employee.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        EMPLOYEE_TABLE_NAME: employees.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [employees.tableArn],
        actions: [
          'dynamodb:DeleteItem',
        ],
      })
    })

    const { lambdaFnAlias: createCategory } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'create-category-handler',
      handler: 'handlers/category/create-category.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        CATEGORY_TABLE_NAME: categories.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [categories.tableArn],
        actions: ['dynamodb:PutItem']
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

    const { lambdaFnAlias: createProduct } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'create-product-handler',
      handler: 'handlers/product/create-product.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        PRODUCT_TABLE_NAME: products.tableName
      },
      role: new aws_iam.PolicyStatement({
        resources: [products.tableArn],
        actions: ['dynamodb:PutItem']
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

    //i got bit crazy because was not working...
    bucket.grantPublicAccess();
    bucket.grantPut(getSignedUrl);
    bucket.grantReadWrite(getSignedUrl);

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
          'dynamodb:Query'
        ],
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
    
    const baseResource = restaurantApi.root.addResource('api');

    //internalApis
    const baseInternalResource = baseResource.addResource('internal');
    const createResource = baseInternalResource.addResource('create');
    
    const usagePlan = new apigw.UsagePlan(this, 'usagePlan', {
      name: 'internal',
      description: 'plan for internal use',
      apiStages: [{
        api: restaurantApi,
        stage: restaurantApi.deploymentStage,
      }],
    });
    
    const apiKey = new apigw.ApiKey(this, 'internalKey', {
      apiKeyName: 'internalKey',
    });
    
    usagePlan.addApiKey(apiKey);
    
    createResource.addMethod('POST', new apigw.LambdaIntegration(createRestaurant), {
      apiKeyRequired: true
    });
    
    //appApis
    const employeesResource = baseResource.addResource('employees');
    const categoriesResource = baseResource.addResource('categories');
    const productsResource = baseResource.addResource('products');
    const tablesResource = baseResource.addResource('tables');
    const uploadsResource = baseResource.addResource('uploads');

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [userPool]
    });
    
    employeesResource.addMethod('POST', new apigw.LambdaIntegration(createEmployee), {
        authorizer: authorizer,
        authorizationType: apigw.AuthorizationType.COGNITO
    });
    
     const employeeByCognitoUserResource = employeesResource.addResource("{cognitoUser}");
    
     employeeByCognitoUserResource.addMethod('DELETE', new apigw.LambdaIntegration(deleteEmployee), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });
    // employeesResource.addMethod('PUT', new apigw.LambdaIntegration(createOrUpdateEmployee), {
    //     authorizer: authorizer,
    //     authorizationType: apigw.AuthorizationType.COGNITO
    // });
    employeeByCognitoUserResource.addMethod('GET', new apigw.LambdaIntegration(getEmployeeByCognitoUser), {
        authorizer: authorizer,
        authorizationType: apigw.AuthorizationType.COGNITO
    });


    categoriesResource.addMethod('POST', new apigw.LambdaIntegration(createCategory), {
        authorizer: authorizer,
        authorizationType: apigw.AuthorizationType.COGNITO
    });
    categoriesResource.addMethod('GET', new apigw.LambdaIntegration(getCategories), {
        authorizer: authorizer,
        authorizationType: apigw.AuthorizationType.COGNITO
    });
    
    productsResource.addMethod('POST', new apigw.LambdaIntegration(createProduct), {
        authorizer: authorizer,
        authorizationType: apigw.AuthorizationType.COGNITO
    });

    productsResource.addMethod('GET', new apigw.LambdaIntegration(getProducts), {
      authorizer: authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });

    uploadsResource.addResource("{fileName}").addMethod('GET', new apigw.LambdaIntegration(getSignedUrl), {
      authorizer: authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    });

    tablesResource.addMethod('POST', new apigw.LambdaIntegration(createOrUpdateTable), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    })

    tablesResource.addMethod('PUT', new apigw.LambdaIntegration(createOrUpdateTable), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    })

    tablesResource.addResource("{code}").addMethod('DELETE', new apigw.LambdaIntegration(deleteTable), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    })

    tablesResource.addMethod('GET', new apigw.LambdaIntegration(getTables), {
      authorizer,
      authorizationType: apigw.AuthorizationType.COGNITO
    })
    

  }
}



