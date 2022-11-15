import { Construct } from 'constructs'
import { 
  RemovalPolicy, 
  aws_dynamodb as dynamodb
} from 'aws-cdk-lib'
import { stageValue } from '../utils'

interface DynamoDbTableConstructProps {
  prefix: string
  tableName: string
  partitionKey: dynamodb.Attribute
  sortKey?: dynamodb.Attribute
  billingMode: dynamodb.BillingMode
  stream?: dynamodb.StreamViewType
  globalSecondaryIndexes?: dynamodb.GlobalSecondaryIndexProps[]
}

export class DynamoDbTable {
  public readonly table: dynamodb.Table

  constructor(scope: Construct, props: DynamoDbTableConstructProps) {
    this.table = new dynamodb.Table(
      scope,
      `${props.prefix}-dynamodb-table-${props.tableName}`,
      {
        tableName: props.tableName,
        partitionKey: props.partitionKey,
        sortKey: props.sortKey,
        stream: props.stream,
        billingMode: props.billingMode,
        timeToLiveAttribute: 'ttl',
        removalPolicy: stageValue.other({ production: RemovalPolicy.RETAIN }, RemovalPolicy.DESTROY)
      }
    )
    for (const gsi of props.globalSecondaryIndexes || []) {
      this.table.addGlobalSecondaryIndex(gsi)
    }
  }
}
