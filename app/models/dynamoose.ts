import * as dynamoose from 'dynamoose'
const https = require('https')

/**
 * Reference: https://hackernoon.com/lambda-optimization-tip-enable-http-keep-alive-6dc503f6f114
 */
const sslAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50, // From the aws-sdk source code
  rejectUnauthorized: true, // From the aws-sdk source code
})

sslAgent.setMaxListeners(0) // From the aws-sdk source code

const sdk = dynamoose.aws.sdk

sdk.config.update({
  httpOptions: {
    agent: sslAgent,
  },
})

export default dynamoose
