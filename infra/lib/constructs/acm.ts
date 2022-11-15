import { Construct } from 'constructs'
import { aws_certificatemanager as acm } from 'aws-cdk-lib'

interface ACMCertificateConstructProps {
  prefix: string
  certificateArn: string
}

/** Import an already existing ACM TLS certificate for use on loadbalancers, API GW etc */
export class ACMCertificate {
  public readonly certificate: acm.ICertificate

  constructor(scope: Construct, props: ACMCertificateConstructProps) {
    this.certificate = acm.Certificate.fromCertificateArn(scope, `${props.prefix}-acm-certificate`, props.certificateArn)
  }
}

