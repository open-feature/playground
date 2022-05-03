import React from 'react';
import { boxShadow } from './style-mixins';

export class Input extends React.Component<{
  type: string;
  onChange: (email: string) => void;
}> {
  override render() {
    return (
      <input
        type={this.props.type}
        placeholder="your.email@faas.com"
        onChange={(event) => {
          this.props.onChange(event.target.value);
        }}
        style={{
          padding: '6px 32px',
          display: 'inline-block',
          borderRadius: '4px',
          border: '1px solid black',
          textAlign: 'center',
          textDecoration: 'none',
          fontSize: '16px',
          margin: '4px 2px',
          ...boxShadow,
        }}
      ></input>
    );
  }
}
