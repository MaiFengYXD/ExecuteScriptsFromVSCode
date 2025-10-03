if getgenv().ExecuteScriptsFromVSCode then return end
getgenv().ExecuteScriptsFromVSCode = true

local WebSocketPort = 54823
local WebSocketUrl  = `ws://localhost:{WebSocketPort}`

local HttpService = game:GetService("HttpService")

local ConnectionManager = {};do
    local Connections = {}

    function ConnectionManager.Connect(Index: string, Signal: RBXScriptSignal, Callback: Function): ()
        ConnectionManager.Disconnect(Index)
        Connections[Index] = Signal:Connect(Callback)
    end

    function ConnectionManager.Disconnect(Index: string): ()
        local Connection = Connections[Index]
        if Connection then
            Connections[Index] = Connection:Disconnect()
        end
    end
end

local WebSocketRunning = false

local function SetupWebSocketClient(WebSocketClient: typeof(WebSocket.connect("")))
    ConnectionManager.Connect("OnMessage", WebSocketClient.OnMessage, function(ScriptToExecute: string)
        local Closure, ErrorCompiling = loadstring(ScriptToExecute)

        if Closure then
            print("[ExecuteScriptsFromVSCode] Successfully compiled script. Executing...")
            task.defer(Closure)

            WebSocketClient:Send(HttpService:JSONEncode({
                Success = true
            }))
        else
            warn("[ExecuteScriptsFromVSCode] Failed to compile script:", ErrorCompiling)

            WebSocketClient:Send(HttpService:JSONEncode({
                Success = false,
                Error   = ErrorCompiling
            }))
        end
    end)

    ConnectionManager.Connect("OnClose", WebSocketClient.OnClose, function()
        WebSocketRunning = false
        ConnectionManager.Disconnect("OnClose")
        print(`[ExecuteScriptsFromVSCode] Disconnected from WebSocket server at {WebSocketUrl}`)
    end)

    ConnectionManager.Connect("GameClose", game.Close, function()
        ConnectionManager.Disconnect("OnClose")
        WebSocketClient:Close()
    end)

    WebSocketRunning = true
    print(`[ExecuteScriptsFromVSCode] Connected to WebSocket server at {WebSocketUrl}`)
end

repeat
    if WebSocketRunning then continue end

    local Success, WebSocketClient = pcall(WebSocket.connect, WebSocketUrl)
    if Success then
        SetupWebSocketClient(WebSocketClient)
    end
until not task.wait(1)
