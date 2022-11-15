import { 
  Stack, 
  StackProps,
  CfnOutput,
  aws_dynamodb as dynamodb,
  aws_apigateway as apigw,
} from 'aws-cdk-lib'
import {
  CodePipeline, CodePipelineSource, ManualApprovalStep, ShellStep, CodeBuildStep,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs'
import { SQSQueue } from './lib/constructs/sqs'
import { SharedFunctionLayer, LambdaFunction } from './lib/constructs/lambda'
import { Config, AppStage } from './config'
import { Options } from './lib/utils';
import { ApplicationStage } from './lib/application-stage';
// import { DynamoDbTable } from './lib/constructs/dynamodb'

export interface TemplateStackProps {
  CDK_DEFAULT_ACCOUNT: string
  AWS_DEFAULT_REGION: string
  DEPLOYED_BY: string
  STAGE: AppStage
  tags: { [key: string]: string }
}

export class FooStack extends Stack {
  constructor(scope: Construct, id: string, props: TemplateStackProps & StackProps) {
    super(scope, id, props)

    const { AWS_DEFAULT_REGION, CDK_DEFAULT_ACCOUNT, DEPLOYED_BY, STAGE } = props

    const config = new Config({
      CDK_DEFAULT_ACCOUNT,
      AWS_DEFAULT_REGION,
      DEPLOYED_BY,
      STAGE
    })

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

    const { lambdaFn: wooFunction } = new LambdaFunction(this, {
      prefix: config.projectName,
      layer,
      functionName: 'woo-handler',
      handler: 'handlers/woo-operation.handler',
      timeoutSecs: 30,
      memoryMB: 256,
      // reservedConcurrentExecutions: 10,
      sourceCodePath: 'assets/dist',
      environment: {
        SOME_ENV_FOR_YOUR_FUNCTION: 'some-value',
      },
      eventSources: {
        queues: [fooQueue],
        props: { batchSize: 10 }
      }
    })

    const gateway = new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: fooFunction
    })

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
      const pipeline = new CodePipeline(this, 'TemplatePipeline', {
          pipelineName: `TemplatePipeline-${envName}-${deployEnv.region}`,
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
