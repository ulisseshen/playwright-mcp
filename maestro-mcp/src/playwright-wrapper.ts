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

/**
 * Playwright MCP Wrapper
 *
 * This module provides access to Playwright's built-in MCP capabilities
 * by importing from playwright/lib/mcp/index
 */

// Re-export Playwright's MCP createConnection
export { createConnection as createPlaywrightConnection } from 'playwright/lib/mcp/index';
