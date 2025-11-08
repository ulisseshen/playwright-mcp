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

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

// Import Playwright's MCP server
import { createConnection as createPlaywrightConnection } from 'playwright/lib/mcp/index';

import { MaestroClient } from './maestro';
import { MaestroConfig } from './types';
import {
  AppTools,
  InteractionTools,
  AssertionTools,
  DeviceTools,
  FlowTools,
  FlutterTools,
} from './tools';

/**
 * Unified MCP Server that combines Playwright (web) and Maestro (mobile/Flutter) capabilities
 */
export class UnifiedMCPServer {
  private server: Server;
  private maestro: MaestroClient;
  private playwrightConnection: any;
  private maestroTools: {
    app: AppTools;
    interaction: InteractionTools;
    assertion: AssertionTools;
    device: DeviceTools;
    flow: FlowTools;
    flutter: FlutterTools;
  };

  constructor(config: MaestroConfig = {}) {
    this.maestro = new MaestroClient(config);
    this.maestroTools = {
      app: new AppTools(this.maestro),
      interaction: new InteractionTools(this.maestro),
      assertion: new AssertionTools(this.maestro),
      device: new DeviceTools(this.maestro),
      flow: new FlowTools(this.maestro),
      flutter: new FlutterTools(this.maestro),
    };

    this.server = new Server(
      {
        name: 'unified-testing-mcp',
        version: '0.0.1',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const playwrightTools = await this.getPlaywrightTools();
      const maestroTools = this.getMaestroTools();

      return {
        tools: [...playwrightTools, ...maestroTools],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Route to Playwright for browser_ tools
        if (name.startsWith('browser_')) {
          return await this.executePlaywrightTool(name, args || {});
        }

        // Route to Maestro for maestro_ tools
        if (name.startsWith('maestro_')) {
          const result = await this.executeMaestroTool(name, args || {});
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
  }

  private async getPlaywrightTools(): Promise<Tool[]> {
    // Playwright tools will be provided by Playwright's MCP implementation
    // We'll delegate to the actual Playwright MCP when it's connected
    // For now, return empty array - Playwright tools will be added dynamically
    return [];
  }

  private async executePlaywrightTool(name: string, args: any): Promise<any> {
    // This will be delegated to Playwright's MCP implementation
    throw new Error(`Playwright tool ${name} not yet connected. Starting browser...`);
  }

  private getMaestroTools(): Tool[] {
    return [
      // App lifecycle tools
      {
        name: 'maestro_launch_app',
        description: 'Launch a mobile app',
        inputSchema: {
          type: 'object',
          properties: {
            appId: {
              type: 'string',
              description: 'App identifier (bundle ID for iOS, package name for Android)',
            },
            clearState: {
              type: 'boolean',
              description: 'Whether to clear app state before launching',
            },
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
            appId: {
              type: 'string',
              description: 'App identifier to stop',
            },
          },
          required: ['appId'],
        },
      },
      {
        name: 'maestro_clear_state',
        description: 'Clear app state/data',
        inputSchema: {
          type: 'object',
          properties: {
            appId: {
              type: 'string',
              description: 'App identifier',
            },
          },
          required: ['appId'],
        },
      },
      {
        name: 'maestro_clear_keychain',
        description: 'Clear iOS keychain',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      // Interaction tools
      {
        name: 'maestro_tap',
        description: 'Tap on an element',
        inputSchema: {
          type: 'object',
          properties: {
            element: {
              type: 'string',
              description: 'Element to tap (text, test ID, or selector)',
            },
          },
          required: ['element'],
        },
      },
      {
        name: 'maestro_double_tap',
        description: 'Double tap on an element',
        inputSchema: {
          type: 'object',
          properties: {
            element: {
              type: 'string',
              description: 'Element to double tap',
            },
          },
          required: ['element'],
        },
      },
      {
        name: 'maestro_long_press',
        description: 'Long press on an element',
        inputSchema: {
          type: 'object',
          properties: {
            element: {
              type: 'string',
              description: 'Element to long press',
            },
            duration: {
              type: 'number',
              description: 'Duration of long press in milliseconds',
            },
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
            direction: {
              type: 'string',
              enum: ['up', 'down', 'left', 'right'],
              description: 'Direction to scroll',
            },
          },
        },
      },
      {
        name: 'maestro_scroll_until_visible',
        description: 'Scroll until an element is visible',
        inputSchema: {
          type: 'object',
          properties: {
            element: {
              type: 'string',
              description: 'Element to scroll to',
            },
            direction: {
              type: 'string',
              enum: ['up', 'down'],
              description: 'Direction to scroll',
            },
          },
          required: ['element'],
        },
      },
      {
        name: 'maestro_swipe',
        description: 'Swipe in a direction',
        inputSchema: {
          type: 'object',
          properties: {
            direction: {
              type: 'string',
              enum: ['up', 'down', 'left', 'right'],
              description: 'Direction to swipe',
            },
            distance: {
              type: 'number',
              description: 'Swipe distance percentage (0-100)',
            },
          },
          required: ['direction'],
        },
      },
      {
        name: 'maestro_input_text',
        description: 'Input text into focused field',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to input',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'maestro_erase_text',
        description: 'Erase text from focused field',
        inputSchema: {
          type: 'object',
          properties: {
            characters: {
              type: 'number',
              description: 'Number of characters to erase (default: all)',
            },
          },
        },
      },
      {
        name: 'maestro_hide_keyboard',
        description: 'Hide the keyboard',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'maestro_press_key',
        description: 'Press a key (e.g., enter, backspace, home)',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Key to press (enter, backspace, home, etc.)',
            },
          },
          required: ['key'],
        },
      },
      {
        name: 'maestro_back',
        description: 'Press the back button (Android)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      // Assertion tools
      {
        name: 'maestro_assert_visible',
        description: 'Assert that an element is visible',
        inputSchema: {
          type: 'object',
          properties: {
            element: {
              type: 'string',
              description: 'Element that should be visible',
            },
          },
          required: ['element'],
        },
      },
      {
        name: 'maestro_assert_not_visible',
        description: 'Assert that an element is not visible',
        inputSchema: {
          type: 'object',
          properties: {
            element: {
              type: 'string',
              description: 'Element that should not be visible',
            },
          },
          required: ['element'],
        },
      },
      // Device tools
      {
        name: 'maestro_set_orientation',
        description: 'Set device orientation',
        inputSchema: {
          type: 'object',
          properties: {
            orientation: {
              type: 'string',
              enum: ['portrait', 'landscape'],
              description: 'Device orientation',
            },
          },
          required: ['orientation'],
        },
      },
      {
        name: 'maestro_set_location',
        description: 'Set device GPS location',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'number',
              description: 'Latitude coordinate',
            },
            longitude: {
              type: 'number',
              description: 'Longitude coordinate',
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
      {
        name: 'maestro_set_airplane_mode',
        description: 'Enable or disable airplane mode',
        inputSchema: {
          type: 'object',
          properties: {
            enabled: {
              type: 'boolean',
              description: 'Whether to enable airplane mode',
            },
          },
          required: ['enabled'],
        },
      },
      {
        name: 'maestro_screenshot',
        description: 'Take a screenshot',
        inputSchema: {
          type: 'object',
          properties: {
            outputPath: {
              type: 'string',
              description: 'Optional path to save screenshot',
            },
          },
        },
      },
      {
        name: 'maestro_start_recording',
        description: 'Start video recording',
        inputSchema: {
          type: 'object',
          properties: {
            outputPath: {
              type: 'string',
              description: 'Path to save video recording',
            },
          },
          required: ['outputPath'],
        },
      },
      {
        name: 'maestro_stop_recording',
        description: 'Stop video recording',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      // Flow tools
      {
        name: 'maestro_run_flow',
        description: 'Run a Maestro test flow from a YAML file',
        inputSchema: {
          type: 'object',
          properties: {
            flowPath: {
              type: 'string',
              description: 'Path to YAML flow file',
            },
            env: {
              type: 'object',
              description: 'Environment variables for the flow',
            },
          },
          required: ['flowPath'],
        },
      },
      {
        name: 'maestro_run_flow_content',
        description: 'Run a Maestro test flow from YAML content',
        inputSchema: {
          type: 'object',
          properties: {
            flowYAML: {
              type: 'string',
              description: 'YAML flow content',
            },
            env: {
              type: 'object',
              description: 'Environment variables for the flow',
            },
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
      // Flutter-specific tools
      {
        name: 'maestro_flutter_tap_by_semantics',
        description: 'Tap on a Flutter widget by its semantics label',
        inputSchema: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Semantics label of the Flutter widget',
            },
          },
          required: ['label'],
        },
      },
      {
        name: 'maestro_flutter_tap_by_key',
        description: 'Tap on a Flutter widget by its Key',
        inputSchema: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'Key of the Flutter widget',
            },
          },
          required: ['key'],
        },
      },
      {
        name: 'maestro_flutter_assert_widget_visible',
        description: 'Assert a Flutter widget is visible by its semantics label',
        inputSchema: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Semantics label of the Flutter widget',
            },
          },
          required: ['label'],
        },
      },
      {
        name: 'maestro_flutter_input_to_field',
        description: 'Input text into a Flutter TextField',
        inputSchema: {
          type: 'object',
          properties: {
            fieldLabel: {
              type: 'string',
              description: 'Label of the Flutter TextField',
            },
            text: {
              type: 'string',
              description: 'Text to input',
            },
          },
          required: ['fieldLabel', 'text'],
        },
      },
      {
        name: 'maestro_flutter_scroll_to_widget',
        description: 'Scroll to a Flutter widget with specific semantics',
        inputSchema: {
          type: 'object',
          properties: {
            label: {
              type: 'string',
              description: 'Semantics label of the Flutter widget',
            },
            direction: {
              type: 'string',
              enum: ['up', 'down'],
              description: 'Direction to scroll',
            },
          },
          required: ['label'],
        },
      },
      {
        name: 'maestro_flutter_get_testing_tips',
        description: 'Get Flutter testing tips and best practices',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  private async executeMaestroTool(name: string, args: any): Promise<string> {
    switch (name) {
      // App tools
      case 'maestro_launch_app':
        return this.maestroTools.app.launchApp(args.appId, args.clearState);
      case 'maestro_stop_app':
        return this.maestroTools.app.stopApp(args.appId);
      case 'maestro_clear_state':
        return this.maestroTools.app.clearState(args.appId);
      case 'maestro_clear_keychain':
        return this.maestroTools.app.clearKeychain();

      // Interaction tools
      case 'maestro_tap':
        return this.maestroTools.interaction.tapOn(args.element);
      case 'maestro_double_tap':
        return this.maestroTools.interaction.doubleTapOn(args.element);
      case 'maestro_long_press':
        return this.maestroTools.interaction.longPressOn(args.element, args.duration);
      case 'maestro_scroll':
        return this.maestroTools.interaction.scroll(args.direction);
      case 'maestro_scroll_until_visible':
        return this.maestroTools.interaction.scrollUntilVisible(args.element, args.direction);
      case 'maestro_swipe':
        return this.maestroTools.interaction.swipe(args.direction, args.distance);
      case 'maestro_input_text':
        return this.maestroTools.interaction.inputText(args.text);
      case 'maestro_erase_text':
        return this.maestroTools.interaction.eraseText(args.characters);
      case 'maestro_hide_keyboard':
        return this.maestroTools.interaction.hideKeyboard();
      case 'maestro_press_key':
        return this.maestroTools.interaction.pressKey(args.key);
      case 'maestro_back':
        return this.maestroTools.interaction.back();

      // Assertion tools
      case 'maestro_assert_visible':
        return this.maestroTools.assertion.assertVisible(args.element);
      case 'maestro_assert_not_visible':
        return this.maestroTools.assertion.assertNotVisible(args.element);

      // Device tools
      case 'maestro_set_orientation':
        return this.maestroTools.device.setOrientation(args.orientation);
      case 'maestro_set_location':
        return this.maestroTools.device.setLocation(args.latitude, args.longitude);
      case 'maestro_set_airplane_mode':
        return this.maestroTools.device.setAirplaneMode(args.enabled);
      case 'maestro_screenshot':
        return this.maestroTools.device.takeScreenshot(args.outputPath);
      case 'maestro_start_recording':
        return this.maestroTools.device.startRecording(args.outputPath);
      case 'maestro_stop_recording':
        return this.maestroTools.device.stopRecording();

      // Flow tools
      case 'maestro_run_flow':
        return this.maestroTools.flow.runFlow(args.flowPath, args.env);
      case 'maestro_run_flow_content':
        return this.maestroTools.flow.runFlowContent(args.flowYAML, args.env);
      case 'maestro_get_hierarchy':
        return this.maestroTools.flow.getHierarchy();

      // Flutter tools
      case 'maestro_flutter_tap_by_semantics':
        return this.maestroTools.flutter.tapBySemanticsLabel(args.label);
      case 'maestro_flutter_tap_by_key':
        return this.maestroTools.flutter.tapByKey(args.key);
      case 'maestro_flutter_assert_widget_visible':
        return this.maestroTools.flutter.assertWidgetVisible(args.label);
      case 'maestro_flutter_input_to_field':
        return this.maestroTools.flutter.inputTextToField(args.fieldLabel, args.text);
      case 'maestro_flutter_scroll_to_widget':
        return this.maestroTools.flutter.scrollToWidget(args.label, args.direction);
      case 'maestro_flutter_get_testing_tips':
        return this.maestroTools.flutter.getFlutterTestingTips();

      default:
        throw new Error(`Unknown Maestro tool: ${name}`);
    }
  }

  async run() {
    // Check Maestro installation
    const isInstalled = await this.maestro.checkInstallation();
    if (!isInstalled) {
      console.error('Warning: Maestro CLI not found. Mobile/Flutter testing will not be available.');
      console.error('Install Maestro: curl -Ls "https://get.maestro.mobile.dev" | bash');
      console.error('Playwright web testing will still work.\n');
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Unified Testing MCP server running (Playwright + Maestro)');
  }
}

export async function createConnection(config?: MaestroConfig) {
  const server = new UnifiedMCPServer(config);
  return server;
}
