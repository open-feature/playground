import { HttpService } from '@nestjs/axios';
import { Controller, Get, Param, Put } from '@nestjs/common';
import { ProviderService, ProviderId } from '@openfeature/provider';
import { PinoLogger } from 'nestjs-pino';
import { lastValueFrom } from 'rxjs';

/**
 * Controller for reading/writing providers and related settings.
 */
@Controller('providers')
export class ProvidersController {
  private readonly FIB_SERVICE_URL = process.env.FIB_SERVICE_URL || 'http://localhost:30001';

  constructor(
    private readonly providerService: ProviderService,
    private readonly httpService: HttpService,
    private readonly logger: PinoLogger
  ) {}

  /**
   * Return the current provider
   * @returns provider setting
   */
  @Get('current')
  async getProvider() {
    return {
      provider: this.providerService.currentProvider,
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
    await Promise.all([
      this.providerService.switchProvider(providerId),
      // Best effort to switch remote service
      lastValueFrom(
        this.httpService.put(`${this.FIB_SERVICE_URL}/providers/current/${providerId}`, { setTimeout: 1000 })
      ).catch(() => {
        this.logger.error('Failed to switch the provider on the remote service');
      }),
    ]);
  }
}
