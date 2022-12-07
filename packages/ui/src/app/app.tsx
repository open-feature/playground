import { Box, Modal, SelectChangeEvent } from '@mui/material';
import { TourProps, withTour } from '@reactour/tour';
import Ajv, { AnySchema, ErrorObject, ValidateFunction } from 'ajv';
import { Component, ComponentType } from 'react';
import { Calculator } from './calculator';
import { Footer } from './footer';
import { Header } from './header';
import { JsonEditor, JsonOutput } from './json-editor';
import { Login } from './login';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Background } from './background';
import { Theme } from './types';
import { FLAGD_PROVIDER } from './constants';

const STEP_EDIT_HEX = 7;
const STEP_SNAZZY = 9;
const STEP_UH_OH = 11;
const STEP_LOGIN = 13;
const STEP_FAST_FIB = 14;
const STEP_DONE = 15;
const REFRESH_INTERVAL = 5000;

class App extends Component<
  TourProps,
  {
    message: string;
    hexColor: string;
    json: unknown;
    showLoginModal: boolean;
    email: string | null | undefined;
    editorOn: boolean;
    editorAccess: boolean;
    result?: number | string;
    availableProviders: string[];
    currentProvider?: string;
    calculateError?: boolean;
    jsonErrors?: ErrorObject<string, Record<string, unknown>, unknown>[] | null | undefined;
  }
> {
  private validate: ValidateFunction | undefined;
  private ajv: Ajv;

  constructor(props: TourProps) {
    super(props);
    this.state = {
      message: '',
      hexColor: '#888888',
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
          <Background colors={this.generate(this.state.hexColor)} />
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
              title={this.state.message}
              hexColor={this.state.hexColor}
              loggedIn={!!this.state.email}
              onLogoutClick={() => this.setState({ email: undefined })}
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
  override componentDidUpdate(): void {
    if (this.state.email) {
      localStorage.setItem('email', this.state.email);
    } else {
      localStorage.removeItem('email');
    }
  }

  override async componentDidMount() {
    const [editorAccess, availableProviders, schema] = await Promise.all([
      this.getData<boolean>('/utils/show-editor'),
      this.getData<string[]>('/providers'),
      this.getData<AnySchema>('/utils/schema'),
    ]);

    this.setState({
      editorAccess,
      availableProviders,
    });

    if (!this.validate) {
      this.validate = this.ajv.compile(schema);
    }

    await this.refreshPage();

    setInterval(() => {
      this.refreshPage();
    }, REFRESH_INTERVAL);

    this.props.setIsOpen(this.shouldShowEditor(this.state.currentProvider));
  }

  private generate(cssColor: string): Theme {
    // TODO: simplify this
    const hex = cssColor.slice(1, 7);
    const r = hex.slice(0, 2);
    const g = hex.slice(2, 4);
    const b = hex.slice(4, 6);

    const shiftedR = this.shift(r);
    const shiftedG = this.shift(g);
    const shiftedB = this.shift(b);

    return {
      light: '#' + `${shiftedR.light}${shiftedG.light}${shiftedB.light}`.padStart(6, '0'),
      main: cssColor,
      dark: '#' + `${shiftedR.dark}${shiftedG.dark}${shiftedB.dark}`.padStart(6, '0'),
    };
  }

  private shift(hex: string): Theme {
    const UPPER = 255;
    const main = Number.parseInt(hex, 16);
    const light = Math.floor((UPPER - main) / 2 + main).toString(16);
    const dark = Math.floor((main + 1) / 2).toString(16);
    return {
      light,
      main: hex,
      dark,
    };
  }

  private buildTheme(hex: string) {
    return createTheme({
      palette: {
        primary: {
          ...this.generate(hex),
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

  private async onSelectProvider(event: SelectChangeEvent<unknown>): Promise<void> {
    await fetch(`/providers/current/${event.target.value}`, {
      method: 'PUT',
    });
    this.refreshPage();
  }

  private onLogin(email: string | undefined) {
    if (email) {
      this.setState({ email, showLoginModal: false });
      if (this.props.isOpen && this.props.currentStep === STEP_FAST_FIB - 1) {
        this.props.setCurrentStep(STEP_FAST_FIB);
      }
    }
  }

  // save the JSON and get all data.
  private async syncData(body: string) {
    await this.putJson(body);
    await this.refreshPage();
  }

  // get all data (message, hex-color, and json).
  private async refreshPage() {
    try {
      const promises: [
        Promise<{ message: string }>,
        Promise<{ color: string }>,
        Promise<{ provider: string }>,
        Promise<unknown>
      ] = [
        this.getData<{ message: string }>('/message'),
        this.getData<{ color: string }>('/hex-color'),
        this.getData<{ provider: string }>('/providers/current'),
        this.getData<unknown>('/utils/json'),
      ];

      const [message, hexColor, provider, json] = await Promise.all(promises);

      this.setState({
        message: message.message,
        hexColor: hexColor.color,
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
}

export default withTour(App as ComponentType<unknown>);
