import React, { ReactNode } from 'react';
import { boxShadow } from './style-mixins';

export class Button extends React.Component<{
  children: ReactNode;
  hexColor: string;
  width?: string;
  onClick: () => void;
  secondary?: boolean;
}> {
  override render() {
    return (
      <button
        onClick={this.props.onClick}
        style={{
          padding: '6px 32px',
          width: this.props.width,
          display: 'inline-block',
          borderRadius: '4px',
          backgroundColor: this.props.secondary ? '#FFF' : this.props.hexColor,
          border: '1px solid black',
          color: this.props.secondary ? '#000' : '#FFF',
          textAlign: 'center',
          textDecoration: 'none',
          fontSize: '16px',
          margin: '4px 2px',
          cursor: 'pointer',
          ...boxShadow,
        }}
      >
        {this.props.children}
      </button>
    );
  }
}
