import { webHarnessProvider } from './web-harness-provider';

describe('webHarnessProvider', () => {
  it('should work', () => {
    expect(webHarnessProvider()).toEqual('web-harness-provider');
  });
});
