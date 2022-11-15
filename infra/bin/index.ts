#!/usr/bin/env node
import 'source-map-support/register'
import { App } from 'aws-cdk-lib'
import { FooStack } from '../stacks'

// ;(async () => {
//   new FooStack(
//     new App(),
//     'Foo-Api',
//     {
//       stackName: 'Foo-Api',
//       description: `Resources for Foo Service`,
//     }
//   )
// })()