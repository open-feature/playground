import React, { ReactNode } from 'react';
import { boxShadow } from './style-mixins';

export class Button extends React.Component<{
  children: ReactNode;
  hexColor: string;
  width?: string;
  onClick: () => void;
  secondary?: boolean;
  disabled?: boolean
}> {
  override render() {
    return (
      <button
        title={this.props.disabled ? 'editor not available for this provider' : 'open or close the json editor'}
        disabled={this.props.disabled}
        onClick={this.props.onClick}
        style={{
          padding: '6px 32px',
          width: this.props.width,
          display: 'inline-block',
          borderRadius: '4px',
          border: '1px solid black',
          textDecoration: 'none',
          fontSize: '16px',
          margin: '4px 2px',
          backgroundColor: this.props.secondary ? '#FFF' : this.props.hexColor,
          color: this.props.disabled ? '#888' : this.props.secondary ? '#000' : '#FFF',
          textAlign: 'center',
          cursor: this.props.disabled ? 'not-allowed' : 'pointer',
          ...boxShadow,
        }}
      >
        {this.props.children}
      </button>
    );
  }
}
