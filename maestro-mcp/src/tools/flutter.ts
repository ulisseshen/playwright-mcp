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
 * Flutter-specific tools
 *
 * Maestro has first-class support for Flutter apps via the AccessibilityBridge.
 * These tools help with Flutter-specific testing patterns.
 */
export class FlutterTools {
  constructor(private maestro: MaestroClient) {}

  /**
   * Tap on a Flutter widget by its semantics label
   */
  async tapBySemanticsLabel(label: string): Promise<string> {
    const flow = `---\n- tapOn:\n    id: "${label}"`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to tap on Flutter widget: ${result.error || result.output}`);
    }

    return `Tapped on Flutter widget with semantics label: ${label}`;
  }

  /**
   * Tap on a Flutter widget by its Key
   */
  async tapByKey(key: string): Promise<string> {
    const flow = `---\n- tapOn:\n    id: "${key}"`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to tap on Flutter widget: ${result.error || result.output}`);
    }

    return `Tapped on Flutter widget with key: ${key}`;
  }

  /**
   * Assert a Flutter widget is visible by its semantics label
   */
  async assertWidgetVisible(label: string): Promise<string> {
    const flow = `---\n- assertVisible:\n    id: "${label}"`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Assertion failed - Flutter widget not visible: ${result.error || result.output}`);
    }

    return `✓ Flutter widget with label "${label}" is visible`;
  }

  /**
   * Input text into a Flutter TextField
   */
  async inputTextToField(fieldLabel: string, text: string): Promise<string> {
    const flow = `---\n- tapOn:\n    id: "${fieldLabel}"\n- inputText: "${text}"`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to input text to Flutter field: ${result.error || result.output}`);
    }

    return `Entered "${text}" into Flutter TextField with label: ${fieldLabel}`;
  }

  /**
   * Scroll to a Flutter widget with specific semantics
   */
  async scrollToWidget(label: string, direction?: 'up' | 'down'): Promise<string> {
    const command = direction
      ? `- scrollUntilVisible:\n    element:\n      id: "${label}"\n    direction: ${direction}`
      : `- scrollUntilVisible:\n    element:\n      id: "${label}"`;
    const flow = `---\n${command}`;
    const result = await this.maestro.runFlowContent(flow);

    if (!result.success) {
      throw new Error(`Failed to scroll to Flutter widget: ${result.error || result.output}`);
    }

    return `Scrolled to Flutter widget with label: ${label}`;
  }

  /**
   * Get Flutter testing tips and best practices
   */
  getFlutterTestingTips(): string {
    return `
# Flutter Testing with Maestro

## Best Practices

### 1. Use Semantics Labels
Always add semantics labels to your Flutter widgets for testing:

\`\`\`dart
Semantics(
  label: 'login-button',
  child: ElevatedButton(
    onPressed: () {},
    child: Text('Login'),
  ),
)
\`\`\`

### 2. Use Keys for Unique Widgets
For widgets that need unique identification:

\`\`\`dart
TextField(
  key: Key('email-input'),
  decoration: InputDecoration(labelText: 'Email'),
)
\`\`\`

### 3. Test IDs (data-testid equivalent)
Flutter widgets with text automatically have accessibility info:

\`\`\`dart
Text('Welcome')  // Can be found by "Welcome"
TextField(hintText: 'Email')  // Can be found by "Email"
\`\`\`

### 4. Complex Widget Identification
Use relative positioning when needed:

\`\`\`yaml
- tapOn:
    text: "Submit"
    below:
      text: "Terms and Conditions"
\`\`\`

## Flutter Web Considerations

For Flutter Web apps, Maestro can test them in browsers, but you may also want to use
the Playwright MCP for enhanced web-specific capabilities.

Enable Flutter semantics for web debugging:
\`\`\`bash
flutter run -d chrome --profile --dart-define=FLUTTER_WEB_DEBUG_SHOW_SEMANTICS=true
\`\`\`

## Common Flutter Testing Patterns

### Login Flow
\`\`\`yaml
appId: com.example.app
---
- launchApp
- tapOn:
    id: "email-field"
- inputText: "test@example.com"
- tapOn:
    id: "password-field"
- inputText: "password123"
- tapOn: "Login"
- assertVisible: "Welcome"
\`\`\`

### List Scrolling
\`\`\`yaml
- scrollUntilVisible:
    element:
      text: "Item 50"
- tapOn: "Item 50"
\`\`\`

### Form Validation
\`\`\`yaml
- tapOn: "Submit"
- assertVisible: "Email is required"
\`\`\`
`;
  }
}
