import { Construct } from 'constructs'
import { 
  aws_route53 as r53,
  aws_route53_targets as r53Targets 
} from 'aws-cdk-lib'
import * as apigwAlphaV2 from '@aws-cdk/aws-apigatewayv2-alpha'

interface HostedZoneProps {
  prefix: string
  domainName: string
}

interface ApiGWARecordProps {
  prefix: string
  zone: r53.IHostedZone
  domainName: apigwAlphaV2.DomainName
  domainNameString: string
}

export class HostedZone {
  public readonly hostedZone: r53.IHostedZone

  constructor(scope: Construct, props: HostedZoneProps) {
    this.hostedZone = r53.HostedZone.fromLookup(scope, `${props.prefix}-${props.domainName.replace(/\./g,'-')}-zone`, {
      domainName: props.domainName,
    })
  }
}

export class ApiGWARecord {
  constructor(scope: Construct, props: ApiGWARecordProps) {
    new r53.ARecord(scope, `${props.prefix}-${props.domainNameString.replace(/\./g,'-')}-a-record`, {
      recordName: props.domainNameString,
      zone: props.zone,
      target: r53.RecordTarget.fromAlias(
        new r53Targets.ApiGatewayv2DomainProperties(
          props.domainName.regionalDomainName,
          props.domainName.regionalHostedZoneId,
        ),
      ),
    });
  }
}