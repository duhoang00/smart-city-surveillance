"use client"

import { useEffect, useRef, useState, use } from "react"
import {
  ActivityMessage,
  UpdateMessage,
  CameraFrame,
  GuardId,
  isAlarmMessage,
  isUpdateMessage,
  MessageKind,
} from "@repo/types"

const initCctvWS = (guardId: GuardId, onFrame: (frame: string) => void) => {
  const ws = new WebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}/cctv?id=${guardId}`
  )

  ws.onmessage = (event) => {
    try {
      const data: CameraFrame = JSON.parse(event.data)
      onFrame(`data:image/jpeg;base64,${data.frame}`)
    } catch {
      console.warn("Unexpected CCTV message", event.data)
    }
  }

  return ws
}

const initAlarmWS = (
  guardId: GuardId,
  onMessage: (msg: ActivityMessage) => void
) => {
  const ws = new WebSocket(
    `${process.env.NEXT_PUBLIC_WS_URL}/alarm?id=${guardId}`
  )

  ws.onopen = () => {
    console.log(`✅ Guard ${guardId} connected to alarm channel`)
  }

  ws.onmessage = (event) => {
    try {
      const data: ActivityMessage = JSON.parse(event.data)
      if (isAlarmMessage(data) || isUpdateMessage(data)) {
        onMessage(data)
      }
    } catch (err) {
      console.error("❌ Error parsing message:", err)
    }
  }

  ws.onclose = () => {
    console.log(`❌ Guard ${guardId} disconnected`)
  }

  return ws
}

export default function GuardPage({
  params,
}: {
  params: Promise<{ guardId: GuardId }>
}) {
  const { guardId } = use(params)
  const wsRef = useRef<WebSocket | null>(null)
  const [frameUrl, setFrameUrl] = useState<string | null>(null)
  const [activities, setActivities] = useState<ActivityMessage[]>([])
  const [updateText, setUpdateText] = useState("")
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    wsRef.current = initAlarmWS(guardId, (msg) =>
      setActivities((prev) => [...prev, msg])
    )
    const cctvWS = initCctvWS(guardId, (frame) => setFrameUrl(frame))

    return () => {
      wsRef.current?.close()
      cctvWS.close()
    }
  }, [guardId])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [activities])

  const sendUpdate = () => {
    if (wsRef.current && updateText.trim()) {
      const update: UpdateMessage = {
        type: MessageKind.Update,
        guardId,
        message: updateText,
        timestamp: new Date().toISOString(),
      }
      wsRef.current.send(JSON.stringify(update))
      setUpdateText("")
    }
  }

  return (
    <div className="p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-2">
        Guard {guardId} – Live Alarm Feed
      </h1>

      {/* CCTV Frame */}
      <div className="mb-4">
        {frameUrl ? (
          <img
            src={frameUrl}
            alt={`Guard ${guardId} Camera`}
            className="w-full rounded-md border-neutral-700 object-contain md:max-h-[50vh] bg-black"
          />
        ) : (
          <div className="text-neutral-400">Waiting for camera feed…</div>
        )}
      </div>

      {/* Activity Messages */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-neutral-900 border border-neutral-700 p-4 rounded-md space-y-2"
      >
        {activities.length === 0 && (
          <div className="text-neutral-400">No alarms yet...</div>
        )}

        {activities.map((activity, idx) => (
          <div
            key={idx}
            className={`p-2 rounded-md ${
              activity.type === "alarm"
                ? "border-l-4 border-red-500 bg-neutral-800"
                : "border-l-4 border-blue-500 bg-neutral-700"
            }`}
          >
            <div className="text-sm text-gray-300">
              <strong>Time:</strong>{" "}
              {new Date(activity.timestamp).toLocaleString()}
            </div>

            {isAlarmMessage(activity) ? (
              <>
                <div className="text-white">
                  <strong>Camera:</strong> {activity.cameraId}
                </div>
                <div className="text-orange-300">
                  <strong>Message:</strong> {activity.message}
                </div>
              </>
            ) : (
              <div className="text-blue-300">
                <strong>Update:</strong> {activity.message}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendUpdate();
          }}
          className="flex-1 px-3 py-2 rounded-md border border-neutral-600 bg-neutral-800 text-white"
          placeholder="Send update to Operation Center..."
        />
        <button
          onClick={sendUpdate}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
        >
          Send
        </button>
      </div>
    </div>
  )
}
