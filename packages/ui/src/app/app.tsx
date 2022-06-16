import { TourProps, withTour } from '@reactour/tour';
import { Component, ComponentType } from 'react';
import Modal from 'react-modal';
import { Button } from './button';
import { Calculator } from './calculator';
import { Header } from './header';
import { JsonEditor, JsonOutput } from './json-editor';
import { Login } from './login';
import { boxShadow } from './style-mixins';
import Ajv2020, {
  AnySchema,
  ErrorObject,
  ValidateFunction,
} from 'ajv/dist/2020';

const BASE_URL = 'http://localhost:30000';
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
    result: number | undefined;
    errors:
      | ErrorObject<string, Record<string, unknown>, unknown>[]
      | null
      | undefined;
  }
> {
  private validate: ValidateFunction | undefined;
  private ajv: Ajv2020;

  constructor(props: TourProps) {
    super(props);
    this.state = {
      message: '',
      hexColor: '#888',
      json: {},
      showLoginModal: false,
      email: localStorage.getItem('email'),
      editorOn: true,
      result: undefined,
      errors: undefined,
    };
    this.refreshPage();
    this.ajv = new Ajv2020({
      useDefaults: true,
      allowUnionTypes: true,
      allowMatchingProperties: false,
    });
    setInterval(() => {
      this.refreshPage();
    }, REFRESH_INTERVAL);
  }
  override render() {
    return (
      <div
        style={{
          display: 'flex',
          fontFamily: 'sans-serif',
          height: '100vh',
        }}
      >
        {/* modal */}
        <Modal
          className={'step-login'}
          style={{
            overlay: {
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              width: this.state.editorOn ? '67vw' : '100vw',
            },
            content: {
              width: '60%',
              height: '40%',
              position: 'unset',
              fontFamily: 'sans-serif',
              border: `4px solid ${this.state.hexColor}`,
              borderRadius: '4px',
              transform: 'skew(-15deg)',
              overflow: 'hidden',
              backgroundColor: 'white',
              ...boxShadow,
            },
          }}
          isOpen={this.state.showLoginModal}
        >
          <Login
            onLogin={this.onLogin.bind(this)}
            onCancel={() => this.setState({ showLoginModal: false })}
            hexColor={this.state.hexColor}
          />
        </Modal>

        <div
          className="step-hex-color"
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

          {/* background */}
          <div
            style={{
              background:
                'url(../assets/background.jpg) no-repeat center center ',
              backgroundSize: 'cover',
              opacity: '0.5',
              width: '100%',
              height: '90vh',
            }}
          >
            {/* image attribution */}
            <div
              style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                fontSize: '8px',
                color: '#888',
              }}
            >
              <a
                style={{
                  color: '#555',
                  zIndex: 1000000,
                }}
                href="https://www.freepik.com/vectors/digital-devices"
              >
                Digital devices vector created by rawpixel.com - www.freepik.com
              </a>
            </div>
          </div>
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
          <div
            className="fib"
            style={{
              direction: 'rtl',
              marginRight: '10%',
              zIndex: '100',
            }}
          >
            <Calculator
              result={this.state.result}
              onClick={this.onCalculate.bind(this)}
              hexColor={this.state.hexColor}
            />
          </div>
        </div>

        <div
          className="step-buttons"
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '30px',
            zIndex: 2000,
          }}
        >
          <Button
            onClick={() => {
              this.setState({ editorOn: !this.state.editorOn });
            }}
            hexColor="#000"
            secondary
          >
            Toggle Editor
          </Button>

          <Button
            onClick={() => {
              this.props.setIsOpen(true);
            }}
            hexColor="#000"
            secondary
          >
            Open Tour
          </Button>
        </div>

        {/* editor */}
        <div className="json-editor">
          <JsonEditor
            errorMessage={
              this.state.errors
                ? `${this.state.errors?.[0].schemaPath} ${this.state.errors?.[0].message}`
                : undefined
            }
            hidden={!this.state.editorOn}
            callBack={this.onJsonUpdate.bind(this)}
            json={this.state.json}
          />
        </div>
      </div>
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

  // auto-open the tour.
  override componentDidMount() {
    this.props.setIsOpen(true);

    this.getData<AnySchema>('/utils/schema')
      .then((res) => {
        if (!this.validate) {
          this.validate = this.ajv.compile(res);
        }
      })
      .catch((err) => {
        console.error(`Error getting flag schema, ${err.message}`);
      });
  }

  private onCalculate(n: number, finished: () => void) {
    this.setState({ result: undefined });
    this.getData<{ result: number }>(`/calculate?num=${n}`).then(
      (response: { result: number }) => {
        this.setState({ result: response.result });
        finished();
        if (this.props.isOpen && this.props.currentStep === STEP_UH_OH - 1) {
          this.props.setCurrentStep(STEP_UH_OH);
        } else if (
          this.props.isOpen &&
          this.props.currentStep === STEP_DONE - 1
        ) {
          this.props.setCurrentStep(STEP_DONE);
        }
      }
    );
  }

  private async onJsonUpdate(jsonOutput: JsonOutput) {
    if (this.validate) {
      const valid = this.validate(jsonOutput.jsObject);
      if (valid) {
        await this.syncData(jsonOutput.json);
        this.setState({ errors: undefined });
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
        this.setState({ errors: this.validate.errors });
      }
    }
  }

  private onLoginClick() {
    if (this.props.isOpen && this.props.currentStep === STEP_LOGIN - 1) {
      this.props.setCurrentStep(STEP_LOGIN);
    }
    this.setState({ showLoginModal: true });
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
        Promise<unknown>,
        Promise<{ provider: string }>
      ] = [
        this.getData<{ message: string }>('/message'),
        this.getData<{ color: string }>('/hex-color'),
        this.getData<unknown>('/utils/json'),
        this.getData<{ provider: string }>('/utils/provider'),
      ];
      const [message, hexColor, json, provider]: [
        { message: string },
        { color: string },
        unknown,
        { provider: string }
      ] = await Promise.all(promises);
      this.setState({
        message: message.message,
        hexColor: hexColor.color,
        json,
        // hide the editor unless we are using the JSON provider.
        editorOn: provider.provider === 'json',
      });
    } catch (err) {
      throw new Error(
        'Unable to load page data... Did you forget to run the server?'
      );
    }
  }

  // thin wrapper around fetch for PUTing JSON.
  private async putJson(body: string) {
    await fetch(`${BASE_URL}/utils/json`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    });
  }

  // thin wrapper around fetch that also passes email in auth header.
  private async getData<T>(path: string): Promise<T> {
    return await (
      await fetch(`${BASE_URL}${path}`, {
        headers: {
          ...(this.state.email && { Authorization: this.state.email }),
        },
      })
    ).json();
  }
}

export default withTour(App as ComponentType<unknown>);
