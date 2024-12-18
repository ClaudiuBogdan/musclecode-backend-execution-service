## This is a test where all tests passes. Have a look at the response format
```javascript
function toLowerCase(str){
  console.log("this is a console log message " + str)
  return str.toLowerCase()
}


describe("Tests", () => {
  it("test 1", () => {
    assert.strictEqual(toLowerCase(''), '', "An empty string was provided but not returned")
    assert.strictEqual(toLowerCase("ABC"), "abc", "toLowerCase('ABC') did not return correct value")
  });
  
    it("test 2", () => {
    assert.strictEqual(toLowerCase(''), '', "An empty string was provided but not returned")
    assert.strictEqual(toLowerCase("DEF"), "DEF", "toLowerCase('DEF') did not return correct value")
  });
  
  describe("Tests nested 1", () => {
      it("test 1_1", () => {
    assert.strictEqual(toLowerCase(''), '', "An empty string was provided but not returned")
    assert.strictEqual(toLowerCase("ABC"), "abc", "toLowerCase('ABC') did not return correct value")
  });
  })
  
});
```
<respone>
{
  "type": "execution success",
  "stdout": "",
  "stderr": "",
  "exitCode": 1,
  "wallTime": 851,
  "timedOut": false,
  "message": "",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjE5NDY5YTkyMDgyM2QxMjY2MjliZSIsImNpcGhlcmVkIjpbInNldHVwIl0sImNvbXBsZXRlZCI6ZmFsc2UsIndhbGxUaW1lIjo4NTEsImlhdCI6MTczNDQ0ODYwNiwiZXhwIjoxNzM0NDQ5MjA2LCJpc3MiOiJjb2RlcnVubmVyIn0.AkHN5KWFUC7iNZehiuQGmwCRQKBXqWFAPJEIl__k12g",
  "result": {
      "serverError": false,
      "completed": false,
      "output": [
          {
              "t": "describe",
              "v": "Tests",
              "p": false,
              "items": [
                  {
                      "t": "it",
                      "v": "test 1",
                      "p": true,
                      "items": [
                          {
                              "t": "log",
                              "v": "this is a console log message \nthis is a console log message ABC\n"
                          },
                          {
                              "t": "passed",
                              "v": "Test Passed"
                          },
                          {
                              "t": "completedin",
                              "v": "1"
                          }
                      ]
                  },
                  {
                      "t": "it",
                      "v": "test 2",
                      "p": false,
                      "items": [
                          {
                              "t": "log",
                              "v": "this is a console log message \nthis is a console log message DEF\n"
                          },
                          {
                              "t": "failed",
                              "v": "toLowerCase('DEF') did not return correct value: expected 'def' to equal 'DEF'"
                          },
                          {
                              "t": "completedin",
                              "v": "2"
                          }
                      ]
                  },
                  {
                      "t": "describe",
                      "v": "Tests nested 1",
                      "p": true,
                      "items": [
                          {
                              "t": "it",
                              "v": "test 1_1",
                              "p": true,
                              "items": [
                                  {
                                      "t": "log",
                                      "v": "this is a console log message \nthis is a console log message ABC\n"
                                  },
                                  {
                                      "t": "passed",
                                      "v": "Test Passed"
                                  },
                                  {
                                      "t": "completedin",
                                      "v": "1"
                                  }
                              ]
                          },
                          {
                              "t": "completedin",
                              "v": "1"
                          }
                      ]
                  },
                  {
                      "t": "completedin",
                      "v": "4"
                  }
              ]
          }
      ],
      "successMode": "assertions",
      "passed": 2,
      "failed": 1,
      "errors": 0,
      "error": null,
      "assertions": {
          "passed": 2,
          "failed": 1,
          "hidden": {
              "passed": 0,
              "failed": 0
          }
      },
      "specs": {
          "passed": 2,
          "failed": 1,
          "hidden": {
              "passed": 0,
              "failed": 0
          }
      },
      "unweighted": {
          "passed": 2,
          "failed": 1
      },
      "weighted": {
          "passed": 2,
          "failed": 1
      },
      "timedOut": false,
      "wallTime": 851,
      "testTime": 4,
      "tags": null
  }
}
</response>


