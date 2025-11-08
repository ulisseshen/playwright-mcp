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

import { MaestroClient } from '../maestro';

/**
 * App lifecycle tools
 */
export class AppTools {
  constructor(private maestro: MaestroClient) {}

  async launchApp(appId: string, clearState?: boolean): Promise<string> {
    const commands = [];

    if (clearState) {
      commands.push(`- clearState: ${appId}`);
    }

    commands.push(`- launchApp: ${appId}`);

    const flow = `appId: ${appId}\n---\n${commands.join('\n')}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to launch app: ${result.error || result.output}`);
    }

    return `App ${appId} launched successfully`;
  }

  async stopApp(appId: string): Promise<string> {
    const flow = `appId: ${appId}\n---\n- stopApp: ${appId}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to stop app: ${result.error || result.output}`);
    }

    return `App ${appId} stopped successfully`;
  }

  async clearState(appId: string): Promise<string> {
    const flow = `appId: ${appId}\n---\n- clearState: ${appId}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to clear app state: ${result.error || result.output}`);
    }

    return `App ${appId} state cleared successfully`;
  }

  async clearKeychain(): Promise<string> {
    const flow = `---\n- clearKeychain`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to clear keychain: ${result.error || result.output}`);
    }

    return 'Keychain cleared successfully';
  }
}
