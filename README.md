<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./images/openfeature-horizontal-white.svg">
  <source media="(prefers-color-scheme: light)" srcset="./images/openfeature-horizontal-black.svg">
  <img alt="OpenFeature Logo" src="./images/openfeature-horizontal-black.svg">
</picture>

## Welcome to the OpenFeature playground

The OpenFeature playground is a great place to familiarize with the core concepts and features available in OpenFeature.
If you're brand new to feature flagging, considering reviewing the [OpenFeature documentation](https://docs.openfeature.dev/docs/reference/intro) before running the demo.

<!-- toc -->

- [Pre-requisites](#pre-requisites)
- [How to run the demo](#how-to-run-the-demo)
- [Links](#links)
- [What's in the demo?](#whats-in-the-demo)
  - [Rebranding](#rebranding)
  - [Experimenting with color](#experimenting-with-color)
  - [Test in production](#test-in-production)
- [Available providers](#available-providers)
  - [Environment Variable Provider](#environment-variable-provider)
  - [FlagD Provider](#flagd-provider)
  - [Go-feature-flag Provider](#go-feature-flag-provider)
  - [Split Provider Demo](#split-provider-demo)
  - [CloudBees FM Provider Demo](#cloudbees-fm-provider-demo)
  - [LaunchDarkly Provider Demo](#launchdarkly-provider-demo)
  - [Flagsmith Provider Demo](#flagsmith-provider-demo)
- [Experimenting beyond the demo](#experimenting-beyond-the-demo)
  - [Evaluation context](#evaluation-context)
- [Troubleshooting](#troubleshooting)
  - [Ports are not available](#ports-are-not-available)
  - [Vendor isn't listed in the dropdown](#vendor-isnt-listed-in-the-dropdown)

<!-- tocstop -->

## Pre-requisites

In order to run the demo, you'll need the following tools available on your system.

- [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Docker Engine](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## How to run the demo

1. Clone the repo

```sh
git clone https://github.com/open-feature/playground.git
```

2. Navigate to the playground folder

```sh
cd playground
```

3. Copy `.env.example` to `.env`

```sh
cp .env.example .env
```

4. Optionally, add feature flag vendors to the `.env`. See below for more information.
5. Start the demo

```sh
docker compose up
```

6. Open your favorite browser and navigate to http://localhost:30000/

## Links

- [Demo Application](http://localhost:30000/)
- [Jaeger](http://localhost:16686/)

## What's in the demo?

The demo consists of three different scenarios where feature flags are used. They help the fictional company Fib3r safely test and release new features.

### Rebranding

As we all know, naming is hard! In this scenario, the team at Fib3r is in the process of rebranding from `FaaS` to `Fib3r`. This may seem like a situation where a feature flag is unnecessary. However, may times a rebranding needs to correspond with a press release or blog post. Of course, you could time a deployment moments before the announcement but that's potentially risky and may require coordination across multiple teams. Using a feature flag would allow you to deploy when it's convent, tests in production by enabled the feature for a subset of users, and then enable the feature instantly for everyone.

For the rebranding effort, we're only interested in being able to toggle the new welcome message on and off. A boolean value is exactly what we need! That can be accomplished in OpenFeature like [this](https://github.com/open-feature/playground/blob/fa84c6262bb4493216c7cfe7d3d3542c5d753bad/packages/app/src/app/message/message.service.ts#L12-L21).

### Experimenting with color

The team at Fib3r has a hypothesis. They feel that the reason Fib3r hasn't achieved unicorn status is because the current color of the landing page is responsible for high bounce rates. This is a great opportunity to use feature flags for experimentation. With feature flags, it's possible to measure the impact a change has on the metrics that are important to your business.

[Diving into the code](https://github.com/open-feature/playground/blob/fa84c6262bb4493216c7cfe7d3d3542c5d753bad/packages/app/src/app/hex-color/hex-color.service.ts#L10-L40), you may notice that an `after` hook has been defined. [Hooks](https://docs.openfeature.dev/docs/reference/concepts/hooks) are a powerful feature that can be used to extend OpenFeature capabilities. In this case, the code is expecting a valid hex color. However, the person configuring the feature flag in a remote feature flag management tool may not be aware of this requirement. That's where a validation hook could be used to ensure only valid CSS values are returned. In this hook, the evaluation value is tested against a regular expression. If it doesn't match, a warning messaged is logged and the hook throws an error. OpenFeature will catch the error and return the default value.

### Test in production

Fib3r is on a mission to help the world calculate the nth digit a Fibonacci more efficiently. According to a Stack Overflow article the team recently found, it's possible to use the Binet's Formula to calculate Fibonacci more efficiently. While the initial tests look promising, changing the underlying algorithm Fib3r has used for years is risky. The team decided that it would be safer put the new feature behind a feature flag so they could test it themselves first. If the test goes well, the feature could be slowly rolled out to everyone or quickly revert if an issue is discovered.

Let's see how this could be done using OpenFeature. [Here](https://github.com/open-feature/playground/blob/fa84c6262bb4493216c7cfe7d3d3542c5d753bad/packages/fibonacci/src/lib/fibonacci.ts#L5-L29) is where the Fib3r team add a feature flag that returns the name of the algorithm to run. Looking closely at the `getStringValue` method, you'll notice [evaluation context](https://docs.openfeature.dev/docs/reference/concepts/evaluation-context) is not being defined. Evaluation context is commonly used in feature flagging to dynamically determine the flag value. For example, the Fib3r team may want to test the `binet` algorithm on employees only. This can be done by setting the user's email address as evaluation context and defining a rule that returns `binet` only when the email address ends with `@faas.com`. Simple enough, but remember that evaluation context wasn't explicitly set during the flag evaluation linked above. That's because OpenFeature allows developers to set evaluation context at various points in their application. In this case, evaluation context is set [on each transaction](https://github.com/open-feature/playground/blob/fa84c6262bb4493216c7cfe7d3d3542c5d753bad/packages/app/src/app/transaction-context.middleware.ts#L15) and automatically used during flag evaluation.

## Available providers

The following [providers](https://docs.openfeature.dev/docs/reference/concepts/provider) can be used in the demo. Location the provider you're interested in trying to get started.

### Environment Variable Provider

The environment variable provider is a simple demo showing how environment
variables could be used make flag evaluations. Its purpose is to show how a basic
provider **could** be implemented.

To get started, follow the instructions in the `How to run this demo` section. Once on the demo app, select `env` from the dropdown located at the bottom-right of the screen. To change a flag value, open the `.env` file in your favorite text editor. Update the flag values based on the options defined as comments above the flag key. When you're ready, save the file and restart the demo.

Using environment variables like this can be a good way to get started with feature flagging. However, the approach only support basic use cases and is quite cumbersome.

### FlagD Provider

TODO: Add section on FlagD

### Go-feature-flag Provider

TODO: Add section on Go Feature Flag

### Split Provider Demo

TODO: Add section on Split

### CloudBees FM Provider Demo

TODO: Add section on CloudBees

### LaunchDarkly Provider Demo

TODO: Add section on LaunchDarkly

### Flagsmith Provider Demo

TODO: Add section on Flagsmith

## Experimenting beyond the demo

### Evaluation context

The follow evaluation context is available during flag evaluation. That means any of these properties can be used when defining rule in the feature flag manager of your choosing.

| Name         | Description                                                                            |
| ------------ | -------------------------------------------------------------------------------------- |
| ip           | The IP address sent from the browser. This comes from the `x-forwarded-for` header.    |
| email        | The email address of the logged in user. Returns `anonymous` if the user is logged out |
| targetingKey | Same as email                                                                          |
| method       | The HTTP method used (e.g. GET, POST, PUT)                                             |
| path         | The HTTP path of the request (e.g. /hex-color)                                         |
| ts           | The current time in milliseconds                                                       |

## Troubleshooting

### Ports are not available

Confirm that the follow ports are available `30000` and `16686`.

### Vendor isn't listed in the dropdown

To add a vendor to the demo, follow the vendor specific section in the documentation. An SDK key **must** be added to the appropriate property in the `.env` file and the demo needs to be restarted.
