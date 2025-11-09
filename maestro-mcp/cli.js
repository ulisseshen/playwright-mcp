#!/usr/bin/env node
/**
 * Copyright (c) Microsoft Corporation.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { program } = require('playwright-core/lib/utilsBundle');
const { createConnection: createPlaywrightConnection } = require('playwright/lib/mcp/index');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const packageJSON = require('./package.json');
const { MaestroClient } = require('./dist/maestro');
const { AppTools, InteractionTools, AssertionTools, DeviceTools, FlowTools, FlutterTools } = require('./dist/tools');

// Parse command line arguments
program
  .version('Version ' + packageJSON.version)
  .name('Unified Testing MCP (Playwright + Maestro)')
  .option('--maestro-path <path>', 'Path to maestro CLI binary')
  .option('--working-directory <path>', 'Working directory for maestro commands')
  .option('--app-id <id>', 'Default app identifier')
  .option('--platform <platform>', 'Platform (iOS/Android) or device ID');

// Add Playwright's standard options
require('playwright/lib/mcp/program').decorateCommand(program, packageJSON.version);

async function startUnifiedServer(playwrightConfig, maestroConfig) {
  // Create Playwright connection
  const playwrightConn = await createPlaywrightConnection(playwrightConfig);

  // Create Maestro tools
  const maestro = new MaestroClient(maestroConfig);
  const maestroTools = {
    app: new AppTools(maestro),
    interaction: new InteractionTools(maestro),
    assertion: new AssertionTools(maestro),
    device: new DeviceTools(maestro),
    flow: new FlowTools(maestro),
    flutter: new FlutterTools(maestro),
  };

  // Check Maestro installation
  const maestroInstalled = await maestro.checkInstallation();
  if (!maestroInstalled) {
    console.error('Warning: Maestro CLI not found. Mobile/Flutter testing will not be available.');
    console.error('Install Maestro: curl -Ls "https://get.maestro.mobile.dev" | bash');
    console.error('Playwright web testing will still work.\n');
  }

  // Create unified server that wraps both
  const server = new Server(
    {
      name: 'unified-testing-mcp',
      version: packageJSON.version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Handle ListTools - merge Playwright and Maestro tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    // Get Playwright tools
    const playwrightTools = await playwrightConn.server.requestHandler(ListToolsRequestSchema, {});

    // Get Maestro tools
    const maestroToolsList = getMaestroTools();

    return {
      tools: [...playwrightTools.tools, ...maestroToolsList],
    };
  });

  // Handle CallTool - route to appropriate handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      // Route browser_* to Playwright
      if (name.startsWith('browser_')) {
        return await playwrightConn.server.requestHandler(CallToolRequestSchema, request);
      }

      // Route maestro_* to Maestro tools
      if (name.startsWith('maestro_')) {
        const result = await executeMaestroTool(name, args || {}, maestroTools);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      throw new Error(`Unknown tool: ${name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Unified Testing MCP server running (Playwright + Maestro)');
  console.error(`Playwright tools: browser_* (web automation)`);
  if (maestroInstalled) {
    console.error(`Maestro tools: maestro_* (mobile/Flutter automation)`);
  }
}

function getMaestroTools() {
  // Return the list of Maestro tools
  return [
    {
      name: 'maestro_launch_app',
      description: 'Launch a mobile app',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'App identifier (bundle ID for iOS, package name for Android)' },
          clearState: { type: 'boolean', description: 'Whether to clear app state before launching' },
        },
        required: ['appId'],
      },
    },
    {
      name: 'maestro_stop_app',
      description: 'Stop a running app',
      inputSchema: {
        type: 'object',
        properties: {
          appId: { type: 'string', description: 'App identifier to stop' },
        },
        required: ['appId'],
      },
    },
    {
      name: 'maestro_tap',
      description: 'Tap on an element',
      inputSchema: {
        type: 'object',
        properties: {
          element: { type: 'string', description: 'Element to tap (text, test ID, or selector)' },
        },
        required: ['element'],
      },
    },
    {
      name: 'maestro_scroll',
      description: 'Scroll in a direction',
      inputSchema: {
        type: 'object',
        properties: {
          direction: { type: 'string', enum: ['up', 'down', 'left', 'right'], description: 'Direction to scroll' },
        },
      },
    },
    {
      name: 'maestro_input_text',
      description: 'Input text into focused field',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'Text to input' },
        },
        required: ['text'],
      },
    },
    {
      name: 'maestro_assert_visible',
      description: 'Assert that an element is visible',
      inputSchema: {
        type: 'object',
        properties: {
          element: { type: 'string', description: 'Element that should be visible' },
        },
        required: ['element'],
      },
    },
    {
      name: 'maestro_screenshot',
      description: 'Take a screenshot',
      inputSchema: {
        type: 'object',
        properties: {
          outputPath: { type: 'string', description: 'Optional path to save screenshot' },
        },
      },
    },
    {
      name: 'maestro_flutter_tap_by_semantics',
      description: 'Tap on a Flutter widget by its semantics label',
      inputSchema: {
        type: 'object',
        properties: {
          label: { type: 'string', description: 'Semantics label of the Flutter widget' },
        },
        required: ['label'],
      },
    },
    {
      name: 'maestro_run_flow_content',
      description: 'Run a Maestro test flow from YAML content',
      inputSchema: {
        type: 'object',
        properties: {
          flowYAML: { type: 'string', description: 'YAML flow content' },
          env: { type: 'object', description: 'Environment variables for the flow' },
        },
        required: ['flowYAML'],
      },
    },
    {
      name: 'maestro_get_hierarchy',
      description: 'Get UI hierarchy (similar to accessibility snapshot)',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
  ];
}

async function executeMaestroTool(name, args, maestroTools) {
  switch (name) {
    case 'maestro_launch_app':
      return maestroTools.app.launchApp(args.appId, args.clearState);
    case 'maestro_stop_app':
      return maestroTools.app.stopApp(args.appId);
    case 'maestro_tap':
      return maestroTools.interaction.tapOn(args.element);
    case 'maestro_scroll':
      return maestroTools.interaction.scroll(args.direction);
    case 'maestro_input_text':
      return maestroTools.interaction.inputText(args.text);
    case 'maestro_assert_visible':
      return maestroTools.assertion.assertVisible(args.element);
    case 'maestro_screenshot':
      return maestroTools.device.takeScreenshot(args.outputPath);
    case 'maestro_flutter_tap_by_semantics':
      return maestroTools.flutter.tapBySemanticsLabel(args.label);
    case 'maestro_run_flow_content':
      return maestroTools.flow.runFlowContent(args.flowYAML, args.env);
    case 'maestro_get_hierarchy':
      return maestroTools.flow.getHierarchy();
    default:
      throw new Error(`Unknown Maestro tool: ${name}`);
  }
}

// Override the default action to start our unified server
program.action(async (options) => {
  const playwrightConfig = options; // Playwright options from decorateCommand
  const maestroConfig = {
    maestroPath: options.maestroPath,
    workingDirectory: options.workingDirectory,
    appId: options.appId,
    platform: options.platform,
  };

  await startUnifiedServer(playwrightConfig, maestroConfig);
});

void program.parseAsync(process.argv);
