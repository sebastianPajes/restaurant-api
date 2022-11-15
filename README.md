## lambda-project-cdk-template

Use this template as a starter for a serverless CDK project (projects that typically involve lambda).

If you're just starting out with CDK, you can take a look at [Useful Resources](#useful-resources)

## Structure
- `app/` -- This is where lambda handler code goes
- `infra/` -- this is where CDK infrastructure code goes

## Setup
- Update all dependencies to latest versions in `infra/package.json` and `app/package.json`
- Install dependencies
  ```bash
  cd infra;yarn;cd ..;cd app;yarn
  ```
- Make sure you have [SSO setup correctly](https://www.notion.so/greenlinepos/AWS-CLI-Setup-with-Leapp-a64be79af5a64d0fa0974dd1164a19f9)

## Important files
- `infra/config.ts` -- this is where you configure your project settings like the name, envs etc
- `infra/bin/index.ts` -- this is the entry file. Here you can set up tags and async operations that should run before/after your stack synthed/deployed
- `infra/stacks.ts` -- this is where you define cloudformation stacks that you can add resources into

## Synth and Deploy
- Ensure you have `.env.ENVIRONMENT` in `infra/` -- See `.env-example`
- Enable the correct SSO profile (usually `greenline-sandbox`)
- From the project root, run:
```bash
# start by synth to check everything is good
# synth just means a cloudformation template will be genenrated in a folder called cdk.out
# NB: this assumes a profile named 'greenline-sandbox' exists and is active, if you want to use a different profile name, change the it in package.json
yarn synth-local

# then you can deploy
# Here the template generated during synth is sent to cloudformation to create your resources
# NB: this assumes a profile named 'greenline-sandbox' exists and is active, if you want to use a different profile name, change the it in package.json
yarn deploy-local
```

## Github Actions CI/CD
- Talk to Sam/Emmanuel

## Useful Resources
- Introduction to CDK resources
  - [CDK Workshop](https://cdkworkshop.com/)
  - [CDK Tutorial](https://bobbyhadz.com/blog/aws-cdk-tutorial-typescript)
  - [AWS CDK docs](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)
  - [Awesome CDK](https://github.com/kalaiser/awesome-cdk)
  - [CDK API Reference documentation](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-construct-library.html)
- See other Blaze Canada projects that use this type of template:
  - [Websockets](https://github.com/GetGreenline/websockets-cdk)
  - [SMS-Marketing](https://github.com/GetGreenline/marketing-service)
