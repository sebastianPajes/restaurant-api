import * as path from 'path'
import * as dotenv from 'dotenv'
import { REQUIRED_ENV_VARIABLES } from './lib/types'
import { validateEnv, getDeploymentStage, Options } from './lib/utils'

dotenv.config({ 
    path: path.resolve(__dirname, `./.env.${getDeploymentStage(process.env.STAGE)}`) 
  })

  export const requiredEnvs: Array<keyof REQUIRED_ENV_VARIABLES> = [
    'CDK_DEFAULT_ACCOUNT',
    'AWS_DEFAULT_REGION',
    'DEPLOYED_BY',
    'STAGE',
  ]

const validatedEnvs = validateEnv(requiredEnvs, process.env)
const stage = validatedEnvs.STAGE

export const config = {
    projectName: `${stage}-restaurant-api`,
    deploymentEnvironment: process.env.DEPLOYMENT_ENV,
    stage,
    stack: {
      env: {
        account: validatedEnvs.CDK_DEFAULT_ACCOUNT,
        region: validatedEnvs.AWS_DEFAULT_REGION,
      },
    },
    deployedBy: validatedEnvs.DEPLOYED_BY,
    aws:{
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
          employeeIndex: {
            indexName: 'employee-index',
            partitionKeyName: 'employeeUsername',
          },
          locationIndex: {
            indexName: 'location-index',
            partitionKeyName: 'locationName',
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
 
// PIPELINE CONFIG
export const options: Options = {
    repoString: 'sebastian1710/cdk-template', // Bitbucket owner/repository
    connectionArn: 'arn:aws:codestar-connections:us-east-1:275179852100:connection/bbcab91e-eeaa-4800-ac72-e5f17f33d1f1', // CodeStar GitHub connection ARN
    version: '1', // Increment to trigger a pipeline deployment
    defaultRegion: 'us-east-1',
    toolsAccount: '275179852100', // Account where Pipelines are deployed
    appPipelines: [
        {
            name: 'sandbox', // Dev environment
            account: '482047510037',
            branch: 'sandbox',
            preApproval: false, // Require approval before Create Change Set
        },
        {
            name: 'staging', // UAT/QA environment
            account: '651997905879',
            branch: 'staging',
            preApproval: false,
        },
        {
            name: 'prod', // Production environment
            account: '145474670446',
            branch: 'main',
            preApproval: true,
        }
    ],
}; 