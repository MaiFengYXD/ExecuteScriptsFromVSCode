# Execute Scripts From VS Code

![Status Badge](https://img.shields.io/badge/Status-Realtime%20Execution-brightgreen)
![Language Badge](https://img.shields.io/badge/Language-Luau-blue)

<video controls loop autoplay muted style="width: 100%; max-width: 540px; aspect-ratio: 16 / 9;">
    <source src="https://github.com/MaiFengYXD/ExecuteScriptsFromVSCode/raw/refs/heads/master/assets/showcase1.mp4" type="video/mp4">
</video>

A VS Code extension that enables you to synchronize and execute your Luau scripts directly from VS Code into a connected **Client Session** in real time. Say goodbye to manual copy-pasting and achieve faster iteration in your script development workflow.

## ✨ Features

* **⚡ Real-time Script Transmission:** Instantly send and **execute** code via a local WebSocket server.
* **📂 Editor and File Support:** Execute the content of the currently active editor, or execute a specific file path.
* **🛠️ Wax/Lune Bundler Integration:** Run your Lune/Wax Bundler command with a single click and **execute** the final bundled Luau script directly in the game, perfectly supporting complex project structures.
* **🚀 Status Bar Feedback:** Real-time display of connection status, execution progress, and error reporting.

---

## 📥 Installation

This extension is distributed as a **VSIX package** along with a companion **Roblox Client Script**.

### Prerequisites

* **VS Code** must be installed.
* **An active executor environment** that supports the `loadstring` and `WebSocket` Luau libraries is required.

### Step 1: Install the VS Code Extension (VSIX)

1.  **Open VS Code.**
2.  Go to the **Extensions** view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3.  Click the **three dots (...)** menu in the top-right of the Extensions panel.
4.  Select **"Install from VSIX..."**.
5.  Select the **`.vsix`** file provided in the distribution package.

The VS Code extension will automatically start its WebSocket server on port **`54823`** upon activation.

### Step 2: Connect the Roblox

1.  Copy the **`ExecuteScriptsFromVSCode.luau`** file.
2.  **Recommended (Auto-Execute):** Paste the file into your executor's **`auto-exec`** folder. This ensures the script runs automatically when the game loads.
3.  **Optional (Manual Run):** You can also manually load or paste the script's content and **execute** it using your executor's script interface.
4.  Launch the game or enter your executor environment.
5.  **Verify Connection:** The VS Code status bar will change from "Waiting..." to **`$(play) Execute Script`** upon a successful connection.

---

## 💡 Usage

Once connected, you can execute code via the following methods:

* **Status Bar Button:** Click the **`$(play) Execute Script`** button to execute the code in the currently active editor.
* **Command Palette:** Use `Ctrl/Cmd + Shift + P` and search for the extension's commands:
    * `Execute Script to Roblox from Text Editor`
    * `Execute Script to Roblox from File`
    * `Execute Script to Roblox from Wax Bundler (make sure you have lune installed)`

---

## ❓ Troubleshooting

If the status bar remains stuck or shows an error, check the following:

1.  **Client Running:** Ensure the **ExecuteScriptsFromVSCode** is actively running (the game session must be active within the executor).
2.  **Firewall:** Ensure your **system firewall** is not blocking VS Code (Node.js) from using the local port **`54823`**.

---

## 🤝 Contribution and Feedback

Feel free to submit bug reports or feature requests via GitHub Issues.

---

>All of this, including the source code and even the commit, is AI-generated (except this line and below and client script).
>
>I'm sorry lol
