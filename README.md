# OpenFeature Playground: Demo and API and SDK Experimentation

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

The purpose of this repository is to demonstrate and experiment with existing and proposed functions of OpenFeature. These experiments were written in TypeScript and focus on NodeJS, but the basic concepts translate to most implementation languages.

## Introductory Demo

If you're new to OpenFeature, or feature-flags in general, we recommend you start by running the demo UI, along with the JSON-file provider. A guided tour will walk you through some basic concepts. To run the demo:

1. Run `npm ci`
2. Run the JSON-file provider: `npm run json-demo`
3. In a new terminal session run the UI: `npm run ui`
4. Open [localhost:4200](http://localhost:4200) in your browser!

You can also run the demo with any provider of your choice, by running that provider instead of the JSON-file provider (see [demo providers](#demo-providers)). You can also [generate scaffolding](#create-a-new-provider) to create your own custom provider.

A video recording of the demo flow is available:

[![OpenFeature demo recording](https://img.youtube.com/vi/x0tVZvxV7Pc/0.jpg)](https://www.youtube.com/watch?v=x0tVZvxV7Pc)

## Application Author API

These are the APIs and interfaces that Application Author (who doesn't particularly care about the underlying feature flag implementation) uses OpenFeature to control "pivot points" in their code.

```typescript
// initialize OpenFeature and create a client
openfeature.registerProvider(
  new MyFeatureFlagSystemProvider({ apiKey: 'my-secret-api-key' })
);
const client = openfeature.getClient();

// evaluate a boolean flag
const myFlagEnabled = await client.isEnabled('my-boolean-flag-key', false); // false is the default enabled state

// get a string flag value
const myStringFlagValue = await client.getStringValue(
  'my-string-flag-key',
  'hello world!' //default value
);

// get a numeric flag value
const myNumericFlagValue = await client.getNumberValue(
  'my-numeric-flag-key',
  1337 // 1337 is the default value
);

// get a object flag value
const myObject = await client.getObjectValue<MyObject>(
  'my-object-flag-key',
  new MyObject() // MyObject instance is the default value
);

// provide additional attributes to flag evaluation
const requestData = {
  ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
};
const myStringFlagValue = await client.getStringValue(
  'my-string-flag-key',
  'hello world!',
  requestData
);

// get the details of a flag evaluation
const { flagKey, value, variant, reason, errorCode, executedHooks } =
  await client.getStringDetails('my-string-flag-key', 'hello world!');

// attach additional handlers to the flag evaluation lifecycle (can also be attached globally and on client, to impact all evaluations)
const myStringFlagValue = await client.getStringValue(
  'my-string-flag-key',
  'hello world!',
  requestData,
  {
    hooks: [
      {
        name: 'log',
        // "before" can be used for logging, telemetry configuration, and manipulating attributes
        before: (hookContext) => {
          console.log('before');
        },
        // "after" can be used for logging, telemetry cleanup, and even validating and manipulating the returned value
        after: (
          hookContext,
          evaluationDetails: FlagEvaluationDetails<string>
        ) => {
          console.log('after');
        },
      },
    ],
  }
);
```

## Getting started with the SDK experimentation project

To run the demo scenarios described on this page, please make sure you have the
following prerequisites configured on your system.

- Git
- NodeJS 14 or later
- Docker

You can then clone the repo and install the dependencies.

1. clone the repo: `git clone https://github.com/open-feature/playground.git`
1. Install dependencies: `npm ci`

Available demos:

- [No-op](#no-op-demo)
- [Environment Variable Provider](#environment-variable-provider-demo)
- [JSON-file Provider Demo](#json-file-provider-demo)
- [Split Provider](#split-provider-demo)
- [CloudBees Feature Management Provider](#cloudbees-fm-provider-demo)
- [LaunchDarkly Provider Demo](#launchdarkly-provider-demo)
- [Flagsmith Provider Demo](#flagsmith-provider-demo)
- [GO Feature Flag Demo](#go-feature-flag-provider-demo)
- [OpenTelemetry and Zipkin](#opentelemetry-demo)


## Create a new provider

Providers are an important part of OpenFeature. They're responsible for
performing the flag evaluation and must adhere to the feature flag API. To get
started, run the following command:

`npm run provider-generator`

You'll need to provide a name for the generator. After that, the output will
contain the path to the new provider class and a start command.

## Simple API

A core design principle of OpenFeature is a simple, understandable API. OpenFeature's API needs to be flexible enough to handle all the common use cases
of feature flags while being easy to work with. In order to support this, a
common API needs to be defined that's capable of supporting core feature
flagging use cases. The method names and signatures still need to be agreed upon
by the community, but a basic implementation can be found [here](./packages/openfeature-js/src/lib/types.ts).

### Global Singleton

Inspired by OpenTelemetry, this experimental SDK registers itself globally.
Typically doing this is discouraged but, in this case, it provides interesting
flexibility. It allows library maintainers to include OpenFeature in their
project, even if they're running a different, but compatible version of
OpenFeature. An example of how this could be used can be found in the [Fibonacci
library](./packages/fibonacci/src/lib/fibonacci.ts).

### Provider Registration

OpenFeature allows developers to register a provider. Providers are responsible for
using the flag identity and context to determine the state of the feature. If no
providers are registered, the flags will no-op and return the default value.

### Demo Providers

#### No-op Demo

To see this in action, we'll run the API app found
[here](./packages/api/src/main.ts). Notice that we're using OpenFeature but not
registering a provider. Let's run the app and see what happens.

1. Run `npm run no-op-demo`
2. Open http://localhost:3000/message, http://localhost:3000/hex-color/markup, or http://localhost:3000/calculate?num=40 in your browser
3. Optionally, run the UI as described in the [introductory demo](#introductory-demo)

That's it! You should see **Welcome to the api!**. Unfortunately, that's all you
can do without registering a provider. Thankfully, as we'll see in the next
section, that part is easy.

#### Compatibility

Another key design principle of OpenFeature is compatibility with existing open source
and commercial feature flag offerings. It should be possible to register a
feature flag provider that's responsible for handling the flag evaluation. Only
a single provider can be registered at a time and not providing one will cause
flag evaluations to return the default value. This can be tested by running the
application without registering a provider.

> NOTE: You may notice that the demos below don't register providers
> directly in the [app](./packages/api/src/main.ts). This is done before the
> main app starts using the `-r` node cli argument. The config can be found [here](./packages/api/project.json).

#### Environment Variable Provider Demo

The environment variable provider is a simple demo showing how environment
variables could be used make flag evaluations. Its purpose is to show how a
provider **could** be implemented.

Follow these steps to run the demo:

1. copy `.env.example` to `.env`
2. Run `npm run env-var-demo`
3. Open http://localhost:3000/message, http://localhost:3000/hex-color/markup, or http://localhost:3000/calculate?num=40 in your browser
4. Optionally, run the UI as described in the [introductory demo](#introductory-demo)

You should see **Welcome to the api!** just as before. Now, change the value of
`new-welcome-message` to true and restart the app. It should show **Welcome
to the next gen api!** in your browser. Now we're getting somewhere, but
it's still a bit too basic to be useful. The next demo will show how we could
register a commercial feature flag tool using an existing SDK.

#### JSON-file Provider Demo

The JSON provider is a simple demo showing how environment
variables could be used make flag evaluations. Its purpose is to demonstrate a slightly more complex local provider, with some ability to do basic dynamic flag evaluation.

Follow these steps to run the demo:

1. Run `npm run json-demo`
2. Open http://localhost:3000/message, http://localhost:3000/hex-color/markup, or http://localhost:3000/calculate?num=40 in your browser
3. Optionally, run the UI as described in the [introductory demo](#introductory-demo)

You should see **Welcome to the api!** just as before. Now, change the value of
`new-welcome-message` to true and restart the app. It should show **Welcome
to the next gen api!** in your browser. Now we're getting somewhere, but
it's still a bit too basic to be useful. The next demo will show how we could
register a commercial feature flag tool using an existing SDK.

#### Split Provider Demo

The Split provider shows how an existing SDK, in this case Split's NodeJS SDK, can
be used in OpenFeature. This is a simple example that doesn't cover every use
case that Split offers, but the goal would be to support as many features as
possible.

Follow these steps to run the demo:

1. Copy `.env.example` to `.env`
2. Add a Split.io [service-side API
   key](https://help.split.io/hc/en-us/articles/360019916211-API-keys) to the
   `SPLIT_KEY` in the `.env` file.
3. Create a new split called `new-welcome-message` with the default treatments
4. Create a new split called `fib-algo` with the treatment values: `recursive`,
   `memo`, `loop`, `binet`, and `default`.
5. Create a new split called `hex-color` with the treatment values: `CC0000`,
   `00CC00`, `0000CC`, `chartreuse`.
6. Run `npm run split-demo`
7. Open http://localhost:3000/message, http://localhost:3000/hex-color/markup, or http://localhost:3000/calculate?num=40 in your browser
8. Optionally, run the UI as described in the [introductory demo](#introductory-demo)

#### CloudBees FM Provider Demo

A CloudCees Feature Management provider demo.

Follow these steps to run the demo:

1. Copy `.env.example` to `.env`
2. Add a CloudBees app key to the `.env` file.
3. Create a new boolean flag called `new-welcome-message`.
4. Create a new flag called `fib-algo` with the values: `recursive`,
   `memo`, `loop`, `binet`, and `default`.
5. Create a new flag called `hex-color` with the values: `CC0000`,
   `00CC00`, `0000CC`, `chartreuse`.
6. Run `npm run cloudbees-demo`
7. Open http://localhost:3000/message, http://localhost:3000/hex-color/markup, or http://localhost:3000/calculate?num=40 in your browser
8. Optionally, run the UI as described in the [introductory demo](#introductory-demo)

#### LaunchDarkly Provider Demo

A LaunchDarkly provider demo.

Follow these steps to run the demo:

1. Copy `.env.example` to `.env`
2. Add a LaunchDarkly SDK key to the `.env` file.
3. Create a new boolean flag called `new-welcome-message`.
4. Create a new feature flag called `fib-algo` with the values: `recursive`,
   `memo`, `loop`, `binet`, and `default`.
5. Create a new feature flag called `hex-color` with the values: `CC0000`,
   `00CC00`, `0000CC`, `chartreuse`.
6. Run `npm run launchdarkly-demo`
7. Open http://localhost:3000/message, http://localhost:3000/hex-color/markup, or http://localhost:3000/calculate?num=40 in your browser
8. Optionally, run the UI as described in the [introductory demo](#introductory-demo)

#### Flagsmith Provider Demo

A Flagsmith provider demo (supports v1 and v2).

Follow these steps to run the demo:

1. Copy `.env.example` to `.env`
2. Add a Flagsmith Environment ID (v1) or a Environment key (v2) to the `.env` file.
3. Create a new boolean feature called `new-welcome-message`.
4. Create a new feature called `fib-algo` with the values: `recursive`,
   `memo`, `loop`, `binet`, and `default`.
5. Create a new feature called `hex-color` with the values: `CC0000`,
   `00CC00`, `0000CC`, `chartreuse`.
6. Run `npm run flagsmith-v1-demo` or `npm run flagsmith-v2-demo`
7. Open http://localhost:3000/message, http://localhost:3000/hex-color/markup, or http://localhost:3000/calculate?num=40 in your browser
8. Optionally, run the UI as described in the [introductory demo](#introductory-demo)

# Go-feature-flag Provider Demo

A [go-feature-flag](https://gofeatureflag.org) provider demo.

1. You should start by running an instance of `go-feature-flag-relay-proxy`.

```shell
  # download relay proxy configuration file
  curl https://gist.githubusercontent.com/thomaspoignant/777c23351a07dc88d01bf162d2496115/raw/94eb003c7e98f00398dd62a9aea67b1f5f21fd42/goff-proxy.yaml -o goff-proxy.yaml

  # download an example of flag configuration file
  curl https://gist.githubusercontent.com/thomaspoignant/fefe16973c1272ff0682212564874c90/raw/d96c13f57132816f3989a3dd5caf5b582fe6565b/flags.yaml -o flags.yaml

  # launch go-feature-flag relay proxy (here using the docker image)
  docker run -p 1031:1031 -v $(pwd)/:/goff/ thomaspoignant/go-feature-flag-relay-proxy:latest
```

2. Run `npm run go-feature-flag-demo` provider demo
3. Open http://localhost:3333/message, http://localhost:3333/hex-color/markup, or http://localhost:3333/calculate?num=40 in your browser
4. Optionally, run the UI as described in the [introductory demo](#introductory-demo)

## OpenTelemetry Support

Now, wouldn't it be nice if you could visually see the impact an algorithm had
on a request? That's where OpenTelemetry support comes in.

Supporting OpenTelemetry natively in OpenFeature provides a number of
advantages. The most obvious benefit is distributed traces would contain
feature flag information. This would make it easy to determine
the impact a feature or features had on a single request. Other features, such as
baggage and request scoped context, may be useful options in the future.

OpenTelemetry is not required to use OpenFeature. Similar to OpenFeature, if a
provider is not registered, the library no-ops. That means you are able to take
advantage of all the great features of OpenTelemetry if you already use it, with minimal
overhead if you don't.

### OpenTelemetry Integration

1. Start Zipkin in Docker: `docker run --rm -d -p 9411:9411 --name zipkin openzipkin/zipkin`
2. Open http://localhost:9411/ in your browser
3. Start one of the demos above or run `npm run no-op-demo`
4. Open Zipkin and search for a trace

![Zipkin](./assets//images/zipkin-fibonacci.png)

Experiment with different Fibonacci algorithms and hitting the API with these
values:

- http://localhost:3000/calculate?num=10
- http://localhost:3000/calculate?num=20
- http://localhost:3000/calculate?num=30
- http://localhost:3000/calculate?num=40
- http://localhost:3000/calculate?num=50
