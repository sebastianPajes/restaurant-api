#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { RestaurantApiStack } from '../stacks'

// ;(async () => {
//   new RestaurantApiStack(
//     new App(),
//     'Foo-Api',
//     {
//       stackName: 'Foo-Api',
//       description: `Resources for Foo Service`,
//     }
//   )
// })()