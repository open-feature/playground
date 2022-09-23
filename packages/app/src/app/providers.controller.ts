import { Controller, Get, Param, Put } from '@nestjs/common';
import { ENV_PROVIDER_ID, FLAGD_PROVIDER_ID, SaasProvidersEnvMap } from './constants';

/**
 * Controller for reading/writing providers and related settings.
 */
@Controller('providers')
export class ProvidersController {
  /**
   * Return the current provider
   * @returns provider setting
   */
  @Get('current')
  async getProvider() {
    return {
      provider: process.argv[2],
    };
  }

  /**
   * Return all configured providers
   * @returns array of provider ids.
   */
  @Get()
  async getAvailableProviders() {
    // TODO: add go feature flag
    return [
      FLAGD_PROVIDER_ID,
      ENV_PROVIDER_ID,
      ...Object.entries(SaasProvidersEnvMap)
        .filter((v: [string, unknown]) => {
          if (typeof v[1] === 'string') {
            return !!process.env[v[1]];
          }
        })
        .map((v: [string, unknown]) => v[0]),
    ];
  }

  /**
   * Return all configured providers
   * @returns array of provider ids.
   */
  @Put('current/:providerId')
  async setProvider(@Param('providerId') providerId: string) {
    
  }
}
