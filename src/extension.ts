import ws from "ws"; 
import * as vscode from "vscode";
import * as fs from "fs";
import { execSync } from "child_process";

const WebSocketPort = 54823;

const CommandName = "executescriptsfromvscode";

const Command = {
    Editor: "ExecuteScriptFromTextEditor",
    File:   "ExecuteScriptFromFile",
    Bundle: "ExecuteScriptFromWaxBundler"
};

const OutputPath = "Temp/Script.luau";
const Tooltip    = "Execute the current script to Roblox";

let WebSocketServer: ws.Server | null; 
let WebSocketClient: ws | null;         
let StatusBarItem:   vscode.StatusBarItem;

function ConnectWebSocket(): void {
    if (WebSocketServer) {
        return;
    }

    StatusBarItem.text    = "$(sync~spin) Execute Script";
    StatusBarItem.tooltip = `${Tooltip}\nStarting server and waiting for Roblox...`;

    try {
        WebSocketServer = new ws.Server({
            port: WebSocketPort,
            clientTracking: true
        });
    } catch (Error: any) {
        const ErrorMessage = (Error as any).message || 'Server failed to start';
        vscode.window.showErrorMessage(`Failed to start WebSocket server on port ${WebSocketPort}. Error: ${ErrorMessage}`);
        console.error(`[ExecuteScriptsFromVSCode] Server start error: ${ErrorMessage}`);

        StatusBarItem.text    = "$(error) Execute Script";
        StatusBarItem.tooltip = `${Tooltip}\nServer failed to start.`;
        return;
    }

    WebSocketServer.on('connection', (NewClient: ws) => {
        if (WebSocketClient) {
            NewClient.close(1000, "Only one Roblox client connection allowed.");
            return;
        }

        WebSocketClient = NewClient;

        StatusBarItem.text    = "$(play) Execute Script";
        StatusBarItem.tooltip = `${Tooltip}\nConnected to Roblox`;

        NewClient.on('close', () => {
            WebSocketClient = null;
            StatusBarItem.text    = "$(warning) Execute Script";
            StatusBarItem.tooltip = `${Tooltip}\nDisconnected from Roblox`;
        });

        NewClient.on('error', (Error) => {
            console.error(`[ExecuteScriptsFromVSCode] Roblox Client Error:`, Error);
        });
    });

    WebSocketServer.on(
        "error",
        (Error) => { 
            const DetailedError  = (Error as any).code || (Error as any).message || "Unknown server error";
            const DisplayMessage = `Server Error (${DetailedError})`;

            console.error(`[ExecuteScriptsFromVSCode] ws Server Error: ${DisplayMessage}`);

            if (WebSocketServer && WebSocketServer.clients.size === 0) {
                WebSocketServer.close();
                WebSocketServer = null;
            }

            StatusBarItem.text    = "$(error) Execute Script";
            StatusBarItem.tooltip = `${Tooltip}\n${DisplayMessage}`;
        }
    );
}

