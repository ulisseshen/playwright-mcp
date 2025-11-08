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

import { MaestroMCPServer } from './server';
import { MaestroConfig } from './types';

async function main() {
  const args = process.argv.slice(2);
  const config: MaestroConfig = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--maestro-path' && i + 1 < args.length) {
      config.maestroPath = args[++i];
    } else if (arg === '--working-directory' && i + 1 < args.length) {
      config.workingDirectory = args[++i];
    } else if (arg === '--app-id' && i + 1 < args.length) {
      config.appId = args[++i];
    } else if (arg === '--platform' && i + 1 < args.length) {
      config.platform = args[++i];
    } else if (arg === '--host' && i + 1 < args.length) {
      config.host = args[++i];
    } else if (arg === '--port' && i + 1 < args.length) {
      config.port = parseInt(args[++i], 10);
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
Maestro MCP Server

Usage: mcp-server-maestro [options]

Options:
  --maestro-path <path>        Path to maestro CLI binary
  --working-directory <path>   Working directory for maestro commands
  --app-id <id>               Default app identifier
  --platform <platform>        Platform (iOS/Android) or device ID
  --host <host>               Host for server mode
  --port <port>               Port for server mode
  --help, -h                  Show this help message

For more information, visit: https://maestro.mobile.dev
`);
      process.exit(0);
    }
  }

  const server = new MaestroMCPServer(config);
  await server.run();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
