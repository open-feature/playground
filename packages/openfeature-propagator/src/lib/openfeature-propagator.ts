import {
  Context,
  TextMapGetter,
  TextMapPropagator,
  TextMapSetter,
  propagation,
  BaggageEntry,
} from '@opentelemetry/api';
import { isTracingSuppressed } from '@opentelemetry/core';
import { OpenFeature, EvaluationContext } from '@openfeature/nestjs-sdk';

const KEY_PAIR_SEPARATOR = '=';
const PROPERTIES_SEPARATOR = ';';
const ITEMS_SEPARATOR = ',';

// Name of the http header used to propagate the baggage
const OF_HEADER = 'openfeature';
// Maximum number of name-value pairs allowed by w3c spec
const MAX_NAME_VALUE_PAIRS = 180;
// Maximum number of bytes per a single name-value pair allowed by w3c spec
const MAX_PER_NAME_VALUE_PAIRS = 4096;
// Maximum total length of all name-value pairs allowed by w3c spec
const MAX_TOTAL_LENGTH = 8192;

/**
 * Inspired by the HttpBaggagePropagator
 *
 * References:
 *  - https://github.com/obecny/opentelemetry-js/blob/master/packages/opentelemetry-core/src/baggage/propagation/HttpBaggagePropagator.ts
 *  - https://github.com/open-telemetry/opentelemetry-js/blob/main/packages/opentelemetry-core/src/baggage/propagation/W3CBaggagePropagator.ts
 */
export class OpenFeaturePropagator implements TextMapPropagator {
  inject(context: Context, carrier: unknown, setter: TextMapSetter): void {
    const evaluationContext = OpenFeature.getTransactionContext();

    if (isTracingSuppressed(context)) return;

    const keyPairs = this.getKeyPairs(evaluationContext)
      .filter((pair: string) => {
        return pair.length <= MAX_PER_NAME_VALUE_PAIRS;
      })
      .slice(0, MAX_NAME_VALUE_PAIRS);
    const headerValue = this.serializeKeyPairs(keyPairs);
    if (headerValue.length > 0) {
      setter.set(carrier, OF_HEADER, headerValue);
    }
  }

  extract(context: Context, carrier: unknown, getter: TextMapGetter): Context {
    const headerValue = getter.get(carrier, OF_HEADER);

    const contextString = Array.isArray(headerValue) ? headerValue.join(ITEMS_SEPARATOR) : headerValue;

    if (!contextString) return context;

    const baggage: Record<string, BaggageEntry> = {};

    const pairs = contextString.split(ITEMS_SEPARATOR);
    pairs.forEach((entry) => {
      const keyPair = this.parsePairKeyValue(entry);
      if (keyPair) {
        baggage[keyPair.key] = { value: keyPair.value };
      }
    });
    if (Object.entries(baggage).length === 0) {
      return context;
    }
    return propagation.setBaggage(context, propagation.createBaggage(baggage));
  }

  fields(): string[] {
    return [OF_HEADER];
  }

  private getKeyPairs(evalContext: EvaluationContext): string[] {
    const keyParts: string[] = [];
    for (const [key, value] of Object.entries(evalContext)) {
      /**
       * Only string values are currently supported. Other eval context properties
       * would need to be stringified and type info would need to be stored in metadata.
       */
      if (typeof value === 'string') {
        keyParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    }
    return keyParts;
  }

  private serializeKeyPairs(keyPairs: string[]): string {
    return keyPairs.reduce((hValue: string, current: string) => {
      const value = `${hValue}${hValue !== '' ? ITEMS_SEPARATOR : ''}${current}`;
      return value.length > MAX_TOTAL_LENGTH ? hValue : value;
    }, '');
  }

  private parsePairKeyValue(entry: string) {
    const valueProps = entry.split(PROPERTIES_SEPARATOR);
    if (valueProps.length <= 0) return;
    const keyPairPart = valueProps.shift();
    if (!keyPairPart) return;
    const keyPair = keyPairPart.split(KEY_PAIR_SEPARATOR);
    if (keyPair.length !== 2) return;
    const key = decodeURIComponent(keyPair[0].trim());
    const value = decodeURIComponent(keyPair[1].trim());

    return { key, value };
  }
}
