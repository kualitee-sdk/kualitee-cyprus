# kualitee_cypress
This package is for Kualitee users to post their execution cycle from cypress to Kualitee tool.

## Getting started
### Step 1: Install `kualitee_cypress`:

#### NPM
```
npm install kualitee_cypress
```

### Step 2: Import or require the postResult from kualitee_cypress :
`import` or `require` (as your project demand) the `postResult` method in `cypress.config.js`.

```
const { postResult } = require("kualitee_cypress");

module.exports = defineConfig({
  //implement testing logics here
})
```

### Usage
Now the package is ready to use in your project. You can use either with `e2e` testing or with `component testing`.

- ##### End-to-End Testing `e2e`
Under your `setupNodeEvents` method, call cypress API `on("after: run", () => { })` and call the method with return `postResult()` with three mandatory arguments like `postResult('userToken', 'projectId', 'path to report')` as mentioned in the code snippet.

```
const { postResult } = require("kualitee_cypress");

module.exports = defineConfig({

  e2e: {
    setupNodeEvents(on, config) {
      on("after:run", () => {
        return postResult(userToken, projectId, path to report);
      });
    },
  },
});
```
After configuration `run the cypress` in terminal (`npx cypress run`) or your custom command.

- #### Component Testing
```
const { postResult } = require("kualitee_cypress");

module.exports = defineConfig({

  component: {
    setupNodeEvents(on, config) {
      on("after:run", () => {
        return postResult(userToken, projectId, path to report);
      });
    },
  },
});
```
After configuration `run the cypress` in terminal (`npx cypress run --component`) or your custom command.

### Outputs
On completion of cypress run, you will get the `Successfull` or `Error` message in terminal.

![kualitee_cypress](https://user-images.githubusercontent.com/48677205/228813255-e8f3c0a7-2f41-4743-a333-22b672a0541a.png)

