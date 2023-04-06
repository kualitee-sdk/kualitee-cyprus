# kualitee_cypress
This package is for Kualitee users to post their execution cycle from cypress to Kualitee tool.

## Getting started
### Step 1: Install `kualitee_cypress` :

#### NPM
```
npm install kualitee_cypress
```

### Step 2: Configure the `kualiteeConfigs` to `package.json` :
```
  "kualiteeConfigs": {
    "token": 'userToken',
    "projectId": 'projectId',
    "reportPath": 'path/to/report'
  }
```

#### kualiteeConfigs
**token**: _string_ The user token you can get from the Kualitee tool you are using.

**projectId**: _string_ Project id on Kualitee tool with which the tests are associated.

**reportPath**: _string_ The path in cypress project where reports generate like `cypress/e2e/reports`.


### Step 3: Import or require the postResult from kualitee_cypress :
`import` or `require` (as your project demand) the `postResult` method in `cypress.config.js`.

```
const { postReport } = require("kualitee_cypress");

module.exports = defineConfig({
  //implement testing logics here
})
```

### Usage
Now the package is ready to use in your project. You can use either with `e2e` testing or with `component testing`.

- ##### End-to-End Testing `e2e`
Under your `setupNodeEvents` method, call cypress API `on("after: run", () => { })` and call the method with return `postResult()`.

```
const { postReport } = require("kualitee_cypress");

module.exports = defineConfig({

  e2e: {
    setupNodeEvents(on, config) {
      on("after:run", () => {
        return postReport();
      });
    },
  },
});
```
After configuration `run the cypress` in terminal (`npx cypress run`) or your custom command.

- #### Component Testing
```
const { postReport } = require("kualitee_cypress");

module.exports = defineConfig({

  component: {
    setupNodeEvents(on, config) {
      on("after:run", () => {
        return postReport();
      });
    },
  },
});
```
After configuration `run the cypress` in terminal (`npx cypress run --component`) or your custom command.

### Outputs
On completion of cypress run, you will get the `Successfull` or `Error` message in terminal.

![Screenshot from 2023-04-06 11-28-07](https://user-images.githubusercontent.com/48677205/230292569-ad41b583-8492-477e-a445-3cea514c1293.png)

