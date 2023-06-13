import { Box, Modal } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Client, EvaluationDetails, OpenFeature, ProviderEvents } from '@openfeature/web-sdk';
import { withTour } from '@reactour/tour';
import { Component, ComponentType } from 'react';
import { HEADER_HEIGHT } from '../../constants';
import { Header } from '../../header';
import { JsonOutput } from '../../json-editor';
import { Login } from '../../login';
import { DASHBOARD_GREY, DemoPageProps, JSON_UPDATED } from '../../types';
import { generateTheme, getData } from '../../utils';
import { Background } from './background';
import { Calculator } from './calculator';

const STEP_EDIT_HEX = 7;
const STEP_SNAZZY = 9;
const STEP_UH_OH = 11;
const STEP_LOGIN = 13;
const STEP_FAST_FIB = 14;
const STEP_DONE = 15;

class Fib3rDemo extends Component<
  DemoPageProps,
  {
    welcomeMessage: boolean;
    hexColor: string;
    showLoginModal: boolean;
    email: string | null | undefined;
    result?: number | string;
    calculateError?: boolean;
  }
> {
  private client: Client;

  constructor(props: DemoPageProps) {
    super(props);
    this.client = OpenFeature.getClient();
    this.state = {
      welcomeMessage: false,
      hexColor: `#${DASHBOARD_GREY}`,
      showLoginModal: false,
      email: localStorage.getItem('email'),
    };
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
              width: this.props.editorOn ? '67vw' : '100vw',
              height: HEADER_HEIGHT,
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
              loggedInUser={this.state.email}
              onLogoutClick={this.onLogoutClick.bind(this)}
              onLoginClick={this.onLoginClick.bind(this)}
            ></Header>
          </div>

          {/* fixed container */}
          <div
            style={{
              position: 'absolute',
              width: this.props.editorOn ? '67vw' : '100vw',
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
        </div>
      </ThemeProvider>
    );
  }

  // side-effect to save email in local storage if set.
  override async componentDidUpdate(): Promise<void> {
    this.props.setIsOpen(this.props.tourOpen);
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
    this.client.addHandler(ProviderEvents.ConfigurationChanged, () => {
      this.evaluateUiFlags();
    });

    this.client.addHandler(ProviderEvents.Ready, () => {
      this.evaluateUiFlags();
    });

    this.props.jsonUpdated.on(JSON_UPDATED, (json: JsonOutput) => this.onJsonUpdate(json));
  }

  private async evaluateUiFlags() {
    const [newMessage, hex] = [
      // evaluate the "new-welcome-message" flag
      this.client.getBooleanValue('new-welcome-message', false),

      // evaluate the "hex-color" flag
      this.client.getStringValue('hex-color', DASHBOARD_GREY, {
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
        ],
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
    getData<{ result: number }>(`/calculate?num=${n}`, {
      ...(this.state.email && { Authorization: this.state.email }),
    })
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

  private async onJsonUpdate(jsonOutput: JsonOutput) {
    if (this.props.isOpen) {
      if (
        // advance to next step after boolean flag change.
        this.props.currentStep === STEP_EDIT_HEX - 1 &&
        jsonOutput.jsObject.flags['new-welcome-message'].defaultVariant === 'on'
      ) {
        this.props.setCurrentStep(STEP_EDIT_HEX);
      } else if (
        // advance to next step after string flag change.
        this.props.currentStep === STEP_SNAZZY - 1 &&
        jsonOutput.jsObject.flags['hex-color'].defaultVariant !== 'blue'
      ) {
        this.props.setCurrentStep(STEP_SNAZZY);
      }
    }
  }
}

export default withTour(Fib3rDemo as ComponentType<Partial<DemoPageProps>>);
