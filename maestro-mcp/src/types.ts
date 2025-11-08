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

export interface MaestroConfig {
  /** Path to maestro CLI binary. If not specified, assumes 'maestro' is in PATH */
  maestroPath?: string;
  /** Working directory for maestro commands */
  workingDirectory?: string;
  /** Default app identifier (bundle ID for iOS, package name for Android) */
  appId?: string;
  /** Device/platform to target: 'iOS', 'Android', or device ID */
  platform?: string;
  /** Host for maestro server if running in server mode */
  host?: string;
  /** Port for maestro server if running in server mode */
  port?: number;
}

export interface MaestroElement {
  /** Element text content */
  text?: string;
  /** Element ID (testID, accessibilityLabel) */
  id?: string;
  /** Element index when multiple matches exist */
  index?: number;
  /** Whether element is enabled */
  enabled?: boolean;
  /** Whether element is below another element */
  below?: MaestroElement;
  /** Whether element is above another element */
  above?: MaestroElement;
  /** Whether element is left of another element */
  leftOf?: MaestroElement;
  /** Whether element is right of another element */
  rightOf?: MaestroElement;
}

export interface MaestroCommandResult {
  /** Whether the command succeeded */
  success: boolean;
  /** Command output */
  output: string;
  /** Error message if failed */
  error?: string;
  /** Exit code */
  exitCode: number;
}

export interface MaestroFlow {
  /** App identifier to launch */
  appId: string;
  /** List of commands in the flow */
  commands: any[];
  /** Environment variables for the flow */
  env?: Record<string, string>;
}

export interface DeviceInfo {
  /** Device platform (iOS/Android) */
  platform: string;
  /** Device name */
  name: string;
  /** Device ID */
  deviceId: string;
  /** Whether device is available */
  available: boolean;
}

export interface AppInfo {
  /** App identifier */
  appId: string;
  /** App name */
  name: string;
  /** App version */
  version?: string;
}

export interface ScreenshotOptions {
  /** Output file path for screenshot */
  path?: string;
}

export interface ScrollOptions {
  /** Direction to scroll */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Speed of scroll */
  speed?: number;
  /** Element to scroll to */
  element?: MaestroElement;
}
