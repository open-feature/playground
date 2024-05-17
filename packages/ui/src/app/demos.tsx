import { SelectChangeEvent } from '@mui/material';
import { FlagdWebProvider } from '@openfeature/flagd-web-provider';
import {
  AvailableProvider,
  CB_PROVIDER_ID,
  FLAGD_OFREP_PROVIDER_ID,
  FLAGD_PROVIDER_ID,
  FLAGSMITH_PROVIDER_ID,
  FLIPT_PROVIDER_ID,
  GO_OFREP_PROVIDER_ID,
  GO_PROVIDER_ID,
  HARNESS_PROVIDER_ID,
  LD_PROVIDER_ID,
  ProviderId,
  SPLIT_PROVIDER_ID,
} from '@openfeature/utils';
import { CloudbeesWebProvider } from '@openfeature/web-cloudbees-provider';
import { FlagsmithProvider } from '@openfeature/web-flagsmith-provider';
import { HarnessWebProvider } from '@openfeature/web-harness-provider';
import { LaunchDarklyProvider } from '@openfeature/web-launchdarkly-provider';
import { NOOP_PROVIDER, OpenFeature, Provider } from '@openfeature/web-sdk';
import { SplitWebProvider } from '@openfeature/web-split-provider';
import { OFREPWebProvider } from '@openfeature/ofrep-web-provider';
import { TourProvider } from '@reactour/tour';
import Ajv, { AnySchema, ErrorObject, ValidateFunction } from 'ajv';
import EventEmitter from 'eventemitter3';
import { Component, ReactNode } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Fib3r from './demos/fib3r/fib3r-demo';
import { FLAGD_PROVIDER } from './constants';
import { Footer } from './footer';
import { JsonEditor, JsonOutput } from './json-editor';
import { styledFib3rSteps } from './demos/fib3r/tour';
import { JSON_UPDATED } from './types';
import { getData } from './utils';
import { GoFeatureFlagWebProvider } from '@openfeature/go-feature-flag-web-provider';
import { FliptWebProvider } from '@openfeature/flipt-web-provider';

type ProviderMap = Record<
  string,
  {
    provider?: Provider;
    factory: () => Provider;
  }
>;

export class Demos extends Component<
  Readonly<Record<string, never>>,
  {
    /* eslint-disable  @typescript-eslint/no-explicit-any */
    json: any;
    editorOn: boolean;
    editorAccess: boolean;
    availableProviders: AvailableProvider[];
    currentProvider: string;
    tourOpen: boolean;
    jsonErrors?: ErrorObject<string, Record<string, unknown>, unknown>[] | null | undefined;
    test: string;
  }
