import { Construct  } from 'constructs'
import { aws_secretsmanager as secrets } from 'aws-cdk-lib'

interface GetSecretProps {
  prefix: string
  path: string
}

export class GetSecret {
  public readonly secret: secrets.ISecret

  constructor(scope: Construct, props: GetSecretProps) {
    this.secret = secrets.Secret.fromSecretNameV2(
      scope,
      `${props.path.replace(/\//g, '-')}-secrets`,
      props.path
    )
  }
}