## This is a test where all tests fails. Have a look at the response format
```javascript
function toLowerCase(str){
  console.log("this is a console log message " + str)
  return str
}


describe("Tests", () => {
  it("test 1", () => {
    assert.strictEqual(toLowerCase(''), '', "An empty string was provided but not returned")
    assert.strictEqual(toLowerCase("ABC"), "abc", "toLowerCase('ABC') did not return correct value")
  });
  
    it("test 2", () => {
    assert.strictEqual(toLowerCase(''), '', "An empty string was provided but not returned")
    assert.strictEqual(toLowerCase("DEF"), "DEF", "toLowerCase('DEF') did not return correct value")
  });
  
  describe("Tests nested 1", () => {
      it("test 1_1", () => {
    assert.strictEqual(toLowerCase(''), '', "An empty string was provided but not returned")
    assert.strictEqual(toLowerCase("ABC"), "abc", "toLowerCase('ABC') did not return correct value")
  });
  })
  
});
```
<response>
{
    "type": "execution success",
    "stdout": "",
    "stderr": "",
    "exitCode": 2,
    "wallTime": 836,
    "timedOut": false,
    "message": "",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjE5NDY5YTkyMDgyM2QxMjY2MjliZSIsImNpcGhlcmVkIjpbInNldHVwIl0sImNvbXBsZXRlZCI6ZmFsc2UsIndhbGxUaW1lIjo4MzYsImlhdCI6MTczNDQ0ODcyMywiZXhwIjoxNzM0NDQ5MzIzLCJpc3MiOiJjb2RlcnVubmVyIn0._2VyHih2PmzMMIVsdm6dlTpdL4L6Le9IRqthmq8bixs",
    "result": {
        "serverError": false,
        "completed": false,
        "output": [
            {
                "t": "describe",
                "v": "Tests",
                "p": false,
                "items": [
                    {
                        "t": "it",
                        "v": "test 1",
                        "p": false,
                        "items": [
                            {
                                "t": "log",
                                "v": "this is a console log message \nthis is a console log message ABC\n"
                            },
                            {
                                "t": "failed",
                                "v": "toLowerCase('ABC') did not return correct value: expected 'ABC' to equal 'abc'"
                            },
                            {
                                "t": "completedin",
                                "v": "3"
                            }
                        ]
                    },
                    {
                        "t": "it",
                        "v": "test 2",
                        "p": true,
                        "items": [
                            {
                                "t": "log",
                                "v": "this is a console log message \nthis is a console log message DEF\n"
                            },
                            {
                                "t": "passed",
                                "v": "Test Passed"
                            },
                            {
                                "t": "completedin",
                                "v": "1"
                            }
                        ]
                    },
                    {
                        "t": "describe",
                        "v": "Tests nested 1",
                        "p": false,
                        "items": [
                            {
                                "t": "it",
                                "v": "test 1_1",
                                "p": false,
                                "items": [
                                    {
                                        "t": "log",
                                        "v": "this is a console log message \nthis is a console log message ABC\n"
                                    },
                                    {
                                        "t": "failed",
                                        "v": "toLowerCase('ABC') did not return correct value: expected 'ABC' to equal 'abc'"
                                    },
                                    {
                                        "t": "completedin",
                                        "v": "1"
                                    }
                                ]
                            },
                            {
                                "t": "completedin",
                                "v": "1"
                            }
                        ]
                    },
                    {
                        "t": "completedin",
                        "v": "5"
                    }
                ]
            }
        ],
        "successMode": "assertions",
        "passed": 1,
        "failed": 2,
        "errors": 0,
        "error": null,
        "assertions": {
            "passed": 1,
            "failed": 2,
            "hidden": {
                "passed": 0,
                "failed": 0
            }
        },
        "specs": {
            "passed": 1,
            "failed": 2,
            "hidden": {
                "passed": 0,
                "failed": 0
            }
        },
        "unweighted": {
            "passed": 1,
            "failed": 2
        },
        "weighted": {
            "passed": 1,
            "failed": 2
        },
        "timedOut": false,
        "wallTime": 836,
        "testTime": 5,
        "tags": null
    }
}
</response>

