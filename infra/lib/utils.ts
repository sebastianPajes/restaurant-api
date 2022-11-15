import { 
  REQUIRED_ENV_VARIABLES, 
  ENV_VARIABLES, 
  SetAppStageProfile 
} from './types'
import { Config } from '../config'
import { AppStage, AppStageProfiles } from './enums'

export const setAppStageProfile: SetAppStageProfile = {
  prod: AppStageProfiles.PRODUCTION,
  staging: AppStageProfiles.STAGING,
  sandbox: AppStageProfiles.SANDBOX,
}

export type Options = {
  repoString: string, // owner/repo
  connectionArn: string, // The CodeStar connection to GitHub (Arn)
  version: string,
  defaultRegion: string,
  toolsAccount: string,
  appPipelines: {
      name: string,
      account: string,
      region?: string, // Use the default region if not specified
      branch: string,
      preApproval?: boolean,
      stage: AppStage,
      tags: { [key: string]: string }
  }[],
};

/** Necessary if deploying from localhost */
export const getDeploymentStage = (stage: string | undefined): string => {
  const allowedStages = [
    AppStage.PRODUCTION as string,
    AppStage.STAGING as string,
    AppStage.SANDBOX as string,
  ]

  if (!stage || !allowedStages.includes(stage))
    throw new Error(`STAGE has to be either: ${allowedStages}, was ${stage}`)

  return stage
}

export const validateEnv = (
  requiredEnvs: Array<keyof REQUIRED_ENV_VARIABLES>,
  env: { [key: string]: string | undefined },
): ENV_VARIABLES => {
  requiredEnvs.forEach((requiredEnv: string) => {
    if (!env[requiredEnv]) {
      throw new Error(`${requiredEnv} required`)
    }
  })

  return env as ENV_VARIABLES
}

export const isBoolean = (val: any): boolean => 'boolean' === typeof val

export class StageValue {
  constructor(private config: Config) {}
  /** return a number value depending on the stage  */
  num(
    {
      production,
      staging,
      sandbox,
    }: {
      production?: number
      staging?: number
      sandbox?: number
    },
    defaultValue: number,
  ): number {
    if (this.config.stage === AppStage.PRODUCTION && Number.isFinite(production))
      return production as number
    if (this.config.stage === AppStage.STAGING && Number.isFinite(staging)) return staging as number
    if (this.config.stage === AppStage.SANDBOX && Number.isFinite(sandbox)) return sandbox as number

    return defaultValue
  }
  /** return a boolean value depending on the stage  */
  bool(
    {
      production,
      staging,
      sandbox,
    }: {
      production?: boolean
      staging?: boolean
      sandbox?: boolean
    },
    defaultValue: boolean,
  ): boolean {
    if (this.config.stage === AppStage.PRODUCTION && isBoolean(production)) return production as boolean
    if (this.config.stage === AppStage.STAGING && isBoolean(staging)) return staging as boolean
    if (this.config.stage === AppStage.SANDBOX && isBoolean(sandbox)) return sandbox as boolean

    return defaultValue
  }
  /** return a string value depending on the stage */
  str(
    {
      production,
      staging,
      sandbox,
    }: {
      production?: string
      staging?: string
      sandbox?: string
    },
    defaultValue: string,
  ): string {
    if (this.config.stage === AppStage.PRODUCTION && production) return production as string
    if (this.config.stage === AppStage.STAGING && staging) return staging as string
    if (this.config.stage === AppStage.SANDBOX && sandbox) return sandbox as string

    return defaultValue
  }
  other<T>(
    {
      production,
      staging,
      sandbox,
    }: {
      production?: T
      staging?: T
      sandbox?: T
    },
    defaultValue: T | undefined,
  ): T | undefined {
    if (this.config.stage === AppStage.PRODUCTION && production) return production
    if (this.config.stage === AppStage.STAGING && staging) return staging
    if (this.config.stage === AppStage.SANDBOX && sandbox) return sandbox

    return defaultValue
  }
  any(
    {
      production,
      staging,
      sandbox,
    }: {
      production?: any
      staging?: any
      sandbox?: any
    },
    defaultValue: any,
  ): any {
    if (this.config.stage === AppStage.PRODUCTION && production) return production as any
    if (this.config.stage === AppStage.STAGING && staging) return staging as any
    if (this.config.stage === AppStage.SANDBOX && sandbox) return sandbox as any

    return defaultValue
  }
}

/**
 * Some AWS resources do not allow names greater than 32 chars.
 * Use this function to set a shorter name if needed.
 */
export const useShortName = (name: string, shortName: string, charLimit = 32): string => {
  return name.length > charLimit ? shortName : name
}
