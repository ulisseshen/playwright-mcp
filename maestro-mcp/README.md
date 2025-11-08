# Unified Testing MCP Server (Playwright + Maestro)

A **unified** Model Context Protocol (MCP) server that combines [Playwright](https://playwright.dev) (web automation) and [Maestro](https://maestro.mobile.dev) (mobile/Flutter automation) into a single powerful testing solution.

## 🎯 Overview

This MCP server gives you **both** web and mobile testing capabilities in one package:

- **Playwright Tools** (`browser_*`): Full web browser automation (Chromium, Firefox, WebKit)
- **Maestro Tools** (`maestro_*`): Mobile and Flutter app automation (iOS, Android, Flutter)

### Why Use This?

Instead of configuring two separate MCP servers (one for Playwright, one for Maestro), you get everything in one:

```json
{
  "mcpServers": {
    "unified-testing": {
      "command": "npx",
      "args": ["@maestro/mcp@latest"]
    }
  }
}
```

Now you can test:
- ✅ Web apps with Playwright
- ✅ Flutter Web with Playwright
- ✅ Flutter Mobile/Desktop with Maestro
- ✅ Native iOS/Android with Maestro

All from a **single MCP server**!

## 📋 Prerequisites

### For Web Testing (Playwright)
- **Node.js 18+**
- Browsers are installed automatically by Playwright

### For Mobile/Flutter Testing (Maestro)
- **Maestro CLI**: `curl -Ls "https://get.maestro.mobile.dev" | bash`
- **For iOS**: `brew install facebook/fb/idb-companion`
- **Mobile device or emulator/simulator**

## 🚀 Installation

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

## 📚 Available Tools

### Playwright Tools (Web Automation) - `browser_*`

All standard Playwright MCP tools are available:

- `browser_navigate` - Navigate to a URL
- `browser_snapshot` - Get accessibility snapshot
- `browser_click` - Click on elements
- `browser_type` - Type text
- `browser_fill_form` - Fill form fields
- `browser_take_screenshot` - Take screenshots
- `browser_evaluate` - Run JavaScript
- And many more...

For complete Playwright tools documentation, see the [main Playwright MCP README](../README.md).

### Maestro Tools (Mobile/Flutter) - `maestro_*`

#### App Lifecycle
- `maestro_launch_app` - Launch a mobile app
- `maestro_stop_app` - Stop a running app
- `maestro_clear_state` - Clear app state/data
- `maestro_clear_keychain` - Clear iOS keychain

#### Interactions
- `maestro_tap` - Tap on an element
- `maestro_double_tap` - Double tap
- `maestro_long_press` - Long press
- `maestro_scroll` - Scroll in a direction
- `maestro_scroll_until_visible` - Scroll until element visible
- `maestro_swipe` - Swipe gesture
- `maestro_input_text` - Input text
- `maestro_erase_text` - Erase text
- `maestro_hide_keyboard` - Hide keyboard
- `maestro_press_key` - Press a key
- `maestro_back` - Press back button (Android)

#### Assertions
- `maestro_assert_visible` - Assert element visible
- `maestro_assert_not_visible` - Assert element not visible

#### Device Control
- `maestro_set_orientation` - Set orientation
- `maestro_set_location` - Set GPS location
- `maestro_set_airplane_mode` - Toggle airplane mode
- `maestro_screenshot` - Take screenshot
- `maestro_start_recording` - Start video recording
- `maestro_stop_recording` - Stop recording

#### Flow Execution
- `maestro_run_flow` - Run YAML flow file
- `maestro_run_flow_content` - Run YAML flow from content
- `maestro_get_hierarchy` - Get UI hierarchy

#### Flutter-Specific
- `maestro_flutter_tap_by_semantics` - Tap by semantics label
- `maestro_flutter_tap_by_key` - Tap by widget Key
- `maestro_flutter_assert_widget_visible` - Assert widget visible
- `maestro_flutter_input_to_field` - Input to Flutter TextField
- `maestro_flutter_scroll_to_widget` - Scroll to widget
- `maestro_flutter_get_testing_tips` - Get Flutter testing tips

## 💡 Usage Examples

### Web Testing (Playwright)

```javascript
// Navigate to a web page
await client.callTool({
  name: 'browser_navigate',
  arguments: { url: 'https://example.com' }
});

// Get page snapshot
await client.callTool({
  name: 'browser_snapshot',
  arguments: {}
});

// Click a button
await client.callTool({
  name: 'browser_click',
  arguments: {
    element: 'Login button',
    ref: 'e1'
  }
});
```

### Mobile Testing (Maestro)

```javascript
// Launch app
await client.callTool({
  name: 'maestro_launch_app',
  arguments: { appId: 'com.example.myapp' }
});

// Tap a button
await client.callTool({
  name: 'maestro_tap',
  arguments: { element: 'Login' }
});

// Assert element visible
await client.callTool({
  name: 'maestro_assert_visible',
  arguments: { element: 'Welcome' }
});
```

### Flutter Testing

```javascript
// Tap Flutter widget by semantics
await client.callTool({
  name: 'maestro_flutter_tap_by_semantics',
  arguments: { label: 'email-field' }
});

// Input text to Flutter TextField
await client.callTool({
  name: 'maestro_flutter_input_to_field',
  arguments: {
    fieldLabel: 'email-field',
    text: 'user@example.com'
  }
});
```

### Hybrid Testing (Web + Mobile)

```javascript
// Test Flutter Web with Playwright
await client.callTool({
  name: 'browser_navigate',
  arguments: { url: 'http://localhost:8080' }
});

await client.callTool({
  name: 'browser_snapshot',
  arguments: {}
});

// Then test the same app on mobile with Maestro
await client.callTool({
  name: 'maestro_launch_app',
  arguments: { appId: 'com.example.myapp' }
});

await client.callTool({
  name: 'maestro_tap',
  arguments: { element: 'Login' }
});
```

## 🎨 Flutter Development Tips

### Make Your Flutter App Testable

```dart
import 'package:flutter/material.dart';

// Add semantics labels
Semantics(
  label: 'login-button',
  child: ElevatedButton(
    onPressed: _handleLogin,
    child: Text('Login'),
  ),
)

// Use Keys
TextField(
  key: Key('email-input'),
  decoration: InputDecoration(labelText: 'Email'),
)

// Text widgets are automatically accessible
Text('Welcome')  // Can be found by "Welcome"
TextField(hintText: 'Email')  // Can be found by "Email"
```

### Enable Flutter Web Semantics for Debugging

```bash
flutter run -d chrome --profile --dart-define=FLUTTER_WEB_DEBUG_SHOW_SEMANTICS=true
```

## 🔀 When to Use Which Tools?

| Scenario | Recommended Tools |
|----------|------------------|
| Web app testing | Playwright (`browser_*`) |
| Flutter Web testing | Playwright (`browser_*`) preferred |
| Flutter Mobile app | Maestro (`maestro_*`) |
| Flutter Desktop app | Maestro (`maestro_*`) |
| Native iOS/Android | Maestro (`maestro_*`) |
| Cross-platform testing | Both! |

## ⚙️ Configuration

### Command Line Options

```bash
# All Playwright options are supported
npx @maestro/mcp --browser chrome --headless

# Additional Maestro-specific options
npx @maestro/mcp --maestro-path /path/to/maestro
```

### Playwright Configuration

All Playwright configuration options from the [main README](../README.md) are supported:
- `--browser` - Browser to use
- `--headless` - Run in headless mode
- `--device` - Device emulation
- And all other Playwright MCP options

## 📖 Example Maestro Flow

```yaml
appId: com.example.myapp
---
- launchApp
- tapOn:
    id: "email-field"
- inputText: "user@example.com"
- tapOn:
    id: "password-field"
- inputText: "password123"
- tapOn: "Login"
- assertVisible: "Welcome Back!"
- screenshot: login-success.png
```

Run it:
```javascript
await client.callTool({
  name: 'maestro_run_flow',
  arguments: { flowPath: './login-flow.yaml' }
});
```

## 🏗️ Architecture

This unified MCP server:

1. **Uses Playwright's built-in MCP server** for all web automation
2. **Adds Maestro tools** on top for mobile/Flutter automation
3. **Routes tools by prefix**:
   - `browser_*` → Playwright engine
   - `maestro_*` → Maestro CLI wrapper

```
Unified MCP Server
├── Playwright MCP (built-in)
│   └── browser_* tools
└── Maestro Extension
    ├── maestro_* tools
    └── maestro_flutter_* tools
```

## 🆚 Comparison

### This Unified Server vs Separate Servers

**Unified (this package):**
```json
{
  "mcpServers": {
    "testing": {
      "command": "npx",
      "args": ["@maestro/mcp@latest"]
    }
  }
}
```

**Separate:**
```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    },
    "maestro": {
      "command": "maestro-mcp",
      "args": []
    }
  }
}
```

The unified approach is **simpler** and **more convenient** for most use cases!

## 🤝 Contributing

This project welcomes contributions. Please follow the same guidelines as the parent [playwright-mcp](../CONTRIBUTING.md) repository.

## 📄 License

Apache-2.0 - See [LICENSE](../LICENSE) for details.

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright MCP README](../README.md)
- [Maestro Documentation](https://maestro.mobile.dev)
- [Flutter Testing Guide](https://docs.flutter.dev/testing)
- [MCP Documentation](https://modelcontextprotocol.io)
