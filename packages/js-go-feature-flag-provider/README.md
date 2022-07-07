# js-go-feature-flag-provider

This provider is an implementxation for [`go-feature-flag`](https://github.com/thomaspoignant/go-feature-flag) a simple and complete
feature flag solution, without any complex backend system to install, all you need is a file as your backend.

It uses [`go-feature-flag-relay-proxy`](https://github.com/thomaspoignant/go-feature-flag-relay-proxy) which expose the capabilities of the SDK through an API layer.\

## How to run this demo

1. You should start by running an instance of `go-feature-flag-relay-proxy`.

```shell
  # download relay proxy configuration file
  curl https://gist.githubusercontent.com/thomaspoignant/777c23351a07dc88d01bf162d2496115/raw/94eb003c7e98f00398dd62a9aea67b1f5f21fd42/goff-proxy.yaml -o goff-proxy.yaml

  # download an example of flag configuration file
  curl https://gist.githubusercontent.com/thomaspoignant/fefe16973c1272ff0682212564874c90/raw/d96c13f57132816f3989a3dd5caf5b582fe6565b/flags.yaml -o flags.yaml

  # launch go-feature-flag relay proxy (here using the docker image)
  docker run -p 1031:1031 -v $(pwd)/:/goff/ thomaspoignant/go-feature-flag-relay-proxy:latest
```

2. Start the demo  
  To start the demo you should clone this playground and launch the instance.

```shell
  # Clone this repository
  https://github.com/open-feature/playground
  
  # Download dependencies
  npm ci
  
  # Start the demo
  npm run go-feature-flag-demo
  
  # (optional) You can launch the UI
  # In a new terminal session run the UI
  npm run ui
  # Open [localhost:4200](http://localhost:4200) in your browser!
```

3. Change the flags values by editing your `flags.yaml` file.  
  _Follow [the documentation](https://thomaspoignant.github.io/go-feature-flag/latest/flag_format/) to get the information on how to edit your file_ 
   
