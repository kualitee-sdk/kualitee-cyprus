# kualitee_cypress
This package is for kualitee users to post their execution cycle from cypress to kualitee tool

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

##### End-to-End Testing `e2e`
Under your `setupNodeEvents` method, call cypress API `on("after: run", () => { })` and call the method with return `postResult()` with three mandatory arguments like `postResult('userToken', 'projectId', 'path to report')` as mentioned in the code snippet.

```
const { postResult } = require("kualitee_cypress");

module.exports = defineConfig({

  e2e: {
    setupNodeEvents(on, config) {
      on("after:run", () => {
        return postResult('5c5b38660422e50d8ab4f2e0', '24164', 'cypress/reports');
      });
    },
  },
});
```
After configuration `run the cypress` in terminal.
#### Component Testing
working...

### Outputs
On completion of cypress run, you will get the `Successfull` or `Error` message in terminal.

kualitee_cypress.png


