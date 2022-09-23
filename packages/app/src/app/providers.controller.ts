import { Controller, Get } from '@nestjs/common';
import { ENV_PROVIDER_ID, FLAGD_PROVIDER_ID, GO_PROVIDER_ID, SaasProvidersEnvMap } from './constants';

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
    console.log(process.env);
    // TODO: add go feature flag 
    return [
      FLAGD_PROVIDER_ID,
      ENV_PROVIDER_ID,
      ...Object.entries(SaasProvidersEnvMap).filter((v: [string, unknown])  => {
        console.log(v[1]);
        if (typeof v[1] === 'string') {
          return !!process.env[v[1]];
      };
     }).map((v: [string, unknown]) => v[0])];
   }
}
