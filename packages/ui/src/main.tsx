import { StepType, TourProvider } from '@reactour/tour';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import Page from './app/app';

// Highlights an object/area in the JSON editor based on the key, and optionally the next key.
const editorHighlightAreaSelectors = (
  startProperty: string,
  endProperty?: string
) => {
  let selectors = [`span[value="${startProperty}"]`];

  if (endProperty) {
    selectors = [
      ...selectors,
      `span[value="${startProperty}"]~span[value="{"`,
      `span[value="${startProperty}"]~span[value=","`,
      `span[value="${startProperty}"]~span[value="}"]+span[value=","]`,
      `span[value="${startProperty}"]~span[value="${endProperty}"]`,
    ];
  }

  return selectors;
};

const steps: StepType[] = [
  {
    // step 0
    selector: 'html',
    content: `Welcome to the OpenFeature demo! This is the landing page for our fictional killer app: Fibonacci as a service! First a few things about OpenFeature, and this demo...`,
  },
  {
    // step 1
    selector: '.step-buttons',
    content: `Use these buttons to toggle the editor, or resume the tour at any time.`,
  },
  {
    // step 2
    selector: 'html',
    content: `OpenFeature defines abstractions that allows the use of a single API to evaluate feature flags, no matter where your feature flags are managed (a SaaS vendor, a "in-house" implementation, OpenFeature's cloud native solution, or even a file).`,
  },
  {
    // step 3
    selector: '.json-editor',
    content: `For this demo, we get flag definitions from a simple JSON file, which you can modify with this embedded editor.`,
  },
  {
    // step 4
    selector: 'html',
    content: `Let's get started learning how OpenFeature is helping the authors of our fictional service manage this landing page!`,
  },
  {
    // step 5
    selector: '.step-name',
    content: `The company has been in the process of changing the name of our app, but legal hasn't quite finished the process yet. Here, we've defined a simple boolean flag ('new-welcome-message') that we can use to update the name instantly without redeploying our application.`,
  },
  {
    // step 6
    selector: editorHighlightAreaSelectors('newWelcomeMessage')[0],
    content: `Use the editor to change the state of the boolean "newWelcomeMessage" flag to "enabled" (click anywhere outside the editor to apply the change).`,
    highlightedSelectors: editorHighlightAreaSelectors('newWelcomeMessage'),
  },
  {
    // step 7
    selector: '.step-hex-color',
    content: `Great! Now let's look into a flag with an associated string value. The design team is frequently experimenting with new color pallettes. Let's change our landing page's color.`,
  },
  {
    // step 8
    selector: editorHighlightAreaSelectors('hexColor', 'fibAlgo')[0],
    content: `Use the editor to change the "defaultVariant" of the "hexColor" flag to match any of the defined variants.`,
    highlightedSelectors: editorHighlightAreaSelectors('hexColor', 'fibAlgo'),
  },
  {
    // step 9
    selector: 'html',
    content: `Snazzy choice! Maybe you are a designer yourself? Feature flags provide a great means of allowing team-members who aren't engineers to control selected aspects of application characteristics.`,
  },
  {
    // step 10
    selector: '.fib',
    content: `Let's give the fibonacci calculator a try, give it a click...`,
  },
  {
    // step 11
    selector: '.fib',
    content: `Turns out, calculating fibonacci(n) recursively isn't exactly efficient... Luckily, top minds at our company have found a more efficient algorithm for calculating fibonacci(n). It's experimental, so we only want to allow employee's to test it. Let's see how OpenFeature can help with that...`,
  },
  {
    // step 12
    selector: '.step-click-login',
    content: `Click here to login.`,
  },
  {
    // step 13
    selector: '.step-login',
    content: `Enter an email ending in "@faas.com", and click login.`,
  },
  {
    // step 14
    selector: '.fib',
    content: `Flag evaluations can take into account contextual information, about the user, application, or action. The "fib-algo" flag returns a different result if our email ends with "@faas.com". Let's run the fibonacci calculator again as an employee to test the new algorithm...`,
  },
  {
    // step 15
    selector: 'html',
    content: `Much better, we should enable this for all users soon!`,
  },
  {
    // step 16
    selector: 'html',
    content: `That's it for our tour, but one more thing: as previously mentioned, one of the core benefits of OpenFeature is a consistent API across feature flag management systems...`,
  },
  {
    // step 17
    selector: 'html',
    content: `You can start the same tour with a different demo "provider", and connect OpenFeature to the SaaS Vendor of your choice, or you can create a custom provider of your own! Check out this project's README for more info.`,
  },
  {
    // step 18
    selector: 'html',
    content: `Thanks for taking this quick tour of OpenFeature.`,
  },
];

const stepStye = {
  popover: (props: { [key: string]: unknown }) => {
    return {
      ...props,
      fontFamily: 'sans-serif',
    };
  },
  badge: (props: { [key: string]: unknown }) => {
    return {
      ...props,
      backgroundColor: '#888',
    };
  },
  dot: (props: { [key: string]: unknown }) => {
    return {
      ...props,
      backgroundColor: '#888',
    };
  },
};

// add custom to every step
const styledSteps = steps.map((step) => ({
  ...step,
  styles: { ...stepStye, ...step.styles },
}));

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <TourProvider
      steps={styledSteps}
      maskClassName="tour-mask"
      onClickMask={() => undefined}
      padding={50}
      disableFocusLock={true}
    >
      <Page />
    </TourProvider>
  </StrictMode>
);
