import { Box, Modal, SelectChangeEvent } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { FlagdWebProvider } from '@openfeature/flagd-web-provider';
import { AvailableProvider, CB_PROVIDER_ID, FLAGD_PROVIDER_ID, FLAGSMITH_PROVIDER_ID, HARNESS_PROVIDER_ID, LD_PROVIDER_ID, ProviderId, SPLIT_PROVIDER_ID } from '@openfeature/utils';
import { CloudbeesWebProvider } from '@openfeature/web-cloudbees-provider';
import { FlagsmithProvider } from '@openfeature/web-flagsmith-provider';
import { HarnessWebProvider } from '@openfeature/web-harness-provider';
import { LaunchDarklyProvider } from '@openfeature/web-launchdarkly-provider';
import { Client, EvaluationDetails, NOOP_PROVIDER, OpenFeature, Provider, ProviderEvents } from '@openfeature/web-sdk';
import { SplitWebProvider } from '@openfeature/web-split-provider';
import { TourProps, withTour } from '@reactour/tour';
import Ajv, { AnySchema, ErrorObject, ValidateFunction } from 'ajv';
import { Component, ComponentType } from 'react';
import { Background } from './background';
import { Calculator } from './calculator';
import { FLAGD_PROVIDER } from './constants';
import { Footer } from './footer';
import { Header } from './header';
import { JsonEditor, JsonOutput } from './json-editor';
import { Login } from './login';
import { generateTheme } from './utils';

const DEFAULT_HEX = '888888';

const STEP_EDIT_HEX = 7;
const STEP_SNAZZY = 9;
const STEP_UH_OH = 11;
const STEP_LOGIN = 13;
const STEP_FAST_FIB = 14;
const STEP_DONE = 15;

type ProviderMap = Record<
  string,
  {
    provider?: Provider;
    factory: () => Provider;
  }
>;

class App extends Component<
  TourProps,
  {
    welcomeMessage: boolean;
    hexColor: string;
    json: unknown;
    showLoginModal: boolean;
    email: string | null | undefined;
    editorOn: boolean;
    editorAccess: boolean;
    result?: number | string;
    availableProviders: AvailableProvider[];
    currentProvider?: string;
    calculateError?: boolean;
    jsonErrors?: ErrorObject<string, Record<string, unknown>, unknown>[] | null | undefined;
  }
