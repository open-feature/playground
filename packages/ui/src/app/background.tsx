import React from 'react';
import './background.css';
import clsx from 'clsx';
import { Theme } from './types';

export class Background extends React.Component<{
  colors: Theme;
}> {
  override render() {
    return (
      // TODO move this height up
      <div style={{ height: 'calc(100vh - 64px)', background: this.props.colors.light }} className={clsx('area')}>
        <ul className={clsx('circles')}>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
    );
  }
}