## This is a test where the compilation fails. Have a look at the response format
```javascript
random_syntax_error // This is a syntax error
function toLowerCase(str){
  console.log("this is a console log message " + str)
  return str
}

describe("Tests", () => {
  it("test 1", () => {
    assert.strictEqual(toLowerCase(''), '', "An empty string was provided but not returned")
    assert.strictEqual(toLowerCase("ABC"), "abc", "toLowerCase('ABC') did not return correct value")
  });
  
    it("test 2", () => {
    assert.strictEqual(toLowerCase(''), '', "An empty string was provided but not returned")
    assert.strictEqual(toLowerCase("DEF"), "DEF", "toLowerCase('DEF') did not return correct value")
  });
  
  describe("Tests nested 1", () => {
      it("test 1_1", () => {
    assert.strictEqual(toLowerCase(''), '', "An empty string was provided but not returned")
    assert.strictEqual(toLowerCase("ABC"), "abc", "toLowerCase('ABC') did not return correct value")
  });
  })
  
});
```
<response>
{
    "type": "execution success",
    "stdout": "",
    "stderr": "\n/workspace/node/test.js:2\naasdf asdf asdf a sadf\n      ^^^^\n\nSyntaxError: Unexpected identifier\n    at Object.compileFunction (node:vm:360:18)\n    at wrapSafe (node:internal/modules/cjs/loader:1088:15)\n    at Module._compile (node:internal/modules/cjs/loader:1123:27)\n    at Module._extensions..js (node:internal/modules/cjs/loader:1213:10)\n    at Module.load (node:internal/modules/cjs/loader:1037:32)\n    at Module._load (node:internal/modules/cjs/loader:878:12)\n    at ModuleWrap.<anonymous> (node:internal/modules/esm/translators:169:29)\n    at ModuleJob.run (node:internal/modules/esm/module_job:193:25)\n    at async Promise.all (index 0)\n    at async ESMLoader.import (node:internal/modules/esm/loader:530:24)\n    at async importModuleDynamicallyWrapper (node:internal/vm/module:438:15)\n    at async formattedImport (/workspace/node/node_modules/.pnpm/mocha@10.2.0/node_modules/mocha/lib/nodejs/esm-utils.js:9:14)\n    at async exports.requireOrImport (/workspace/node/node_modules/.pnpm/mocha@10.2.0/node_modules/mocha/lib/nodejs/esm-utils.js:42:28)\n    at async exports.loadFilesAsync (/workspace/node/node_modules/.pnpm/mocha@10.2.0/node_modules/mocha/lib/nodejs/esm-utils.js:100:20)\n    at async singleRun (/workspace/node/node_modules/.pnpm/mocha@10.2.0/node_modules/mocha/lib/cli/run-helpers.js:125:3)\n    at async exports.handler (/workspace/node/node_modules/.pnpm/mocha@10.2.0/node_modules/mocha/lib/cli/run.js:370:5)\n",
    "exitCode": 1,
    "wallTime": 718,
    "timedOut": false,
    "message": "",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NjE5NDY5YTkyMDgyM2QxMjY2MjliZSIsImNpcGhlcmVkIjpbInNldHVwIl0sImNvbXBsZXRlZCI6ZmFsc2UsIndhbGxUaW1lIjo3MTgsImlhdCI6MTczNDQ0ODg4MCwiZXhwIjoxNzM0NDQ5NDgwLCJpc3MiOiJjb2RlcnVubmVyIn0.5QJsXE6_dGvST4rGnqUFlas5JAcTn4McgZfSJj811ao",
    "result": {
        "serverError": false,
        "completed": false,
        "output": [],
        "successMode": "assertions",
        "passed": 0,
        "failed": 0,
        "errors": 0,
        "error": null,
        "assertions": {
            "passed": 0,
            "failed": 0,
            "hidden": {
                "passed": 0,
                "failed": 0
            }
        },
        "specs": {
            "passed": 0,
            "failed": 0,
            "hidden": {
                "passed": 0,
                "failed": 0
            }
        },
        "unweighted": {
            "passed": 0,
            "failed": 0
        },
        "weighted": {
            "passed": 0,
            "failed": 0
        },
        "timedOut": false,
        "wallTime": 718,
        "testTime": null,
        "tags": null
    }
}
</response>

