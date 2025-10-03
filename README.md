# Execute Scripts From VS Code

![Badge for script execution status](https://img.shields.io/badge/Status-Realtime%20Execution-brightgreen)
![Badge for Lua support](https://img.shields.io/badge/Language-Luau%2FLua5.1-blue)

A VS Code extension that enables you to synchronize and execute your Lua/Luau scripts directly from VS Code into a connected **Roblox Client** (or Roblox Studio Play Session) in real time. Say goodbye to manual copy-pasting and achieve faster iteration in your script development workflow.

## ✨ Features

* **⚡ Real-time Script Injection:** Instantly send and execute code via a local WebSocket server.
* **📂 Editor and File Support:** Execute the content of the currently active editor, or execute a specific file path.
* **🛠️ Wax/Lune Bundler Integration:** Run your Lune/Wax Bundler command with a single click and inject the final bundled Luau script directly into the game, perfectly supporting complex project structures.
* **🚀 Status Bar Feedback:** Real-time display of connection status, execution progress, and error reporting.

## 💡 How to Use

### 1. Start the Server (Automatic)

The extension automatically starts a WebSocket server on port **`54823`** upon activation and waits for a connection. The status bar will show `$(sync~spin) Starting server...`.

### 2. Connect the Roblox Client

Run your WebSocket client script within your **Roblox Client** or your **Roblox Studio Play Session**.

* Upon successful connection, the status bar will change to `$(play) Execute Script`.

### 3. Execute Your Script

* **Keyboard Shortcut:** (Recommended: Bind your preferred shortcut in VS Code, e.g., `Ctrl+Shift+R`)
* **Status Bar:** Click the `$(play) Execute Script` button in the bottom-left status bar.
* **Command Palette:** Use `Ctrl/Cmd+Shift+P` and search for the following commands:
    * `Execute Scripts From VS Code: Execute Script from Current Editor`
    * `Execute Scripts From VS Code: Execute Script from File Path`
    * `Execute Scripts From VS Code: Execute Script via Wax Bundler (Lune)`

## ⚙️ Configuration

Currently, there are no user-configurable settings. The extension defaults to using port `54823`.

## 🤝 Contribution and Feedback

Feel free to submit bug reports or feature requests via GitHub Issues.

---

>All of this, including the source code and even the commit, is AI-generated.

>I'm sorry lol
