/**
 * Pipeline Stacks
 * This creates the Pipelines, and is also called to deploy the app via the pipeline.
 *
 * Before deployment:
 * - Update config/index.ts
 * - Run pipeline setup stacks
 * - Push code to CodeCommit repo.
 */

/* eslint-disable no-new */
import 'source-map-support/register';
import { App } from 'aws-cdk-lib';
import { PipelineStack } from '../stacks';
import { options } from '../config';

const {
    defaultRegion, toolsAccount, appPipelines,
} = options;
const app = new App();

/**
 * Deploy a Pipeline for each App Account.
 *
 * Deploy all pipelines:
 * cdk deploy --all
 *
 * Deploy a single pipeline:
 * cdk deploy Pipeline-<name>-<region>
 *
 * You can use:
 * cdk list
 * to get the names of all the stacks that will be deployed.
 *
 * Create CloudFormation template:
 * cdk synth Pipeline-<name>-<region> > dev-pipeline.yaml
 */
appPipelines.forEach((acc) => {
    const {
        name, account, region, branch, stage, preApproval, tags
    } = acc;
    new PipelineStack(app, `RestaurantApiStack-${name}-${region || defaultRegion}`, {
        description: `${name.toUpperCase()} Pipeline Stack`,
        env: {
            region: defaultRegion,
            account: toolsAccount,
        },
        deployEnv: {
            region: region || defaultRegion,
            account,
        },
        tags,
        envName: name,
        branch,
        preApproval,
        options,
        stage
    });
});
