import { Construct  } from 'constructs'
import { CfnOutput, aws_ssm as ssm } from 'aws-cdk-lib'

interface GetSystemParameterStringProps {
  prefix: string
  path: string
}

export class GetSystemParameterString {
  public readonly value: string

  constructor(scope: Construct, props: GetSystemParameterStringProps) {
    this.value = ssm.StringParameter.fromStringParameterAttributes(scope, `${props.prefix}-${props.path.replace(/\//g, '-')}-parameters`, {
      parameterName: props.path,
    }).stringValue
  }
}

export class GetSystemParameterStringList {
  public readonly value: string[]

  constructor(scope: Construct, props: GetSystemParameterStringProps) {
    this.value = ssm.StringListParameter.fromStringListParameterName(
      scope, `${props.prefix}-${props.path.replace(/\//g, '-')}-parameters`, 
      props.path
    ).stringListValue
  }
}

   