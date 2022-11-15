import { aws_sqs as sqs, Duration } from 'aws-cdk-lib'
import { Construct  } from 'constructs'

interface SQSQueueProps {
  queueName: string
  visibilityTimeout?: number
}

export class SQSQueue {
  public readonly queue: sqs.IQueue

  constructor(scope: Construct, props: SQSQueueProps) {
    this.queue = new sqs.Queue(scope, props.queueName, { 
      queueName: props.queueName,
      visibilityTimeout: Duration.seconds(props.visibilityTimeout || 30),
    })
  }
}