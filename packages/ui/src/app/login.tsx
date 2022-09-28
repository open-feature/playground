import { Button, Input } from '@mui/material';
import React from 'react';

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
          }}
        >
          <span style={{ padding: '24px', fontSize: '24px' }}>Login to your Account</span>
          <Input
            style={{ textAlign: 'center' }}
            placeholder="user@faas.com"
            onChange={(event) => {
              this.email = event.target.value;
            }}
            type="text"
          />

          <div style={{ margin: 8 }}>
            <Button
              style={{ width: 128, marginRight: 8 }}
              variant="outlined"
              onClick={() => {
                this.props.onLogin(this.email);
                alert(this.email);
              }}
            >
              Login
            </Button>
            <Button style={{ width: 128 }} variant="outlined" onClick={() => this.props.onCancel()}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
