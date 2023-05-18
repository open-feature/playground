import React from 'react';
import './background.css';
import clsx from 'clsx';
import { Theme } from '../../types';
import { HEIGHT_MINUS_HEADER } from '../../constants';

export class Background extends React.Component<{
  colors: Theme;
}> {
  override render() {
    return (
      <div style={{ height: HEIGHT_MINUS_HEADER, background: this.props.colors.light }} className={clsx('area')}>
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
