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
 * Interaction tools for tap, scroll, swipe, etc.
 */
export class InteractionTools {
  constructor(private maestro: MaestroClient) {}

  private serializeElement(element: string | { text?: string; id?: string; index?: number }): string {
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

  async tapOn(element: string | MaestroElement): Promise<string> {
    const elementStr = this.serializeElement(element);
    const flow = `---\n- tapOn: ${elementStr}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to tap on element: ${result.error || result.output}`);
    }

    return `Tapped on ${elementStr}`;
  }

  async doubleTapOn(element: string | MaestroElement): Promise<string> {
    const elementStr = this.serializeElement(element);
    const flow = `---\n- doubleTapOn: ${elementStr}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to double tap on element: ${result.error || result.output}`);
    }

    return `Double tapped on ${elementStr}`;
  }

  async longPressOn(element: string | MaestroElement, duration?: number): Promise<string> {
    const elementStr = this.serializeElement(element);
    const command = duration
      ? `- longPressOn:\n    element: ${elementStr}\n    duration: ${duration}`
      : `- longPressOn: ${elementStr}`;
    const flow = `---\n${command}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to long press on element: ${result.error || result.output}`);
    }

    return `Long pressed on ${elementStr}`;
  }

  async scroll(direction?: 'up' | 'down' | 'left' | 'right'): Promise<string> {
    const command = direction
      ? `- scroll:\n    direction: ${direction}`
      : `- scroll`;
    const flow = `---\n${command}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to scroll: ${result.error || result.output}`);
    }

    return `Scrolled ${direction || 'down'}`;
  }

  async scrollUntilVisible(element: string | MaestroElement, direction?: 'up' | 'down'): Promise<string> {
    const elementStr = this.serializeElement(element);
    const command = direction
      ? `- scrollUntilVisible:\n    element: ${elementStr}\n    direction: ${direction}`
      : `- scrollUntilVisible:\n    element: ${elementStr}`;
    const flow = `---\n${command}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to scroll until visible: ${result.error || result.output}`);
    }

    return `Scrolled until ${elementStr} is visible`;
  }

  async swipe(direction: 'up' | 'down' | 'left' | 'right', distance?: number): Promise<string> {
    const command = distance
      ? `- swipe:\n    direction: ${direction}\n    distance: ${distance}`
      : `- swipe:\n    direction: ${direction}`;
    const flow = `---\n${command}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to swipe: ${result.error || result.output}`);
    }

    return `Swiped ${direction}`;
  }

  async inputText(text: string): Promise<string> {
    const flow = `---\n- inputText: "${text}"`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to input text: ${result.error || result.output}`);
    }

    return `Entered text: ${text}`;
  }

  async eraseText(charactersToErase?: number): Promise<string> {
    const command = charactersToErase
      ? `- eraseText: ${charactersToErase}`
      : `- eraseText`;
    const flow = `---\n${command}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to erase text: ${result.error || result.output}`);
    }

    return `Erased ${charactersToErase || 'all'} characters`;
  }

  async hideKeyboard(): Promise<string> {
    const flow = `---\n- hideKeyboard`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to hide keyboard: ${result.error || result.output}`);
    }

    return 'Keyboard hidden';
  }

  async pressKey(key: string): Promise<string> {
    const flow = `---\n- pressKey: ${key}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to press key: ${result.error || result.output}`);
    }

    return `Pressed key: ${key}`;
  }

  async back(): Promise<string> {
    const flow = `---\n- back`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to go back: ${result.error || result.output}`);
    }

    return 'Went back';
  }
}
