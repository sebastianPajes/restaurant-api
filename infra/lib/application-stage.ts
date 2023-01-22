/* eslint-disable max-classes-per-file */
/* eslint-disable no-new */
import {
    Stage, StageProps,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { RestaurantApiStack, TemplateStackProps } from '../stacks';

export class ApplicationStage extends Stage {
    /**
     * Deploys the API stack via CodePipeline.
     * Stages can deploy many stacks, but keeping it simple here with one.
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {StageProps=} props
     */
    constructor(scope: Construct, id: string, props: TemplateStackProps & StageProps) {
        super(scope, id, props);

        
        const { env, tags, AWS_DEFAULT_REGION, CDK_DEFAULT_ACCOUNT, DEPLOYED_BY, STAGE } = props;
        new RestaurantApiStack(this, 'Restaurant-Api', {
            stackName: 'Restaurant-Api',
            description: 'Resources for Restaurant Api Services',
            env,
            AWS_DEFAULT_REGION,
            CDK_DEFAULT_ACCOUNT,
            DEPLOYED_BY,
            STAGE,
            tags
        });
    }
}