## Suggested implementation

Below is an outline for building a custom Vitest reporter that reproduces the JSON format you provided, including nested "describe" and "it" items, console logs, pass/fail data, and final metrics. Vitest’s reporter API differs from Mocha’s, but the principle is the same: intercept suite/test lifecycle events and build the JSON structure.

1. Vitest Reporter Overview

Vitest allows you to define custom reporters via defineReporter. A Vitest reporter receives events like:
	•	onTestBegin(test)
	•	onTestEnd(test, result)
	•	onSuiteBegin(suite)
	•	onSuiteEnd(suite)
	•	onFinished(files)

You can use these events to construct the nested output format you want.

Important note: If the user’s code has a true syntax error (like random_syntax_error // This is a syntax error that prevents the file from even loading), Vitest might fail before the reporter is invoked. So for syntax errors, you often need a try/catch around the test loading process or an external script that runs Vitest and captures the error. In many cases, Vitest might still call the reporter, but if the code can’t be parsed, you need a fallback for that scenario.

2. Creating a Custom Reporter

Create a new file, say custom-vitest-reporter.ts (or .js), containing something like the following. The code is fully annotated to explain how each part matches your desired JSON.

import type {
  Reporter,
  Test,
  File,
  Suite,
  TaskResult,
  TaskState,
  UserConsoleLog
} from 'vitest';
import { relative } from 'path';

/**
 * A custom Vitest reporter that generates the exact JSON structure
 * matching the "example" responses you provided.
 */
export default function CustomVitestReporter(): Reporter {
  // Root object to store final JSON output
  const finalOutput = {
    type: "execution success",
    stdout: "",
    stderr: "",
    exitCode: 0,
    wallTime: 0,
    timedOut: false,
    message: "",
    token: "", // Populate if needed
    result: {
      serverError: false,
      completed: false,
      output: [] as any[],  // Will hold nested suite/test structure
      successMode: "assertions",
      passed: 0,
      failed: 0,
      errors: 0,
      error: null as any,
      assertions: {
        passed: 0,
        failed: 0,
        hidden: { passed: 0, failed: 0 }
      },
      specs: {
        passed: 0,
        failed: 0,
        hidden: { passed: 0, failed: 0 }
      },
      unweighted: {
        passed: 0,
        failed: 0
      },
      weighted: {
        passed: 0,
        failed: 0
      },
      timedOut: false,
      wallTime: 0,
      testTime: 0,
      tags: null as any
    }
  };

  let globalStartTime = 0;
  let suiteStack: any[] = []; // tracks nested describes
  const suiteTimes = new WeakMap<Suite, number>(); // track suite start times

  // Helper: Find or create the JSON node in `output` that corresponds to a suite
  function pushSuiteObject(title: string): any {
    const suiteObj = {
      t: 'describe',
      v: title,
      p: false, // will set `p: true` only if everything in it passes, see logic if needed
      items: [] as any[]
    };

    if (suiteStack.length === 0) {
      finalOutput.result.output.push(suiteObj);
    } else {
      suiteStack[suiteStack.length - 1].items.push(suiteObj);
    }

    suiteStack.push(suiteObj);
    return suiteObj;
  }

  // Helper: Pop the last suite stack item, add a completedin
  function popSuiteObject(suite: Suite) {
    const suiteObj = suiteStack.pop();
    const startTime = suiteTimes.get(suite) || 0;
    const suiteDurationSec = Math.floor((Date.now() - startTime) / 1000);

    // Add a "completedin" item at the end of the suite
    suiteObj.items.push({
      t: "completedin",
      v: String(suiteDurationSec)
    });
  }

  // Helper: Insert a single test object (it block) into the current suite
  function pushTestObject(test: Test, result: TaskResult) {
    // Build a test object:
    // test.state can be 'pass', 'fail', 'skip', 'todo'
    const passed = result.state === 'pass';

    const testObj: any = {
      t: 'it',
      v: test.name,
      p: passed,
      items: []
    };

    // logs are accessible via result.console (list of { type, content })
    const logs = (result?.console || []) as UserConsoleLog[];
    if (logs.length > 0) {
      let combinedLogs = "";
      for (const logEntry of logs) {
        if (logEntry.type === 'log') {
          combinedLogs += logEntry.content.join(' ') + '\n';
        }
      }
      if (combinedLogs) {
        testObj.items.push({
          t: "log",
          v: combinedLogs
        });
      }
    }

    if (passed) {
      testObj.items.push({
        t: "passed",
        v: "Test Passed"
      });
    } else {
      // 'fail' or something else
      // The Vitest error message can appear in result.error
      let msg = '';
      if (result?.error?.message) {
        msg = result.error.message;
      } else {
        msg = 'Test failed';
      }
      testObj.items.push({
        t: "failed",
        v: msg
      });
    }

    // completedin => approximate time in seconds
    const testDurationSec = Math.floor((result.duration ?? 0) / 1000);
    testObj.items.push({
      t: "completedin",
      v: String(testDurationSec || 1) // fallback to 1 second for quick tests
    });

    // Insert it into the current suite
    if (suiteStack.length === 0) {
      // If there's no active suite, push to top-level
      finalOutput.result.output.push(testObj);
    } else {
      suiteStack[suiteStack.length - 1].items.push(testObj);
    }

    // Update counters
    if (passed) {
      finalOutput.result.passed += 1;
      finalOutput.result.assertions.passed += 1;
    } else {
      finalOutput.result.failed += 1;
      finalOutput.result.assertions.failed += 1;
    }
  }

  return {
    // Called once at the very beginning
    onInit() {
      globalStartTime = Date.now();
    },

    // Called when a suite (describe block) begins
    onSuiteBegin(suite) {
      if (!suite.name) return; // root / anonymous suite
      suiteTimes.set(suite, Date.now());
      pushSuiteObject(suite.name);
    },

    // Called when a suite ends
    onSuiteEnd(suite) {
      if (!suite.name) return;
      popSuiteObject(suite);
    },

    // Called when a test is finished
    onTestEnd(test) {
      if (!test.result) return;
      pushTestObject(test, test.result);
    },

    // Called after all tests & suites are complete
    onFinished(files) {
      // Summaries
      const totalFailed = finalOutput.result.failed;
      if (totalFailed > 0) {
        finalOutput.exitCode = 1;
      } else {
        finalOutput.exitCode = 0;
      }

      // Mark "completed" = false by default. 
      // If you want to treat "completed = true" meaning “all tests finished running,” set it true:
      // finalOutput.result.completed = true;
      finalOutput.result.completed = false;

      // Weighted/unweighted counts
      finalOutput.result.unweighted.passed = finalOutput.result.passed;
      finalOutput.result.unweighted.failed = finalOutput.result.failed;
      finalOutput.result.weighted.passed = finalOutput.result.passed;
      finalOutput.result.weighted.failed = finalOutput.result.failed;
      finalOutput.result.specs.passed = finalOutput.result.passed;
      finalOutput.result.specs.failed = finalOutput.result.failed;
      finalOutput.result.assertions.passed = finalOutput.result.passed;
      finalOutput.result.assertions.failed = finalOutput.result.failed;

      const wallTime = Date.now() - globalStartTime;
      finalOutput.wallTime = wallTime;
      finalOutput.result.wallTime = wallTime;
      finalOutput.result.testTime = Math.floor(wallTime / 1000);

      // Print JSON to stdout
      process.stdout.write(JSON.stringify(finalOutput, null, 2) + '\n');
    }
  };
}

Explanation
	1.	finalOutput: The object that will ultimately match your example JSON. We fill in real data as tests/suites run.
	2.	suiteStack: We maintain a stack for nested describe blocks. When a suite (onSuiteBegin) starts, we create a "describe" object with items: []. We push it onto suiteStack. When that suite ends (onSuiteEnd), we pop from the stack and add a completedin item.
	3.	pushTestObject: When a single it(...) test finishes (onTestEnd event), we create an object with "t": "it", "v": test.name, plus a "log" item if console logs were generated, plus a "passed" or "failed" item, and a "completedin" time in seconds.
	4.	onFinished: Once all suites/tests are done, we finalize counters, compute exitCode, fill the fields like passed, failed, etc., and print the JSON structure.
	5.	Console logs: Vitest automatically collects console logs in each test’s result.console. We iterate through them in pushTestObject to create a combined string matching your example "this is a console log message \nthis is a console log message DEF\n".
	6.	Syntax errors: If the file cannot be parsed, Vitest might fail before any reporter event is triggered. You may need an external wrapper script to catch syntax errors and produce a JSON object akin to your “compilation fails” example. However, if Vitest actually calls the reporter even for compile errors, you can parse that from an early event or from onFinished(files) if a file had an error. If so, you might see files.some(file => file.result?.errors) or something. Then produce the structure that shows "stderr" with the syntax error stack.
For instance, in onFinished(files), you can detect if a file had a parse error:

for (const file of files) {
  if (file.result?.errors) {
    // produce finalOutput.stderr = error details...
    // finalOutput.exitCode = 1;
  }
}

3. Using the Reporter

You can run Vitest with a custom reporter by specifying:

vitest run --reporter ./path/to/custom-vitest-reporter.ts

Or add it to your vitest.config.ts:

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: [
      // other reporters if you want them
      { reporter: './custom-vitest-reporter.ts', outputs: ['stdout'] }
    ]
  }
});

