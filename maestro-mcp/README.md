# Maestro MCP Server

A Model Context Protocol (MCP) server that provides mobile and Flutter app automation capabilities using [Maestro](https://maestro.mobile.dev). This server enables LLMs to interact with mobile apps through Maestro's accessibility-based automation.

## Overview

This Maestro MCP server is built following the same patterns as the [Playwright MCP](../README.md), but designed for mobile and Flutter app testing instead of web browser automation.

### Key Features

- **Cross-platform**: Works with iOS, Android, and Flutter apps
- **Flutter-first**: First-class support for Flutter apps via AccessibilityBridge
- **LLM-friendly**: Accessibility-based automation, no vision models needed
- **YAML flows**: Support for Maestro's declarative YAML test flows
- **Deterministic**: Avoids flakiness with built-in waiting and synchronization

## Prerequisites

1. **Node.js 18 or newer**
2. **Maestro CLI** - Install with:
   ```bash
   curl -Ls "https://get.maestro.mobile.dev" | bash
   ```

3. **For iOS testing** - Install Facebook IDB:
   ```bash
   brew tap facebook/fb
   brew install facebook/fb/idb-companion
   ```

4. **Mobile device or emulator/simulator**
   - iOS: Xcode with Simulator
   - Android: Android Studio with emulator or physical device

## Installation

### From npm (once published)

```bash
npm install -g @maestro/mcp
```

### From source

```bash
cd maestro-mcp
npm install
npm run build
```

## Usage

### As MCP Server

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "maestro": {
      "command": "npx",
      "args": ["@maestro/mcp@latest"]
    }
  }
}
```

### Configuration Options

```bash
mcp-server-maestro [options]

Options:
  --maestro-path <path>        Path to maestro CLI binary
  --working-directory <path>   Working directory for maestro commands
  --app-id <id>               Default app identifier
  --platform <platform>        Platform (iOS/Android) or device ID
  --host <host>               Host for server mode
  --port <port>               Port for server mode
  --help, -h                  Show help message
```

## Available Tools

### App Lifecycle

- **maestro_launch_app** - Launch a mobile app
- **maestro_stop_app** - Stop a running app
- **maestro_clear_state** - Clear app state/data
- **maestro_clear_keychain** - Clear iOS keychain

### Interactions

- **maestro_tap** - Tap on an element
- **maestro_double_tap** - Double tap on an element
- **maestro_long_press** - Long press on an element
- **maestro_scroll** - Scroll in a direction
- **maestro_scroll_until_visible** - Scroll until element is visible
- **maestro_swipe** - Swipe gesture
- **maestro_input_text** - Input text into focused field
- **maestro_erase_text** - Erase text from focused field
- **maestro_hide_keyboard** - Hide the keyboard
- **maestro_press_key** - Press a key (enter, backspace, home)
- **maestro_back** - Press the back button (Android)

### Assertions

- **maestro_assert_visible** - Assert element is visible
- **maestro_assert_not_visible** - Assert element is not visible

### Device Control

- **maestro_set_orientation** - Set device orientation
- **maestro_set_location** - Set GPS location
- **maestro_set_airplane_mode** - Enable/disable airplane mode
- **maestro_screenshot** - Take a screenshot
- **maestro_start_recording** - Start video recording
- **maestro_stop_recording** - Stop video recording

### Flow Execution

- **maestro_run_flow** - Run a Maestro YAML flow file
- **maestro_run_flow_content** - Run YAML flow from content
- **maestro_get_hierarchy** - Get UI hierarchy

## Flutter Support

Maestro has excellent Flutter support via Flutter's AccessibilityBridge. Here's how to make your Flutter app testable:

### Add Semantics Labels

```dart
import 'package:flutter/material.dart';

Semantics(
  label: 'login-button',
  child: ElevatedButton(
    onPressed: _handleLogin,
    child: Text('Login'),
  ),
)
```

### Use Keys

```dart
TextField(
  key: Key('email-input'),
  decoration: InputDecoration(labelText: 'Email'),
)
```

### Example Flutter Test Flow

```yaml
appId: com.example.myapp
---
- launchApp
- tapOn:
    id: "email-input"
