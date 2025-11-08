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
 * Flow execution tools
 */
export class FlowTools {
  constructor(private maestro: MaestroClient) {}

  async runFlow(flowPath: string, env?: Record<string, string>): Promise<string> {
    const result = await this.maestro.runFlow(flowPath, env);

    if (!result.success) {
      throw new Error(`Flow execution failed: ${result.error || result.output}`);
    }

    return `Flow executed successfully:\n${result.output}`;
  }

  async runFlowContent(flowYAML: string, env?: Record<string, string>): Promise<string> {
    const result = await this.maestro.runFlowContent(flowYAML, env);

    if (!result.success) {
      throw new Error(`Flow execution failed: ${result.error || result.output}`);
    }

    return `Flow executed successfully:\n${result.output}`;
  }

  async getHierarchy(): Promise<string> {
    try {
      const hierarchy = await this.maestro.getHierarchy();
      return `UI Hierarchy:\n\`\`\`\n${hierarchy}\n\`\`\``;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to get UI hierarchy: ${error.message}`);
      }
      throw error;
    }
  }
}
