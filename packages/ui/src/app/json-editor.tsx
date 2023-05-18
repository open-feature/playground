import React from 'react';
import JSONInput from 'react-json-editor-ajrm';
import { HEIGHT_MINUS_HEADER } from './constants';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const locale = require('react-json-editor-ajrm/locale/en');

export type JsonOutput = {
  jsObject: {
    flags: {
      [key: string]: {
        state: 'enabled' | 'disabled';
        defaultVariant: string;
      };
    };
  };
  json: string;
};

export class JsonEditor extends React.Component<{
  callBack: (value: JsonOutput) => void;
  json: unknown;
  hidden: boolean;
  errorMessage?: string;
}> {
  override render() {
    return (
      <div
        className="json-editor"
        style={{
          width: this.props.hidden ? '0' : '33vw',
          overflow: 'hidden',
          height: HEIGHT_MINUS_HEADER,
          position: 'absolute',
          right: 0,
        }}
      >
        <JSONInput
          error={this.props.errorMessage ? { reason: this.props.errorMessage, line: 0 } : undefined}
          onBlur={this.props.callBack}
          placeholder={this.props.json}
          locale={locale.default}
          height="100%"
          width="33vw"
          style={{
            body: {
              height: '100%',
              fontSize: '16px',
            },
          }}
        />
      </div>
    );
  }
}
