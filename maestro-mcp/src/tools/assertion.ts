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
import { MaestroElement } from '../types';

/**
 * Assertion tools
 */
export class AssertionTools {
  constructor(private maestro: MaestroClient) {}

  private serializeElement(element: string | MaestroElement): string {
    if (typeof element === 'string') {
      return `"${element}"`;
    }

    if (element.text) {
      return `"${element.text}"`;
    }

    if (element.id) {
      return `{id: "${element.id}"}`;
    }

    return JSON.stringify(element);
  }

  async assertVisible(element: string | MaestroElement): Promise<string> {
    const elementStr = this.serializeElement(element);
    const flow = `---\n- assertVisible: ${elementStr}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Assertion failed - element not visible: ${result.error || result.output}`);
    }

    return `✓ Element ${elementStr} is visible`;
  }

  async assertNotVisible(element: string | MaestroElement): Promise<string> {
    const elementStr = this.serializeElement(element);
    const flow = `---\n- assertNotVisible: ${elementStr}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Assertion failed - element is visible: ${result.error || result.output}`);
    }

    return `✓ Element ${elementStr} is not visible`;
  }

  async assertTrue(condition: string, timeout?: number): Promise<string> {
    const command = timeout
      ? `- assertTrue:\n    condition: ${condition}\n    timeout: ${timeout}`
      : `- assertTrue: ${condition}`;
    const flow = `---\n${command}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Assertion failed - condition is false: ${result.error || result.output}`);
    }

    return `✓ Condition ${condition} is true`;
  }
}