async function SendAndReport(ScriptToExecute: string, Source: string): Promise<void> {
    if (!WebSocketClient || WebSocketClient.readyState !== ws.OPEN) {
        vscode.window.showWarningMessage("Not connected to Roblox. Please ensure Roblox is running and connected.");
        return;
    }

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Executing Script from ${Source}...`,
        cancellable: false
    }, async () => {
        try {
            WebSocketClient!.send(ScriptToExecute);

            const Response = await WaitForResponse();
            if (Response.Success) {
                vscode.window.showInformationMessage("Script executed successfully.");
            } else {
                const ErrorMessage = `Script execution failed: ${Response.Error}`;
                vscode.window.showErrorMessage(ErrorMessage);
                console.error(`[ExecuteScriptsFromVSCode] ${ErrorMessage}`);
            }
        } catch (Error: any) {
            const ErrorMessage = `Failed to send script. ${Error.message}`;
            vscode.window.showErrorMessage(ErrorMessage);
            console.error(`[ExecuteScriptsFromVSCode] ${ErrorMessage}`);
        }
    });
}

async function ExecuteScriptFromTextEditor(): Promise<void> {
    const Editor = vscode.window.activeTextEditor;
    if (!Editor) {
        vscode.window.showWarningMessage("No active text editor. Please open a script file.");
        return;
    }

    const ScriptToExecute = Editor.document.getText();
    await SendAndReport(ScriptToExecute, "Active Editor");
}

async function ExecuteScriptFromFile(FilePath?: string): Promise<void> {
    let FileToExecute = FilePath;

    if (!FileToExecute) {
        FileToExecute = await vscode.window.showInputBox({
            prompt: "Enter the full path of the script file to execute.",
            ignoreFocusOut: true,
            validateInput: (Value) => {
                if (!Value) {
                    return "File path cannot be empty.";
                }
                try {
                    fs.accessSync(Value, fs.constants.F_OK); 
                } catch (E) {
                    return "File not found or inaccessible.";
                }
                return null;
            }
        });
    }

    if (!FileToExecute) {
        if (!FilePath) {
            vscode.window.showInformationMessage("Script execution cancelled.");
        }
        return;
    }

    try {
        const ScriptToExecute = fs.readFileSync(FileToExecute, "utf8");
        await SendAndReport(ScriptToExecute, FileToExecute);
    } catch (E: any) {
        vscode.window.showErrorMessage(`Failed to read file: ${E.message}`);
    }
}

async function ExecuteScriptFromWaxBundler(): Promise<void> {
    if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
        vscode.window.showWarningMessage("Please open a workspace to use the Wax Bundler feature.");
        return;
    }

    const WorkspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
    const InitFile      = `${WorkspaceRoot}/Build/init.luau`;
    const TargetPath    = `${WorkspaceRoot}/${OutputPath}`;
    const BundleCommand = `lune run Build bundle ci-mode=true minify=false output="${TargetPath}"`;

    if (!fs.existsSync(InitFile)) {
        vscode.window.showErrorMessage("Wax Bundler requires a \"Build/init.luau\" file to start the bundling process.");
        return;
    }

    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Running Lune Bundle...",
        cancellable: false
    }, async (Progress) => {
        try {
            execSync(BundleCommand, { 
                cwd: WorkspaceRoot,
                encoding: "utf8",
                stdio: "pipe"
            });

            if (!fs.existsSync(TargetPath)) {
                vscode.window.showErrorMessage(`Lune bundling failed: Output file not found at ${TargetPath}`);
                return;
            }

            Progress.report({ message: "Bundling successful. Executing script..." });
            await ExecuteScriptFromFile(TargetPath);
        } catch (Error: any) {
            vscode.window.showErrorMessage(`Lune command failed. Ensure "lune" is installed and in your PATH. Error: ${Error.message}`);
        }
    });
}

async function WaitForResponse(): Promise<{Success: boolean, Error?: string}> {
    return new Promise((Resolve, Reject) => {
        const Timeout = setTimeout(() => {
            Reject(new Error("Timed out waiting for response from Roblox."));
            WebSocketClient!.off("message", Handler);
        }, 10000); 

        const Handler = (Data: ws.Data) => {
            clearTimeout(Timeout);
            WebSocketClient!.off("message", Handler);

            try {
                const JSONResponse = JSON.parse(Data.toString());
                if (typeof JSONResponse.Success === "boolean") {
                    Resolve(JSONResponse as {Success: boolean, Error?: string});
                } else {
                    Reject(new Error("Invalid response from Roblox."));
                }
            } catch (WebSocketError: any) {
                Reject(new Error(`Error parsing response from Roblox: ${WebSocketError.message}`));
            }
        };

        WebSocketClient!.once("message", Handler);
    });
}

export function activate(Context: vscode.ExtensionContext): void {
    console.log("[ExecuteScriptsFromVSCode] Activated");

    StatusBarItem         = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000);
    StatusBarItem.command = `${CommandName}.${Command.Editor}`;
    StatusBarItem.text    = "$(play) Execute Script";
    StatusBarItem.tooltip = `${Tooltip}\nConnecting to Roblox...`;

    StatusBarItem.show();

    Context.subscriptions.push(StatusBarItem);

    Context.subscriptions.push(vscode.commands.registerCommand(`${CommandName}.${Command.Editor}`, ExecuteScriptFromTextEditor));
    Context.subscriptions.push(vscode.commands.registerCommand(`${CommandName}.${Command.File}`,   ExecuteScriptFromFile      ));
    Context.subscriptions.push(vscode.commands.registerCommand(`${CommandName}.${Command.Bundle}`, ExecuteScriptFromWaxBundler));

    ConnectWebSocket();
}

export function deactivate(): void {
    if (WebSocketServer) {
        WebSocketServer.close();
    }
}