> {
  private validate: ValidateFunction | undefined;
  private jsonUpdatedEvent = new EventEmitter();
  private ajv = new Ajv({
    strict: false,
    useDefaults: true,
    allowUnionTypes: true,
    allowMatchingProperties: false,
  });
  private providerMap: ProviderMap = {
    [FLAGD_PROVIDER_ID]: {
      factory: () => {
        const flagdConfig = this.state.availableProviders.find((p) => p.id === FLAGD_PROVIDER_ID);
        return new FlagdWebProvider(
          {
            host: flagdConfig?.host ?? 'localhost',
            port: flagdConfig?.port ?? 8013,
            tls: flagdConfig?.tls ?? false,
          },
          console
        );
      },
    },
    [FLAGD_OFREP_PROVIDER_ID]: {
      factory: () => {
        const ofrepConfig = this.state.availableProviders.find((p) => p.id === FLAGD_OFREP_PROVIDER_ID);
        const tls = ofrepConfig?.tls ?? false;
        const host = ofrepConfig?.host ?? 'localhost';
        const port = ofrepConfig?.port ?? 8016;
        const baseUrl = `${tls ? 'https' : 'http'}://${host}:${port}`;
        return new OFREPWebProvider({ baseUrl, pollInterval: 1000 }, console);
      },
    },
    [GO_PROVIDER_ID]: {
      factory: () => {
        const ofrepConfig = this.state.availableProviders.find((p) => p.id === GO_PROVIDER_ID);
        const endpoint = ofrepConfig?.url ?? 'http://localhost:1031';
        return new GoFeatureFlagWebProvider({ endpoint }, console);
      },
    },
    [GO_OFREP_PROVIDER_ID]: {
      factory: () => {
        const ofrepConfig = this.state.availableProviders.find((p) => p.id === GO_OFREP_PROVIDER_ID);
        const baseUrl = ofrepConfig?.url ?? 'http://localhost:1031';
        return new OFREPWebProvider({ baseUrl, pollInterval: 1000 }, console);
      },
    },
    [HARNESS_PROVIDER_ID]: {
      factory: () => {
        return new HarnessWebProvider(this.getProviderCredential(HARNESS_PROVIDER_ID), console);
      },
    },
    [CB_PROVIDER_ID]: {
      factory: () => {
        return new CloudbeesWebProvider({ key: this.getProviderCredential(CB_PROVIDER_ID), logger: console });
      },
    },
    [FLAGSMITH_PROVIDER_ID]: {
      factory: () => {
        return new FlagsmithProvider({
          logger: console,
          environmentID: this.getProviderCredential(FLAGSMITH_PROVIDER_ID),
        });
      },
    },
    [LD_PROVIDER_ID]: {
      factory: () => {
        return new LaunchDarklyProvider({ logger: console, clientSideId: this.getProviderCredential(LD_PROVIDER_ID) });
      },
    },
    [SPLIT_PROVIDER_ID]: {
      factory: () => {
        return new SplitWebProvider(this.getProviderCredential(SPLIT_PROVIDER_ID));
      },
    },
    [FLIPT_PROVIDER_ID]: {
      factory: () => {
        const fliptConfig = this.state.availableProviders.find((p) => p.id === FLIPT_PROVIDER_ID);
        return new FliptWebProvider('default', { url: fliptConfig?.url });
      },
    },
  };

  constructor(props: Record<string, never>) {
    super(props);
    this.state = {
      json: {},
      tourOpen: true,
      editorOn: false,
      editorAccess: false,
      availableProviders: [],
      currentProvider: '',
      test: '',
    };
  }

  override async componentDidMount() {
    const [editorAccess, availableProviders, schema] = await Promise.all([
      getData<boolean>('/utils/show-editor'),
      getData<AvailableProvider[]>('/providers'),
      getData<AnySchema>('/utils/schema'),
    ]);

    this.setState({
      editorAccess,
      availableProviders,
    });

    if (!this.validate) {
      this.validate = this.ajv.compile(schema);
    }

    await this.configureControls();
  }

  override render(): ReactNode {
    return (
      <>
        <BrowserRouter>
          {/* The rest of your app goes here */}

          <TourProvider
            steps={styledFib3rSteps}
            maskClassName="tour-mask"
            onClickMask={() => undefined}
            padding={10}
            disableFocusLock={true}
            defaultOpen={false}
            onClickClose={() => this.setState({ tourOpen: false })}
          >
            <Routes>
              <Route path="/" element={<Fib3r tourOpen={this.state.tourOpen} jsonUpdated={this.jsonUpdatedEvent} />} />
              {/* new paths can be added here, and will have the same json-editor, footer with provider switcher, etc */}
            </Routes>
            <Footer
              tourAvailable={this.shouldShowEditor(this.state.currentProvider)}
              availableProviders={this.state.availableProviders}
              currentProvider={this.state.currentProvider}
              onOpenTour={() => {
                this.setState({ tourOpen: true });
              }}
              onSelectProvider={this.onSelectProvider.bind(this)}
            />
            {/* editor */}
            <div>
              <JsonEditor
                errorMessage={
                  this.state.jsonErrors
                    ? `${this.state.jsonErrors?.[0].schemaPath} ${this.state.jsonErrors?.[0].message}`
                    : undefined
                }
                hidden={!this.state.editorOn}
                callBack={this.onJsonUpdate.bind(this)}
                json={this.state.json}
              />
            </div>
          </TourProvider>
        </BrowserRouter>
      </>
    );
  }

  private getProviderCredential(providerId: ProviderId): string {
    const credential = this.state.availableProviders.find((p) => p.id === providerId)?.webCredential;
    if (credential) {
      return credential;
    }
    throw new Error(`Credential not available for ${providerId}`);
  }

  private async configureControls() {
    try {
      const promises: [Promise<{ provider: string }>, Promise<unknown>] = [
        getData<{ provider: string }>('/providers/current'),
        getData<unknown>('/utils/json'),
      ];

      const [provider, json] = await Promise.all(promises);

      await this.switchClientProvider(provider.provider);

      this.setState({
        currentProvider: provider.provider,
        json,
        // hide the editor unless we are using the flagd provider.
        editorOn: this.shouldShowEditor(provider.provider),
      });
      this.setState({ tourOpen: this.state.tourOpen && this.shouldShowEditor(provider.provider) });
    } catch (err) {
      throw new Error('Unable to load page data... Did you forget to run the server?');
    }
  }

  private async switchClientProvider(providerName: string) {
    let provider: Provider;
    if (this.providerMap[providerName]?.provider) {
      provider = this.providerMap[providerName].provider!;
    } else {
      provider = this.providerMap[providerName]?.factory();
      if (provider) {
        this.providerMap[providerName].provider = provider;
      }
    }
    if (!provider) {
      provider = NOOP_PROVIDER;
    }
    OpenFeature.setProvider(provider);
  }

  private async onJsonUpdate(jsonOutput: JsonOutput) {
    if (this.state.editorAccess && this.validate) {
      const valid = this.validate(jsonOutput.jsObject);
      if (valid) {
        await this.syncData(jsonOutput.json);
        this.setState({ jsonErrors: undefined });
      } else {
        this.setState({ jsonErrors: this.validate.errors });
      }
    }
    this.jsonUpdatedEvent.emit(JSON_UPDATED, jsonOutput);
  }

  // save the JSON and get all data.
  private async syncData(body: string) {
    await this.putJson(body);
    await this.configureControls();
  }

  private async onSelectProvider(event: SelectChangeEvent<unknown>): Promise<void> {
    await fetch(`/providers/current/${event.target.value}`, {
      method: 'PUT',
    });
    await this.configureControls();
  }

  // thin wrapper around fetch for PUTing JSON.
  private async putJson(body: string) {
    await fetch(`/utils/json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
  }

  // Show the editor when the configuration can be modified
  private shouldShowEditor(provider?: string) {
    return this.state.editorAccess && provider === FLAGD_PROVIDER;
  }
}
