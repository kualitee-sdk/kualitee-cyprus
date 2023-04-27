# kualitee_cypress
This package is for [Kualitee](https://www.kualitee.com/) users.

**Core features**
* To generate report on kualitee from cypress.
* Integration kualitee with cypress, execute the scenario from kualitee and map the status if you are using cucumber in cypress.

## Table of Contents
- [Installation](#npm)
- [Post report to Kualitee](#post-report-to-kualitee)
- [Execute scenario from kualitee and map the results](#execute-scenario-from-kualitee-and-map-the-results)


## Install `kualitee_cypress` :

#### NPM
```
npm install kualitee_cypress
```

## Post Report to Kualitee
If you are using [Kualitee](https://www.kualitee.com/) testing tool then you can generate the execution cycle on Kualitee by following these steps.
### Step 1: Configure the `kualiteeConfigs` to `package.json`
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

**reportPath**: _string_ The path in the cypress project where reports generate like `cypress/e2e/reports`.


### Step 2: Import or require the postResult from kualitee_cypress
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

![Screenshot from 2023-04-27 09-49-28](https://user-images.githubusercontent.com/48677205/234762673-e87ad03c-28dc-4f67-a089-6e3ff5df940f.png)

## Execute scenario from kualitee and map the results
First, you need to Integrate Kualitee with Cypress, This integration involves configuring Kualitee to run Cypress tests and receive results. So, you need to follow these steps.

**Prerequisites**
- Installed `kualitee_cypress` in your Cypress project.
- Cypress using [Cucumber](https://cucumber.io/) and writing the test scenarios in BDD format.
- Able to run a single _scenario_ by using _tag_ in cypress.
- You need to add a unique tag for both **Feature** and **Scenario**. It is mandatory.  

### Step 1: Add tags
You need to add a unique tag for both _feature_ and _scenario_ with __@kts__ or __@ktc__. If you want to add tag **@login** for _feature_ then you will have
to add prefix like `@kts_login` and if you want to add tag **@success_login** for _scenario_ then you have to add the tag like `@ktc_success_login`.This step is mandatory for the _scenario_ or _feature_ which you want to execute and get status on Kualitee.
### Step 2: Host your cypress project on a server
This is mandatory to host your cypress project on the server by which you can run your *scenarios* from Kualitee by *tags*.

### Step 3: Set up an express server
Set up an express server and expose an API. Following is the example of an express server you can use it as template.

```
const express = require('express')
var cors = require('cors');
var bodyParser = require('body-parser')
const app = express()
app.use(cors());
app.use(bodyParser.json())

const port = 3000
const hostname = 'localhost';

app.post('/script-run', (req, res) => {
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
```
**note:-** Here you need to design proper route in **app.post()** function and use it in integration Kualitee with Cypress.

### Step 4: Include `kualitee_cypress`
If you are working in _CommonJS_ environment then include in server file like
```
const {executeTestCase} = require("kualitee_cypress")
```
If you are working in _ES6 (ECMAScript 2015) module system_ the include in server file like
```
import { executeTestCase } from 'kualitee_cypress';
```

### Step 5: Call the method in `kualitee_cypress`
You need to call the method _executeTestCase_ in  express **app.post()** function routes (which you used in kualitee to integrate kualitee with cypress)
with three arguments.

```
app.post('/script-run', (req, res) => {
  executeTestCase(req, res, 'cypress/e2e/reports')
});
```
#### Arguments
**req**: It is the reqest body and it will pass as it is *req*.

**res**: It is the response body and it will pass as it is *res*.

**reportPath**: _string_ The path in the cypress project where reports generate like `cypress/e2e/reports`.
Now you can execute the _Scenario_ from Kualitee tool.
















