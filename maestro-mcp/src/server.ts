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

import { MaestroClient } from './maestro';
import { MaestroConfig } from './types';
import {
  AppTools,
  InteractionTools,
  AssertionTools,
  DeviceTools,
  FlowTools,
} from './tools';
import { FlutterTools } from './tools/flutter';

export class MaestroMCPServer {
  private server: Server;
  private maestro: MaestroClient;
  private appTools: AppTools;
  private interactionTools: InteractionTools;
  private assertionTools: AssertionTools;
  private deviceTools: DeviceTools;
  private flowTools: FlowTools;
  private flutterTools: FlutterTools;

  constructor(config: MaestroConfig = {}) {
    this.maestro = new MaestroClient(config);
    this.appTools = new AppTools(this.maestro);
    this.interactionTools = new InteractionTools(this.maestro);
    this.assertionTools = new AssertionTools(this.maestro);
    this.deviceTools = new DeviceTools(this.maestro);
    this.flowTools = new FlowTools(this.maestro);
    this.flutterTools = new FlutterTools(this.maestro);

    this.server = new Server(
      {
        name: 'maestro-mcp',
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
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const result = await this.executeTool(name, args || {});
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
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

  private getTools(): Tool[] {
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

  private async executeTool(name: string, args: any): Promise<string> {
    switch (name) {
      // App tools
      case 'maestro_launch_app':
        return this.appTools.launchApp(args.appId, args.clearState);
      case 'maestro_stop_app':
        return this.appTools.stopApp(args.appId);
      case 'maestro_clear_state':
        return this.appTools.clearState(args.appId);
      case 'maestro_clear_keychain':
        return this.appTools.clearKeychain();

      // Interaction tools
      case 'maestro_tap':
        return this.interactionTools.tapOn(args.element);
      case 'maestro_double_tap':
        return this.interactionTools.doubleTapOn(args.element);
      case 'maestro_long_press':
        return this.interactionTools.longPressOn(args.element, args.duration);
      case 'maestro_scroll':
        return this.interactionTools.scroll(args.direction);
      case 'maestro_scroll_until_visible':
        return this.interactionTools.scrollUntilVisible(args.element, args.direction);
      case 'maestro_swipe':
        return this.interactionTools.swipe(args.direction, args.distance);
      case 'maestro_input_text':
        return this.interactionTools.inputText(args.text);
      case 'maestro_erase_text':
        return this.interactionTools.eraseText(args.characters);
      case 'maestro_hide_keyboard':
        return this.interactionTools.hideKeyboard();
      case 'maestro_press_key':
        return this.interactionTools.pressKey(args.key);
      case 'maestro_back':
        return this.interactionTools.back();

      // Assertion tools
      case 'maestro_assert_visible':
        return this.assertionTools.assertVisible(args.element);
      case 'maestro_assert_not_visible':
        return this.assertionTools.assertNotVisible(args.element);

      // Device tools
      case 'maestro_set_orientation':
        return this.deviceTools.setOrientation(args.orientation);
      case 'maestro_set_location':
        return this.deviceTools.setLocation(args.latitude, args.longitude);
      case 'maestro_set_airplane_mode':
        return this.deviceTools.setAirplaneMode(args.enabled);
      case 'maestro_screenshot':
        return this.deviceTools.takeScreenshot(args.outputPath);
      case 'maestro_start_recording':
        return this.deviceTools.startRecording(args.outputPath);
      case 'maestro_stop_recording':
        return this.deviceTools.stopRecording();

      // Flow tools
      case 'maestro_run_flow':
        return this.flowTools.runFlow(args.flowPath, args.env);
      case 'maestro_run_flow_content':
        return this.flowTools.runFlowContent(args.flowYAML, args.env);
      case 'maestro_get_hierarchy':
        return this.flowTools.getHierarchy();

      // Flutter tools
      case 'maestro_flutter_tap_by_semantics':
        return this.flutterTools.tapBySemanticsLabel(args.label);
      case 'maestro_flutter_tap_by_key':
        return this.flutterTools.tapByKey(args.key);
      case 'maestro_flutter_assert_widget_visible':
        return this.flutterTools.assertWidgetVisible(args.label);
      case 'maestro_flutter_input_to_field':
        return this.flutterTools.inputTextToField(args.fieldLabel, args.text);
      case 'maestro_flutter_scroll_to_widget':
        return this.flutterTools.scrollToWidget(args.label, args.direction);
      case 'maestro_flutter_get_testing_tips':
        return this.flutterTools.getFlutterTestingTips();

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  async run() {
    // Check Maestro installation
    const isInstalled = await this.maestro.checkInstallation();
    if (!isInstalled) {
      console.error('Error: Maestro CLI not found. Please install Maestro:');
      console.error('  curl -Ls "https://get.maestro.mobile.dev" | bash');
      process.exit(1);
    }

    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Maestro MCP server running on stdio');
  }
}

export async function createConnection(config?: MaestroConfig) {
  const server = new MaestroMCPServer(config);
  return server;
}
