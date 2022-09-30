import { Button, FormControl, InputLabel, TextField } from '@mui/material';
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
      className='step-login'
        style={{
          fontFamily: 'sans-serif',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
          margin: 16,
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
          <span style={{ padding: 8, fontSize: '24px' }}>Login to your Account</span>
          <span color="#888" style={{ paddingBottom: 8, fontSize: '16px' }}>
            Enter any email to login
          </span>
          <FormControl style={{ width: 160, color: 'white', borderColor: 'white' }}>
            <InputLabel style={{ color: 'white', borderColor: 'white' }} id="email-input-label"></InputLabel>
            <TextField
              label="Email"
              style={{ textAlign: 'center' }}
              placeholder="user@faas.com"
              onChange={(event) => {
                this.email = event.target.value;
              }}
              type="text"
            />
          </FormControl>

          <div style={{ margin: 8 }}>
            <Button
              color="secondary"
              style={{ width: 128, marginRight: 8 }}
              variant="outlined"
              onClick={() => this.props.onCancel()}
            >
              Cancel
            </Button>
            <Button
              style={{ width: 128 }}
              variant="outlined"
              onClick={() => {
                this.props.onLogin(this.email);
              }}
            >
              Login
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
