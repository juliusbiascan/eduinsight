"use client"

import { useCallback, useEffect, useRef, useState } from "react";
import { Device } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, Loader2 } from "lucide-react";
import { useSocket } from "@/providers/socket-provider";

interface VncClientProps {
  device: Device;
}

export const VncClient: React.FC<VncClientProps> = ({
  device
}) => {
  const devId = device.id;
  const { socket, isConnected, error } = useSocket();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDrag, setIsDrag] = useState<boolean>(false);

  const emitMouseEvent = useCallback((eventName: string, data: any) => {
    if (socket) {
      socket.emit(eventName, { remoteId: devId, ...data });
    }
  }, [devId, socket]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (isDrag) {
      emitMouseEvent("mouse-move", {
        move: {
          direction: "down",
          clientX: e.clientX - target.offsetLeft,
          clientY: e.clientY - target.offsetTop,
          clientWidth: target.clientWidth,
          clientHeight: target.clientHeight
        }
      })
    } else {
      emitMouseEvent("mouse-move", {
        move: {
          clientX: e.clientX - target.offsetLeft,
          clientY: e.clientY - target.offsetTop - 56,
          clientWidth: target.clientWidth,
          clientHeight: target.clientHeight
        }
      });
    }
  }, [emitMouseEvent, isDrag]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDrag(true)
    const button = e.buttons === 2 ? "right" : (e.buttons === 4 ? "middle" : "left");
    emitMouseEvent("mouse-down", { button: { button, double: e.detail === 2 ? true : false } });
  }, [emitMouseEvent]);

  const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDrag(false)
    const target = e.currentTarget;
    emitMouseEvent("mouse-up", {
      move: {
        direction: "up",
        clientX: e.clientX - target.offsetLeft,
        clientY: e.clientY - target.offsetTop,
        clientWidth: target.clientWidth,
        clientHeight: target.clientHeight
      }
    });
  }, [emitMouseEvent]);

  const handleMouseWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    emitMouseEvent("mouse-scroll", { delta: { deltaX: e.deltaX, deltaY: e.deltaY } });
  }, [emitMouseEvent]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    let mainKey = '', secondKey: any = [];
    e.shiftKey && secondKey.push("shift")
    e.ctrlKey && secondKey.push("command")
    e.altKey && secondKey.push("alt")

    if (e.key === "Backspace" || e.key === "Delete" || e.key === "Enter" || e.key === "Tab" || e.key === "Escape"
      || e.key === "Home" || e.key === "End" || e.key === "PageUp" || e.key === "PageDown" || e.key === "F1" || e.key === "F2"
      || e.key === "F3" || e.key === "F4" || e.key === "F5" || e.key === "F6" || e.key === "F7" || e.key === "F8" || e.key === "F9"
      || e.key === "F10" || e.key === "F11" || e.key === "F12" || e.key === "Control" || e.key === "Alt") {
      mainKey = e.key.toLowerCase()
    }
    else if (e.key === "ArrowUp") {
      mainKey = "up"
    } else if (e.key === "ArrowDown") {
      mainKey = "down"
    } else if (e.key === "ArrowLeft") {
      mainKey = "left"
    } else if (e.key === "ArrowRight") {
      mainKey = "right"
    } else if (e.key === " ") {
      mainKey = "space"
    } else if (e.key === "Meta") {
      mainKey = "command"
    } else {
      mainKey = e.key.toLowerCase()
    }
    emitMouseEvent("keyboard-event", { key: [mainKey, secondKey] });

  }, [emitMouseEvent]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.emit("join-server", devId);
    socket.emit("start-sharing", devId);

    const handleScreenShare = ({ deviceId, screenData }: { deviceId: string, screenData: string }) => {
      if (deviceId === devId && canvasRef.current) {
        const cleanedData = cleanScreenData(screenData);
        if (cleanedData) {
          drawImageOnCanvas(cleanedData);
        }
      }
    };

    socket.on("screen-share", handleScreenShare);

    return () => {
      socket.emit("stop-sharing", devId);
      socket.off("screen-share", handleScreenShare);
    };
  }, [devId, socket]);

  const cleanScreenData = (screenData: string): string => {
    let cleanedData = screenData;
    const dataUrlPrefixes = [
      'data:image/jpeg;base64,',
      'data:image/png;base64,',
      'data:image/webp;base64,',
    ];

    dataUrlPrefixes.forEach(prefix => {
      cleanedData = cleanedData.replace(new RegExp(`^${prefix}`, 'g'), '');
    });

    return cleanedData.replace(/[^A-Za-z0-9+/=]/g, '');
  };

  const drawImageOnCanvas = (cleanedData: string) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && canvasRef.current) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        const scale = Math.min(canvasRef.current.width / img.width, canvasRef.current.height / img.height);
        const x = (canvasRef.current.width / 2) - (img.width / 2) * scale;
        const y = (canvasRef.current.height / 2) - (img.height / 2) * scale;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      }
    };
    img.onerror = (error) => {
      console.error('Error loading image:', error);
    };
    img.src = `data:image/png;base64,${cleanedData}`;
  };

  return (
    <Card className={`overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <CardContent className="p-0">
        <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Remote Device: {device.name}</h2>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div
          ref={containerRef}
          className={`relative ${isFullscreen ? 'h-[calc(100vh-56px)]' : 'h-[80vh]'} w-full bg-black`}
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onWheel={handleMouseWheel}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          style={{ cursor: 'none' }}
        >
          {isConnected ? (
            <canvas
              ref={canvasRef}
              width={1280}
              height={720}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="mt-2 text-gray-400">Connecting...</span>
              {error && <span className="mt-2 text-red-500">{error}</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}