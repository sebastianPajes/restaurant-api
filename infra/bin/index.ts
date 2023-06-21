#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { RestaurantApiStack } from '../stacks'

(async () => {
  new RestaurantApiStack(
    new App(),
    'Restaurant-API-despliegue',
    {
      stackName: 'Restaurant-Api-despliegue',
      description: `Resources for Restaurant-Api Service`,
    }
  )
})()