- inputText: "user@example.com"
- tapOn:
    id: "password-input"
- inputText: "password123"
- tapOn: "Login"
- assertVisible: "Welcome Back!"
```

## Flutter Web Testing

For Flutter Web apps, you have two options:

1. **Use Maestro MCP** (this server) - Tests the app in a browser
2. **Use Playwright MCP** - Enhanced web-specific capabilities

For best results with Flutter Web, enable semantics debugging:

```bash
flutter run -d chrome --profile --dart-define=FLUTTER_WEB_DEBUG_SHOW_SEMANTICS=true
```

## Examples

### Launch and Test an App

```javascript
// Launch app
await client.callTool({
  name: 'maestro_launch_app',
  arguments: { appId: 'com.example.myapp' }
});

// Tap login button
await client.callTool({
  name: 'maestro_tap',
  arguments: { element: 'Login' }
});

// Assert success
await client.callTool({
  name: 'maestro_assert_visible',
  arguments: { element: 'Welcome' }
});
```

### Run a Complete Flow

```javascript
const flowYAML = `
appId: com.example.myapp
---
- launchApp
- tapOn: "Get Started"
- inputText: "John Doe"
- tapOn: "Submit"
- assertVisible: "Thank you"
`;

await client.callTool({
  name: 'maestro_run_flow_content',
  arguments: { flowYAML }
});
```

### Scroll and Tap

```javascript
// Scroll until element is visible
await client.callTool({
  name: 'maestro_scroll_until_visible',
  arguments: {
    element: 'Item 50',
    direction: 'down'
  }
});

// Tap the element
await client.callTool({
  name: 'maestro_tap',
  arguments: { element: 'Item 50' }
});
```

## Architecture

This MCP server wraps the Maestro CLI and exposes its capabilities as MCP tools:

```
maestro-mcp/
├── src/
│   ├── server.ts          # Main MCP server
│   ├── maestro.ts         # Maestro CLI wrapper
│   ├── types.ts           # TypeScript types
│   ├── tools/
│   │   ├── app.ts         # App lifecycle tools
│   │   ├── interaction.ts # Interaction tools
│   │   ├── assertion.ts   # Assertion tools
│   │   ├── device.ts      # Device control tools
│   │   ├── flow.ts        # Flow execution tools
│   │   └── flutter.ts     # Flutter-specific tools
│   ├── cli.ts             # CLI entry point
│   └── index.ts           # Exports
└── package.json
```

## Comparison: Maestro MCP vs Playwright MCP

| Feature | Maestro MCP | Playwright MCP |
|---------|-------------|----------------|
| **Target** | Mobile & Flutter apps | Web browsers |
| **Platforms** | iOS, Android, Flutter | Chromium, Firefox, WebKit |
| **Best for** | Native mobile, Flutter | Web apps, Flutter Web |
| **Automation basis** | Accessibility tree | Accessibility tree + DOM |
| **Test format** | YAML flows + MCP tools | MCP tools |
| **Cross-platform** | iOS + Android + Web | Web only |

## Complementary Use

You can use **both** MCPs together:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "maestro": {
      "command": "npx",
      "args": ["@maestro/mcp@latest"]
    }
  }
}
```

- Use **Playwright MCP** for web and Flutter Web testing
- Use **Maestro MCP** for native mobile and Flutter mobile/desktop testing

## Resources

- [Maestro Documentation](https://maestro.mobile.dev)
- [Flutter Testing Guide](https://docs.flutter.dev/testing)
- [MCP Documentation](https://modelcontextprotocol.io)
- [Playwright MCP](../README.md)

## Contributing

This project welcomes contributions. Please follow the same guidelines as the parent [playwright-mcp](../CONTRIBUTING.md) repository.

## License

Apache-2.0 - See [LICENSE](../LICENSE) for details.
