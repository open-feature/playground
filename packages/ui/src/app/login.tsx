import React from 'react';
import { Button } from './button';
import { Input } from './input';

export class Login extends React.Component<{
  hexColor: string;
  onLogin: (email?: string) => void;
  onCancel: () => void;
}> {
  private email?: string;

  override render() {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            transform: 'skew(15deg)',
          }}
        >
          <span style={{ padding: '24px', fontSize: '24px' }}>
            Login to your Account
          </span>
          <Input
            onChange={(email) => {
              this.email = email;
            }}
            type="text"
          />
          <Button
            onClick={() => {
              this.props.onLogin(this.email);
            }}
            width="273px"
            hexColor={this.props.hexColor}
          >
            Login
          </Button>
          <Button
            onClick={this.props.onCancel}
            secondary
            width="273px"
            hexColor={this.props.hexColor}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }
}