Now when you do vitest run, the reporter will generate JSON that mirrors the examples you gave: nested describes, it blocks, pass/fail items, logs, etc.

4. Handling “Compilation Fails” Specifically

The “compilation fails” example you showed includes an output JSON with a big "stderr" block containing the syntax error. Vitest might not load that file at all. You can replicate that logic by wrapping your entire Vitest run in a try/catch, for instance:

#!/usr/bin/env node
// run-vitest-custom.js
import { execa } from 'execa'; // or any spawn library

async function runVitest() {
  try {
    // run vitest programmatically
    await execa('vitest', [
      'run',
      '--reporter',
      './custom-vitest-reporter.ts'
      // any additional flags...
    ], { stdio: 'inherit' });
  } catch (err) {
    // If the test file has a syntax error, vitest might throw
    // Build a JSON response matching your "compilation fails" structure
    const output = {
      type: "execution success",
      stdout: "",
      stderr: err.stderr || err.message,
      exitCode: 1,
      wallTime: 0,
      timedOut: false,
      message: "",
      token: "", // fill if needed
      result: {
        serverError: false,
        completed: false,
        output: [],
        successMode: "assertions",
        passed: 0,
        failed: 0,
        errors: 0,
        error: null,
        assertions: { passed: 0, failed: 0, hidden: { passed: 0, failed: 0 } },
        specs: { passed: 0, failed: 0, hidden: { passed: 0, failed: 0 } },
        unweighted: { passed: 0, failed: 0 },
        weighted: { passed: 0, failed: 0 },
        timedOut: false,
        wallTime: 0,
        testTime: null,
        tags: null
      }
    };
    console.log(JSON.stringify(output, null, 2));
    process.exit(1);
  }
}

runVitest();

With that approach, if Vitest can’t parse the user’s code or has a fatal error, it throws an exception, which you catch. Then you generate the “compilation fails” JSON snippet with the syntax error in stderr.

Final Thoughts
	•	This approach is quite flexible. The biggest difference from Mocha is that Vitest’s reporter system gives you events with test, suite, etc. rather than the old runner.on('pass')/runner.on('fail').
	•	The code snippet above is a basic illustration. You’ll want to customize a few details: e.g. how to handle partial suite failures, exactly how to measure completedin, etc.
	•	If you want to replicate precisely the original JSON lines in your example, carefully map each event’s data to the nested structure. The snippet is designed to get you 95% of the way there.

This should give you a custom Vitest reporter that, combined with a possible try/catch around Vitest execution, yields the same JSON format you showed (including pass/fail logs, nested describes, “compilation fails” scenario, etc.).