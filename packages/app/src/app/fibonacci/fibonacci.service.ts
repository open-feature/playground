import {HttpService} from '@nestjs/axios';
import {Injectable} from '@nestjs/common';
import {fibonacci} from '@openfeature/fibonacci';
import {Client} from '@openfeature/js-sdk';
import {lastValueFrom, map} from 'rxjs';
import {FeatureClient} from "@openfeature/nestjs-sdk";

@Injectable()
export class FibonacciService {
  private readonly FIB_SERVICE_URL = process.env.FIB_SERVICE_URL || 'http://localhost:30001';

  constructor(private readonly httpService: HttpService, @FeatureClient() private client: Client) {
  }

  async calculateFibonacci(num: number): Promise<{ result: number }> {
    const useRemoteFibService = await this.client.getBooleanValue('use-remote-fib-service', false);

    if (useRemoteFibService) {
      return lastValueFrom(
        this.httpService
          .get<{ result: number }>(`${this.FIB_SERVICE_URL}/calculate`, {
            params: {num},
            auth: {
              username: process.env.FIB_SERVICE_USER || '',
              password: process.env.FIB_SERVICE_PASS || '',
            },
          })
          .pipe(map((res) => res.data))
      );
    }

    return {
      result: await fibonacci(num),
    };
  }
}
