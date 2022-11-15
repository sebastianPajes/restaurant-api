import { Construct } from 'constructs'
import { aws_ec2 as ec2 } from 'aws-cdk-lib'

interface ExistingVPCProps {
  prefix: string
}

export class ExistingVPC {
  public readonly vpc: ec2.IVpc

  constructor(scope: Construct, props: ExistingVPCProps) {
    this.vpc = ec2.Vpc.fromLookup(scope, `${props.prefix}-existing-vpc`, {
      vpcName: 'main',
    })
  }
}
