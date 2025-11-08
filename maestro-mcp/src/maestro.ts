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

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs/promises';
import { MaestroConfig, MaestroCommandResult } from './types';

const execAsync = promisify(exec);

export class MaestroClient {
  private config: MaestroConfig;
  private maestroPath: string;

  constructor(config: MaestroConfig = {}) {
    this.config = config;
    this.maestroPath = config.maestroPath || 'maestro';
  }

  /**
   * Check if Maestro CLI is installed and accessible
   */
  async checkInstallation(): Promise<boolean> {
    try {
      const result = await this.executeCommand(['--version']);
      return result.success;
    } catch {
      return false;
    }
  }

  /**
   * Get Maestro version
   */
  async getVersion(): Promise<string> {
    const result = await this.executeCommand(['--version']);
    if (!result.success) {
      throw new Error('Failed to get Maestro version');
    }
    return result.output.trim();
  }

  /**
   * Execute a raw maestro command
   */
  async executeCommand(args: string[]): Promise<MaestroCommandResult> {
    return new Promise((resolve) => {
      const process = spawn(this.maestroPath, args, {
        cwd: this.config.workingDirectory,
      });

      let stdout = '';
      let stderr = '';

      process.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (exitCode) => {
        resolve({
          success: exitCode === 0,
          output: stdout,
          error: stderr || undefined,
          exitCode: exitCode || 0,
        });
      });

      process.on('error', (error) => {
        resolve({
          success: false,
          output: '',
          error: error.message,
          exitCode: 1,
        });
      });
    });
  }

  /**
   * Run a maestro test flow from YAML file
   */
  async runFlow(flowPath: string, env?: Record<string, string>): Promise<MaestroCommandResult> {
    const args = ['test', flowPath];

    if (env) {
      for (const [key, value] of Object.entries(env)) {
        args.push('-e', `${key}=${value}`);
      }
    }

    if (this.config.platform) {
      args.push('--platform', this.config.platform);
    }

    return this.executeCommand(args);
  }

  /**
   * Run a maestro test flow from YAML content (creates temporary file)
   */
  async runFlowContent(flowContent: string, env?: Record<string, string>): Promise<MaestroCommandResult> {
    const tmpDir = await fs.mkdtemp('/tmp/maestro-mcp-');
    const flowPath = path.join(tmpDir, 'flow.yaml');

    try {
      await fs.writeFile(flowPath, flowContent);
      return await this.runFlow(flowPath, env);
    } finally {
      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }

  /**
   * Start recording a test session
   */
  async startRecording(outputPath: string): Promise<MaestroCommandResult> {
    return this.executeCommand(['record', outputPath]);
  }

  /**
   * Take a screenshot
   */
  async screenshot(outputPath?: string): Promise<MaestroCommandResult> {
    const args = ['screenshot'];
    if (outputPath) {
      args.push(outputPath);
    }
    return this.executeCommand(args);
  }

  /**
   * Get UI hierarchy (similar to accessibility snapshot in Playwright)
   */
  async getHierarchy(): Promise<string> {
    const result = await this.executeCommand(['hierarchy']);
    if (!result.success) {
      throw new Error(`Failed to get UI hierarchy: ${result.error}`);
    }
    return result.output;
  }

  /**
   * Build a YAML command from parameters
   */
  buildYAMLCommand(command: string, params: any): string {
    return `- ${command}: ${JSON.stringify(params)}`;
  }
}
