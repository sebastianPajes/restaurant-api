import { 
  Stack, 
  StackProps,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigw,
  aws_cognito,
  RemovalPolicy,
  aws_iam,
} from 'aws-cdk-lib'

import {
  CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep, CodeBuildStep,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs'
import { SQSQueue } from './lib/constructs/sqs'
import { GetSystemParameterString } from './lib/constructs/ssm'
import { SharedFunctionLayer, LambdaFunction } from './lib/constructs/lambda'
import { Config, AppStage } from './config'
import { Options } from './lib/utils';
import { ApplicationStage } from './lib/application-stage';
import { CfnApp, CfnBranch } from 'aws-cdk-lib/aws-amplify';
import { DynamoDbTable } from './lib/constructs/dynamodb';
// import { DynamoDbTable } from './lib/constructs/dynamodb'

export interface TemplateStackProps {
  CDK_DEFAULT_ACCOUNT: string
  AWS_DEFAULT_REGION: string
  DEPLOYED_BY: string
  STAGE: AppStage
  tags: { [key: string]: string }
}

export class RestaurantApiStack extends Stack {
  constructor(scope: Construct, id: string, props: TemplateStackProps & StackProps) {
    super(scope, id, props)

    const { AWS_DEFAULT_REGION, CDK_DEFAULT_ACCOUNT, DEPLOYED_BY, STAGE } = props

    const config = new Config({
      CDK_DEFAULT_ACCOUNT,
      AWS_DEFAULT_REGION,
      DEPLOYED_BY,
      STAGE
    })

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
      prefix: `${STAGE}-restaurant-api`,
      path: 'github-access-token',
    })

    const amplifyRestauranApp = new CfnApp(this, 'restaurant-app', {
      name: 'restaurantApp',
      repository: 'https://github.com/sebastianPajes/restaurant-app',
      oauthToken: gitToken,
      environmentVariables: [
        { name: 'USER_POOL_ID', value: userPool.userPoolId },
        { name: 'USER_POOL_CLIENT', value: userPoolClient.userPoolClientId },
        { name: 'REGION', value: AWS_DEFAULT_REGION }, 
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


interface PipelineStackProps extends StackProps {
  deployEnv: {
    region: string,
    account: string,
  },
  branch: string,
  preApproval?: boolean,
  envName: string,
  options: Options,
  stage: AppStage
  tags: { [key: string]: string }
}

export class PipelineStack extends Stack {
  /**
   * Creates a deployment Pipeline.
   * Can be run for each environment to create separate
   * pipelines for each.
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope: Construct, id: string, props: PipelineStackProps) {
      super(scope, id, props);

      // Environment props
      const {
        deployEnv, branch, preApproval, envName, options, stage, tags
      } = props

      // Common options
      const {
          repoString, connectionArn, version,
      } = options;

      const build = new CodeBuildStep(`Test-${envName}-${deployEnv.region}`, {
        input: CodePipelineSource.connection(repoString, branch, {
          connectionArn,
        }),
        primaryOutputDirectory: './',
        installCommands: [
          'yarn install --production --frozen-lockfile'
        ],
        commands: [
          'yarn add-assets',
          'cd infra',
          'yarn install',
          // 'yarn test',
          'cd ../app',
          // 'yarn test'
        ],
      })

      const synth = new CodeBuildStep(`Synth-${envName}-${deployEnv.region}`, {
        input: build,
        primaryOutputDirectory: 'infra/cdk.out',
        commands: [
          'cd infra',
          'rm -rf node_modules', // node_modules are corrupt for some reason, so it is removed and reinstalled
          'yarn install',
          'yarn global add cdk@2.22.0',
          'yarn cdk synth',
        ],
      })

      // Complete the pipeline using CDK Pipelines
      const pipeline = new CodePipeline(this, 'RestaurantApiStack', {
          pipelineName: `RestaurantApiStack-${envName}-${deployEnv.region}`,
          crossAccountKeys: true,
          synth
      });

      const applicationStage = new ApplicationStage(this, 'DeployStage', {
        env: deployEnv,
        CDK_DEFAULT_ACCOUNT: deployEnv.account,
        AWS_DEFAULT_REGION: deployEnv.region,
        DEPLOYED_BY: `Ecomm-Pipeline-${options.toolsAccount}`,
        STAGE: stage,
        tags
      });
      pipeline.addStage(applicationStage, {
          pre: (preApproval) ? [
              new ManualApprovalStep('PreApproval'),
          ] : [],
      });
  }
}
