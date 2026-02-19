# kualitee_bridge
This package is for [Kualitee](https://www.kualitee.com/) users.

###### Core features
* **Integration with [Cypress](https://www.cypress.io/)**
  * Lets Generate report on kualitee for Cypress test execution.
  * Integration kualitee with cypress, execute the scenario from kualitee and update the status of test case.
* **Integration with [Playwright](https://playwright.dev/)**
  * Run Playwright tests from Kualitee and get reports on one place.

## Table of Contents
- [Installation](#npm)
- [Integration with Cypress](#integration-with-cypress)
  - [Sync Cypress report to Kualitee](#sync-cypress-report-to-kualitee)
    - [Using Cypress Environment (Approach 1)](#using-cypress-environment-approach-1)
    - [Using Kualitee Tool (Approach 2)](#using-kualitee-tool-approach-2)
  - [Execute scenario from kualitee and update the status](#execute-scenario-from-kualitee-and-update-the-status)
- [Integration with Playwright](#integration-with-playwright)
  - [Post Playwright report to Kualitee](#integration-with-playwright)



## Install `kualitee_bridge` :

#### NPM
```
npm install kualitee_bridge
```
# Integration with Cypress
By following the some simple and easiest configuration the kualitee can get all reports and status on single place.
## <mark style="background-color: #3b85ff">Sync Cypress Report to Kualitee</mark>
If you are using [Kualitee](https://www.kualitee.com/) as your test management tool, you can sync your Cypress execution report with Kualitee using two different approaches. You can choose the approach that best fits your setup :relaxed:.
## Using Cypress Environment (Approach 1)
You can send your test reports directly to Kualitee from your Cypress project. You do not need to manage or upload reports manually. Just add a small configuration in your Cypress setup, and everything will work automatically. Follow the setup instructions below to get started.
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

**reportPath**: _string_ The path in the cypress project where execution reports will generate like `cypress/e2e/reports`.


### Step 2: Import or require the postResult from kualitee_bridge
`import` or `require` the `postReport` method in `cypress.config.js`.

```
const { postReport } = require("kualitee_bridge");

module.exports = defineConfig({
  //implement testing logics here
})
```

### Usage
Now the package is ready to use in your project. You can use either with `e2e` testing or with `component testing`.

- ##### End-to-End Testing `e2e`
Under your `setupNodeEvents` method, call cypress API `on("after: run", () => { })` and call the method with return `postResult()`.

```
const { postReport } = require("kualitee_bridge");

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
const { postReport } = require("kualitee_bridge");

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
On cypress execution, you will get the `Successfull` or `Error` message in terminal.

![Screenshot from 2023-04-27 09-49-28](https://user-images.githubusercontent.com/48677205/234762673-e87ad03c-28dc-4f67-a089-6e3ff5df940f.png)

## Using Kualitee Tool (Approach 2)
After installing kualitee-bridge, you only need to complete the setup once. After that, you can run Cypress tests directly from Kualitee anytime and receive the execution report automatically.

## Set up a server
Set up a server inside your Cypress project to allow communication with Kualitee.

> [!IMPORTANT]
> You need to install following packages before adding the code snipet.
> ```
> npm install kualitee_bridge
> ```
> ```
> npm i express
> ```
> ```
> npm i cors
> ```
> ```
> npm i body-parser
> 
```javascript
const express = require('express')
var cors = require('cors');
var bodyParser = require('body-parser')
const app = express()

const { cypressTestCaseExecution } = require("kualitee_bridge")

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));


const port = 3000
const hostname = 'localhost';

app.post('/execute-BDD', (req, res) => {
  cypressTestCaseExecution(req, res, 'cypress/reports')
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
```

> [!TIP]
> - Once the setup in **Cypress** is complete, you only need to configure the integration part in **Kualitee**. [Click here for integration part in Kualitee](https://medium.com/@yaseennasri8/streamlining-the-testing-process-with-cypress-cucumber-integration-in-kualitee-bb47584948ba)
> - If you use the Express server shown above, then your integration URL in Kualitee will be: `http://localhost:3000/execute-BDD`



## <mark style="background-color: #3b85ff">Execute scenario from kualitee and update the status</mark>
Lets execute the scenarios from kualitee and get the latest status on kualitee.

**Prerequisites**
- Install `kualitee_bridge` in your Cypress project.
- [Cypress](https://www.cypress.io/) must have a [Cucumber](https://cucumber.io/) integeration.
- You need to add a unique tag for both **Feature**`(test scenario in kualitee)` and **Scenario**`(test case in kualitee)`.  

### Step 1: Add tags
You need to add a unique tag for both _feature_ and _scenario_ with a prefix __@kts___ and __@ktc___ respectively. For example `@kts_login` instead of **@login** for a _feature_ and for _scenario_ add tag like `@ktc_success_login` instead of using only **@success_login** and these should be the same as in Kualitee.
### Step 2: Set up  your cypress project
Setup your cypress project and add unique `tags` to run your *scenarios* from Kualitee by *tags*.

### Step 3: Set up a server to communicate from Kualitee
By adding the following express code snipet in your `index.js` file on root directory of your *cypress project* you can execute `Scenarios` from `Kualitee` with a single click. 
> [!IMPORTANT]
> You need to install following packages before adding the code snipet.
> ```
> npm install kualitee_bridge
> ```
> ```
> npm i express
> ```
> ```
> npm i cors
> ```
> ```
> npm i body-parser
> ```

```javascript
const express = require('express')
var cors = require('cors');
var bodyParser = require('body-parser')
const app = express()

const { cypressTestCaseExecution } = require("kualitee_bridge")

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));


const port = 3000
const hostname = 'localhost';

app.post('/execute-BDD', (req, res) => {
  cypressTestCaseExecution(req, res, 'cypress/reports')
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
```

#### Arguments in *`cypressTestCaseExecution(req, res, 'cypress/reports')`*
**req**: It is the request body and it will pass as it is *req*.

**res**: It is the response body and it will pass as it is *res*.

**path/to/report**: _string_ The path in the cypress project where reports generate like `cypress/e2e/reports`.
Now you can execute the _Scenario_ from Kualitee tool.

> [!TIP]
> On finishing the setup in **Cypress** only integration part of **Kualitee** you need to do. [Click here for integration part in Kualitee](https://medium.com/@yaseennasri8/streamlining-the-testing-process-with-cypress-cucumber-integration-in-kualitee-bb47584948ba)

# Integration with PlayWright
### Step 1: Set up  your playwright project
Setup your playwright project.
### Step 2: Specify Reporter
Specify reporters programmatically in the configuration file `playwright.config.ts`.
![image](https://github.com/kualitee-sdk/kualitee-cyprus/assets/48677205/15a85a1d-4d39-4186-96ba-9324cad7655f)
### Step 3: Set up a server to communicate from Kualitee
By adding the following express code snipet in your `index.js` file on root directory of your *playwright project* you can execute a cycle with a single click. 
> [!IMPORTANT]
> You need to install following packages before adding the code snipet.
> ```
> npm install kualitee_bridge
> ```
> ```
> npm i express
> ```
> ```
> npm i cors
> ```
> ```
> npm i body-parser
> ```

```javascript
const express = require('express')
var cors = require('cors');
var bodyParser = require('body-parser')
const app = express()

const {playwrightToKualitee} = require('kualitee_bridge');

app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

const port = 3000
const hostname = 'localhost';

app.post('/script-run', (req, res) => {
  playwrightToKualitee(req, res, './json-report/report.json')
});

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`)
})
```

#### Arguments in *`playwrightToKualitee(req, res, 'path/to/report')`*
**req**: It is the request body and it will pass as it is *req*.

**res**: It is the response body and it will pass as it is *res*.

**path/to/report**: _string_ Path which were specify in reporter in `playwright.config.ts` like `./json-report/report.json`.

Now your server configured, just hit the command `node index.js` in terminal and your server will be up and ready to communicate with kualitee. In the case of above mentioned server, your integration url with kualitee will be `http://localhost:3000/run-test`.
 
**Where:** `http://localhost` is your server base URL `3000:` is port number and `run-test:` is end point.

Now you can execute the playwright cycle from Kualitee.

**Note:** If you are using a package version earlier than **2.0.0**, only **Node.js** version **18.16.0** is supported.