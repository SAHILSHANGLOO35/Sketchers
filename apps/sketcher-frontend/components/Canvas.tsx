import { initDraw } from "@/draw";
import { useEffect, useRef } from "react";

export function Canvas({ roomId, socket }: { roomId: string, socket: WebSocket }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvasRef.current) {
            initDraw(canvasRef.current, roomId, socket);
        }
    }, [canvasRef]);

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={1080}
                height={1080}
                style={{ border: "1px solid white" }}
            ></canvas>
        </div>
    );
}
