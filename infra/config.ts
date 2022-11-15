import * as path from 'path'
import * as dotenv from 'dotenv'
import { REQUIRED_ENV_VARIABLES } from './lib/types'
import { validateEnv, Options } from './lib/utils'

// dotenv.config({ 
//     path: path.resolve(__dirname, `./.env.${getDeploymentStage(process.env.STAGE)}`) 
//   })

  export const requiredEnvs: Array<keyof REQUIRED_ENV_VARIABLES> = [
    'CDK_DEFAULT_ACCOUNT',
    'AWS_DEFAULT_REGION',
    'DEPLOYED_BY',
    'STAGE',
  ]

// const validatedEnvs = validateEnv(requiredEnvs, process.env)
// const stage = validatedEnvs.STAGE

export interface IConfig {
  projectName: string
  // commitSHA: string
  stage: AppStage
  stack: {
    env: {
      account: string
      region: string
      batchSize: string | number
    }
  }
  deployedBy: string
  aws: {
    ssm: {
      parameterPaths: {
        ecomEnvs: string
        gatewayEnvs: string
      },
    },
    lambda: {
      searchPath: string
    }
    dynamoDB: {
      globalIndexes: {
        retailerSlugIndex: {
          indexName: string
          partitionKeyName: string
        },
      },
    },
  },
}

export enum AppStage {
  SANDBOX = 'sandbox',
  STAGING = 'staging',
  PRODUCTION = 'prod'
} 

export class Config implements IConfig {
  projectName: string
  // commitSHA: string
  stage: AppStage
  stack: { env: { account: string; region: string; batchSize: string | number } }
  deployedBy: string
  aws: { 
    ssm: { 
      parameterPaths: { 
        ecomEnvs: string; 
        gatewayEnvs: string 
      } 
    }; 
    lambda: { 
      searchPath: string 
    }; 
    dynamoDB: { 
      globalIndexes: {
        retailerSlugIndex: { 
          indexName: string
          partitionKeyName: string 
        },
        discountIndex: {
          indexName: string
          partitionKeyName: string
          sortKey: string
        } 
      }
    } 
  }
  constructor(env: REQUIRED_ENV_VARIABLES) {
    const validatedEnvs = validateEnv(requiredEnvs, env)
    const stage = env.STAGE

    this.projectName = `${stage}-template-cdk`
    // this.commitSHA = validatedEnvs.COMMIT_SHA
    this.stage
    this.stack = {
      env: {
        account: validatedEnvs.CDK_DEFAULT_ACCOUNT,
        region: validatedEnvs.AWS_DEFAULT_REGION,
        batchSize: Number(process.env.BATCH_SIZE || 10),
      }
    }
    this.deployedBy = validatedEnvs.DEPLOYED_BY,
    this.aws = {
      ssm: {
        parameterPaths: {
          ecomEnvs: `/ecomm/envs`,
          gatewayEnvs: `/${stage}/gateway/authz/restApi/envs`,
        },
      },
      lambda: {
        searchPath: 'products',
      },
      dynamoDB: {
        globalIndexes: {
          retailerSlugIndex: {
            indexName: 'retailerSlug-index',
            partitionKeyName: 'retailerSlug',
          },
          discountIndex: {
            indexName: 'processOnDateUTC-index',
            partitionKeyName: 'pk',
            sortKey: 'processOnDateUTC',
          }
        }
      }
    }
  }
}
 
// PIPELINE CONFIG
export const options: Options = {
    repoString: 'sebastianPajes/restaurant-api', // GitHub owner/repository
    connectionArn: 'arn:aws:codestar-connections:us-east-1:275179852100:connection/bce69f03-7c8d-4d70-8f74-04b9218cd0cc', // CodeStar GitHub connection ARN
    version: '1', // Increment to trigger a pipeline deployment
    defaultRegion: 'us-east-1',
    toolsAccount: '275179852100', // Account where Pipelines are deployed
    appPipelines: [
        {
            name: 'sandbox', // Dev environment
            account: '482047510037',
            branch: 'sandbox',
            stage: AppStage.SANDBOX,
            preApproval: false, // Require approval before Create Change Set
            tags: { Project: 'template-api', Stage: 'sandbox' }
        },
        {
            name: 'staging', // UAT/QA environment
            account: '651997905879',
            branch: 'staging',
            preApproval: false,
            stage: AppStage.STAGING,
            tags: { Project: 'template-api', Stage: 'staging' }
        },
        {
            name: 'prod', // Production environment
            account: '145474670446',
            branch: 'main',
            preApproval: true,
            stage: AppStage.PRODUCTION,
            tags: { Project: 'template-api', Stage: 'production' }
        }
    ],
}; 