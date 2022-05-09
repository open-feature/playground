import React from 'react';
import { boxShadow } from './style-mixins';

const pointer = {
  cursor: 'pointer',
};

export class Header extends React.Component<{
  title: string;
  hexColor: string;
  loggedIn: boolean;
  titleClassName: string;
  loginClassName: string;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}> {
  override render() {
    return (
      <div
        style={{
          backgroundColor: this.props.hexColor,
          width: '100%',
          zIndex: '100',
          color: 'white',
          ...boxShadow,
        }}
      >
        <span
          style={{
            paddingLeft: '5vw',
            paddingRight: '5vw',
            display: 'flex',
            height: '10vh',
            justifyContent: 'center',
            alignItems: 'center',
            WebkitJustifyContent: 'space-between',
            flexDirection: 'row',
          }}
        >
          <span className={this.props.titleClassName}>{this.props.title}</span>
          <span style={{ display: 'flex', gap: '10px' }}>
            <span
              className={this.props.loginClassName}
              style={pointer}
              onClick={
                this.props.loggedIn
                  ? this.props.onLogoutClick
                  : this.props.onLoginClick
              }
            >
              {this.props.loggedIn ? 'Logout' : 'Login'}
            </span>
          </span>
        </span>
      </div>
    );
  }
}
