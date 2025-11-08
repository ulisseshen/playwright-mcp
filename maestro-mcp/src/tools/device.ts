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
 * Device control tools
 */
export class DeviceTools {
  constructor(private maestro: MaestroClient) {}

  async setOrientation(orientation: 'portrait' | 'landscape'): Promise<string> {
    const flow = `---\n- setOrientation: ${orientation}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to set orientation: ${result.error || result.output}`);
    }

    return `Orientation set to ${orientation}`;
  }

  async setLocation(latitude: number, longitude: number): Promise<string> {
    const flow = `---\n- setLocation:\n    latitude: ${latitude}\n    longitude: ${longitude}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to set location: ${result.error || result.output}`);
    }

    return `Location set to ${latitude}, ${longitude}`;
  }

  async setAirplaneMode(enabled: boolean): Promise<string> {
    const flow = enabled
      ? `---\n- setAirplaneMode: true`
      : `---\n- setAirplaneMode: false`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to set airplane mode: ${result.error || result.output}`);
    }

    return `Airplane mode ${enabled ? 'enabled' : 'disabled'}`;
  }

  async takeScreenshot(outputPath?: string): Promise<string> {
    const result = await this.maestro.screenshot(outputPath);

    if (!result.success) {
      throw new Error(`Failed to take screenshot: ${result.error || result.output}`);
    }

    return outputPath
      ? `Screenshot saved to ${outputPath}`
      : `Screenshot taken:\n${result.output}`;
  }

  async startRecording(outputPath: string): Promise<string> {
    const flow = `---\n- startRecording: ${outputPath}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to start recording: ${result.error || result.output}`);
    }

    return `Recording started, will be saved to ${outputPath}`;
  }

  async stopRecording(): Promise<string> {
    const flow = `---\n- stopRecording`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to stop recording: ${result.error || result.output}`);
    }

    return 'Recording stopped';
  }
}
