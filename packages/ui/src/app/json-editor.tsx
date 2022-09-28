import React from 'react';
import JSONInput from 'react-json-editor-ajrm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const locale = require('react-json-editor-ajrm/locale/en');

export type JsonOutput = {
  jsObject: {
    [key: string]: {
      state: 'enabled' | 'disabled';
      defaultVariant: string;
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
        style={{
          width: this.props.hidden ? '0' : '33vw',
          overflow: 'hidden',
          // TODO: centralize this height
          height: 'calc(100vh - 64px)',
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
