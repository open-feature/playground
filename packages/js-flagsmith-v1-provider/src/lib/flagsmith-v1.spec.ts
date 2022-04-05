import { FlagsmithV1Provider } from './flagsmith-v1';

describe('FlagsmithV1Provider', () => {
  it('should have the name property set', () => {
    const provider = new FlagsmithV1Provider();
    expect(provider.name).toEqual('flagsmith-v1');
  });
});
