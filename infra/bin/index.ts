#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { FooStack } from '../stacks'

(async () => {
  new FooStack(
    new App(),
    'Restaurant-API',
    {
      stackName: 'Restaurant-Api',
      description: `Resources for Restaurant-Api Service`,
    }
  )
})()