> {
  private validate: ValidateFunction | undefined;
  private ajv: Ajv;
  private client: Client;
  private providerMap: ProviderMap = {
    [FLAGD_PROVIDER_ID]: {
      factory: () => {
        return new FlagdWebProvider({ host: 'localhost', port: 8013, tls: false }, console);
      }
    },
    [HARNESS_PROVIDER_ID]: {
      factory: () => {
        return new HarnessWebProvider(this.getProviderCredential(HARNESS_PROVIDER_ID), console);
      }
    },
    [CB_PROVIDER_ID]: {
      factory: () => {
        console.log(this.getProviderCredential(CB_PROVIDER_ID));
        return new CloudbeesWebProvider({ key: this.getProviderCredential(CB_PROVIDER_ID), logger: console });
      }
    },
    [FLAGSMITH_PROVIDER_ID]: {
      factory: () => {
        return new FlagsmithProvider({ logger: console, environmentID: this.getProviderCredential(FLAGSMITH_PROVIDER_ID) });
      }
    },
    [LD_PROVIDER_ID]: {
      factory: () => {
        return new LaunchDarklyProvider({ logger: console, clientSideId: this.getProviderCredential(LD_PROVIDER_ID) });
      }
    },
    [SPLIT_PROVIDER_ID]: {
      factory: () => {
        return new SplitWebProvider(this.getProviderCredential(SPLIT_PROVIDER_ID));
      }
    }
  };

  constructor(props: TourProps) {
    super(props);
    this.client = OpenFeature.getClient();
    this.state = {
      welcomeMessage: false,
      hexColor: `#${DEFAULT_HEX}`,
      json: {},
      showLoginModal: false,
      email: localStorage.getItem('email'),
      editorOn: false,
      editorAccess: false,
      availableProviders: [],
      currentProvider: '',
    };
    this.ajv = new Ajv({
      strict: false,
      useDefaults: true,
      allowUnionTypes: true,
      allowMatchingProperties: false,
    });
  }
  override render() {
    return (
      <ThemeProvider theme={this.buildTheme(this.state.hexColor)}>
        <div
          style={{
            display: 'flex',
            fontFamily: 'sans-serif',
          }}
        >
          <Background colors={generateTheme(this.state.hexColor)} />
          <Modal
            open={this.state.showLoginModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'white',
              }}
            >
              <Login
                onLogin={this.onLogin.bind(this)}
                onCancel={() => this.setState({ showLoginModal: false })}
                hexColor={this.state.hexColor}
              />
            </Box>
          </Modal>

          <div
            style={{
              width: this.state.editorOn ? '67vw' : '100vw',
              height: '100px',
              zIndex: 100,
            }}
          >
            {/* header */}
            <Header
              titleClassName="step-name"
              loginClassName="step-click-login"
              title={
                this.state.welcomeMessage
                  ? 'Fib3r: Math at the speed of the internet!'
                  : 'Welcome to FaaS: Fibonacci as a Service!'
              }
              hexColor={this.state.hexColor}
              loggedIn={!!this.state.email}
              onLogoutClick={this.onLogoutClick.bind(this)}
              onLoginClick={this.onLoginClick.bind(this)}
            ></Header>
          </div>

          {/* fixed container */}
          <div
            style={{
              position: 'absolute',
              width: this.state.editorOn ? '67vw' : '100vw',
              height: '100%',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            {/* calculator */}
            <Calculator
              result={this.state.result}
              onClick={this.onCalculate.bind(this)}
              hexColor={this.state.hexColor}
              error={this.state.calculateError}
            />
          </div>

          {/* editor */}
          <div className="json-editor">
            <JsonEditor
              errorMessage={
                this.state.jsonErrors ? `${this.state.jsonErrors?.[0].schemaPath} ${this.state.jsonErrors?.[0].message}` : undefined
              }
              hidden={!this.state.editorOn}
              callBack={this.onJsonUpdate.bind(this)}
              json={this.state.json}
            />
          </div>

          <Footer
            tourAvailable={this.shouldShowEditor(this.state.currentProvider)}
            availableProviders={this.state.availableProviders}
            currentProvider={this.state.currentProvider}
            onOpenTour={() => this.props.setIsOpen(true)}
            onSelectProvider={this.onSelectProvider.bind(this)}
          />
        </div>
      </ThemeProvider>
    );
  }

  // side-effect to save email in local storage if set.
  override async componentDidUpdate(): Promise<void> {
    if (this.state.email) {
      localStorage.setItem('email', this.state.email);
      if (!OpenFeature.getContext()?.targetingKey) {
        await OpenFeature.setContext({ targetingKey: this.state.email, email: this.state.email });
      }
    } else {
      localStorage.clear();
      if (OpenFeature.getContext()?.targetingKey) {
        await OpenFeature.setContext({});
      }
    }
  }

  override async componentDidMount() {
    const [editorAccess, availableProviders, schema] = await Promise.all([
      this.getData<boolean>('/utils/show-editor'),
      this.getData<AvailableProvider[]>('/providers'),
      this.getData<AnySchema>('/utils/schema'),
    ]);

    this.setState({
      editorAccess,
      availableProviders,
    });

    if (!this.validate) {
      this.validate = this.ajv.compile(schema);
    }

    await this.getConfig();

    this.client.addHandler(ProviderEvents.ConfigurationChanged, () => {
      this.evaluateUiFlags();
    });

    this.client.addHandler(ProviderEvents.Ready, () => {
      this.evaluateUiFlags();
    });

    this.props.setIsOpen(this.shouldShowEditor(this.state.currentProvider));
  }

  private async evaluateUiFlags() {
    const [ newMessage, hex ] = [
      // evaluate the "new-welcome-message" flag
      this.client.getBooleanValue('new-welcome-message', false),
      
      // evaluate the "hex-color" flag
      this.client.getStringValue('hex-color', DEFAULT_HEX, {
        hooks: [
          {
            after: (hookContext, evaluationDetails: EvaluationDetails<string>) => {
              // validate the hex value.
              const hexPattern = /[0-9A-Fa-f]{6}/g;
              if (!hexPattern.test(evaluationDetails.value)) {
                hookContext.logger.warn(
                  `Got invalid flag value '${evaluationDetails.value}' for ${hookContext.flagKey}, returning ${hookContext.defaultValue}`
                );
                /**
                 * Throwing an error in the after hook will be caught by the OpenFeature client
                 * and the default value passed in the `getStringValue` method will be returned.
                 */
                throw new Error(`Invalid hex value: ${evaluationDetails.value}`);
              }
            },
          },
        ]
      }),
    ];
    this.setState({ welcomeMessage: newMessage, hexColor: `#${hex}` });
  }

  private buildTheme(hex: string) {
    return createTheme({
      palette: {
        primary: {
          ...generateTheme(hex),
          contrastText: '#fff',
        },
        secondary: {
          light: '#000',
          main: '#000',
          dark: '#000',
          contrastText: '#000',
        },
      },
    });
  }

  private onCalculate(n: number, finished: () => void) {
    this.setState({ result: undefined, calculateError: false });
    this.getData<{ result: number }>(`/calculate?num=${n}`)
      .then((response: { result: number }) => {
        this.setState({ result: response.result });
        finished();
        if (this.props.isOpen && this.props.currentStep === STEP_UH_OH - 1) {
          this.props.setCurrentStep(STEP_UH_OH);
        } else if (this.props.isOpen && this.props.currentStep === STEP_DONE - 1) {
          this.props.setCurrentStep(STEP_DONE);
        }
      })
      .catch(() => {
        this.setState({ calculateError: true, result: 'error' });
        finished();
      });
  }

  private async onJsonUpdate(jsonOutput: JsonOutput) {
    if (this.state.editorAccess && this.validate) {
      const valid = this.validate(jsonOutput.jsObject);
      if (valid) {
        await this.syncData(jsonOutput.json);
        this.setState({ jsonErrors: undefined });
        if (this.props.isOpen) {
          if (
            // advance to next step after boolean flag change.
            this.props.currentStep === STEP_EDIT_HEX - 1 &&
            jsonOutput.jsObject['newWelcomeMessage'].state === 'enabled'
          ) {
            this.props.setCurrentStep(STEP_EDIT_HEX);
          } else if (
            // advance to next step after string flag change.
            this.props.currentStep === STEP_SNAZZY - 1 &&
            jsonOutput.jsObject['hexColor'].defaultVariant !== 'blue'
          ) {
            this.props.setCurrentStep(STEP_SNAZZY);
          }
        }
      } else {
        this.setState({ jsonErrors: this.validate.errors });
      }
    }
  }

  private onLoginClick() {
    this.setState({ showLoginModal: true });

    // proceed to the login step
    if (this.props.isOpen && this.props.currentStep === STEP_LOGIN - 1) {
      setTimeout(() => {
        // push this to the end of the event loop to make sure the model is up before we select it
        this.props.setCurrentStep(STEP_LOGIN);
      }, 0);
    }
  }

  private async onLogoutClick() {
    await OpenFeature.setContext({});
    this.setState({ email: undefined });
    this.evaluateUiFlags().catch((err) => console.warn(`Error ${err}`));
  }

  private async onSelectProvider(event: SelectChangeEvent<unknown>): Promise<void> {
    await fetch(`/providers/current/${event.target.value}`, {
      method: 'PUT',
    });
    await this.getConfig();
    this.evaluateUiFlags();
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

  private async onLogin(email: string | undefined) {
    if (email) {
      this.setState({ email, showLoginModal: false });
      await OpenFeature.setContext({ email, targetingKey: email });
      if (this.props.isOpen && this.props.currentStep === STEP_FAST_FIB - 1) {
        this.props.setCurrentStep(STEP_FAST_FIB);
      }
      this.evaluateUiFlags().catch((err) => console.warn(`Error ${err}`));
    }
  }

  // save the JSON and get all data.
  private async syncData(body: string) {
    await this.putJson(body);
    await this.getConfig();
  }

  private async getConfig() {
    try {
      const promises: [
        Promise<{ provider: string }>,
        Promise<unknown>
      ] = [
        this.getData<{ provider: string }>('/providers/current'),
        this.getData<unknown>('/utils/json'),
      ];

      const [provider, json] = await Promise.all(promises);

      await this.switchClientProvider(provider.provider);

      this.setState({
        currentProvider: provider.provider,
        json,
        // hide the editor unless we are using the flagd provider.
        editorOn: this.shouldShowEditor(provider.provider),
      });
      this.props.setIsOpen(this.props.isOpen && this.shouldShowEditor(provider.provider));
    } catch (err) {
      throw new Error('Unable to load page data... Did you forget to run the server?');
    }
  }

  // Show the editor when the configuration can be modified
  private shouldShowEditor(provider?: string) {
    return this.state.editorAccess && provider === FLAGD_PROVIDER;
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

  // thin wrapper around fetch that also passes email in auth header.
  private async getData<T>(path: string): Promise<T> {
    const response = await fetch(path, {
      headers: {
        ...(this.state.email && { Authorization: this.state.email }),
      },
    });
    if (response.ok) {
      return response.json();
    }
    throw Error(`HTTP status error: ${response.statusText}`);
  }

  private getProviderCredential(prividerId: ProviderId): string {
    const credential = this.state.availableProviders.find(p => p.id === prividerId)?.webCredential;
    if (credential) {
      return credential;
    }
    throw new Error(`Credential not available for ${prividerId}`);
  }
}

export default withTour(App as ComponentType<unknown>);
