import React from 'react';

export class Select extends React.Component<{
  options: string[];
  width?: string;
  name: string;
  id: string;
  selected?: string;
  onChange: (value: string) => void;
}> {
  override render() {
    return (
      <select onChange={(e) => this.props.onChange(e.target.value)} name={this.props.name} id={this.props.id}
        style={{padding: '6px 32px', 
        display: 'inline-block',
        borderRadius: '4px',
        border: '1px solid black',
        textDecoration: 'none',
        fontSize: '16px',
        margin: '4px 2px',}}
      >
        { this.props.options.map(p => {
          return <option selected={this.props.selected === p} key={p} value={p}>{p}</option>
        }) }
      </select>
    );
  }
}
