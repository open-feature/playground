import { Card } from '@mui/material';
import React from 'react';

export class Calculator extends React.Component<
  {
    hexColor: string;
    onClick: (n: number, finished: () => void) => void;
    result: number | string | undefined;
    error?: boolean;
  },
  { millis: string | number; running: boolean; n: number }
> {
  private interval?: NodeJS.Timer = undefined;
  private start = 0;

  constructor(props: {
    hexColor: string;
    onClick: (n: number, finished: () => void) => void;
    result: number | undefined;
  }) {
    super(props);
    this.state = {
      millis: '--',
      running: false,
      n: 40,
    };
  }
  override render() {
    return (
      <Card
        className="step-calculator"
        style={{
          userSelect: 'none',
          fontFamily: 'monospace',
          width: 'fit-content',
          height: '120px',
          border: `4px solid ${this.props.hexColor}`,
          fontSize: '60px',
          display: 'flex',
          pointerEvents: this.state.running ? 'none' : 'initial',
          direction: 'rtl',
          zIndex: '100',
        }}
      >
        <div
          onClick={this.calculate.bind(this)}
          style={{
            minWidth: '160px',
            direction: 'ltr',
            textAlign: 'end',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              paddingRight: '2px',
              display: 'flex',
              flexDirection: 'row',
              height: '120px',
              lineHeight: '120px',
              textAlign: 'center',
              alignItems: 'center',
              justifyContent: 'end',
            }}
          >
            {this.props.error ? (
              <div style={{ height: 95, width: 140 }}>
                <div>&#9888;</div>
              </div>
            ) : (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    lineHeight: 'normal',
                    height: '60px',
                  }}
                >
                  {this.state.millis}
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    height: '60px',
                    alignSelf: 'end',
                    lineHeight: '18px',
                  }}
                >
                  ms
                </span>
              </>
            )}
          </div>
        </div>
        <div
          onClick={this.calculate.bind(this)}
          style={{
            width: '140px',
            height: '100%',
            backgroundColor: this.props.hexColor,
            borderLeft: `4px solid ${this.props.hexColor}`,
            fontSize: '18px',
            color: 'white',
            direction: 'ltr',
            cursor: 'pointer',
          }}
        >
          <div>fib({this.state.n})</div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'space-evenly',
              fontSize: '60px',
            }}
          >
            <div style={{ height: 72 }}>
              <span style={{ lineHeight: '72px', verticalAlign: 'sub' }}>&#8721;</span>
            </div>
          </div>
          <div style={{ lineHeight: '33px' }}>{`=${this.props.result ? this.props.result : ''}`}</div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            fontSize: '60px',
            cursor: 'pointer',
          }}
        >
          <span onClick={this.increment.bind(this)} style={{ height: '60px' }}>
            &#9650;
          </span>
          <span onClick={this.decrement.bind(this)} style={{ height: '60px' }}>
            &#9660;
          </span>
        </div>
      </Card>
    );
  }

  private calculate() {
    this.startTimer();
    this.props.onClick(this.state.n, () => {
      this.stopTimer();
    });
  }

  private increment() {
    this.setState({ n: this.state.n + 1 });
  }

  private decrement() {
    this.setState({ n: this.state.n - 1 });
  }

  private stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.setState({
      running: false,
    });
  }

  private startTimer() {
    this.stopTimer();

    this.start = new Date().getTime();
    this.setState({
      millis: 0,
    });
    this.interval = setInterval(() => {
      this.setState({
        millis: new Date().getTime() - this.start,
        running: true,
      });
    }, 1);
  }
}
