import { Controller, Get, Param, Put } from '@nestjs/common';
import { ENV_PROVIDER_ID, FLAGD_PROVIDER_ID, ProviderId, SaasProvidersEnvMap } from './constants';
import { ProviderService } from './provider.service';

/**
 * Controller for reading/writing providers and related settings.
 */
@Controller('providers')
export class ProvidersController {

  constructor(
    private providerService: ProviderService,
  ) {}

  /**
   * Return the current provider
   * @returns provider setting
   */
  @Get('current')
  async getProvider() {
    return {
      provider:this.providerService.currentProvider
    };
  }

  /**
   * Return all configured providers
   * @returns array of provider ids.
   */
  @Get()
  async getAvailableProviders() {
    return this.providerService.getAvailableProviders();
  }

  /**
   * Switches the current provider
   * @returns array of provider ids.
   */
  @Put('current/:providerId')
  async setProvider(@Param('providerId') providerId: ProviderId) {
    this.providerService.switchProvider(providerId);
  }
}
