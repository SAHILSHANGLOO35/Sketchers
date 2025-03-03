import { initDraw } from "@/draw";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import { Circle, Minus, Pencil, RectangleHorizontalIcon } from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "pencil" | "rect" | "circle" | "line";

export function Canvas({
    roomId,
    socket,
}: {
    roomId: string;
    socket: WebSocket;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");
    const [game, setGame] = useState<Game>();

    useEffect(() => {
        // @ts-ignore
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket);
            setGame(g);

            return () => {
                g.destroy();
            }
        }

    }, [canvasRef]);

    return (
        <div className="overflow-hidden h-screen text-white">
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                className="fixed top-0 left-0 w-full h-full"
            ></canvas>
            <TopBar
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
            />
        </div>
    );
}

function TopBar({
    selectedTool,
    setSelectedTool,
}: {
    selectedTool: Tool;
    setSelectedTool: (s: Tool) => void;
}) {
    return (
        <div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 border border-white/15 py-2 px-4 rounded-xl shadow-lg w-max"
            style={{ backgroundColor: "#242424" }}
        >
            <IconButton
                activated={selectedTool === "pencil"}
                icon={<Pencil size={15} />}
                onClick={() => {
                    setSelectedTool("pencil");
                }}
            />
            <IconButton
                activated={selectedTool === "circle"}
                icon={<Circle size={15} />}
                onClick={() => {
                    setSelectedTool("circle");
                }}
            />
            <IconButton
                activated={selectedTool === "rect"}
                icon={<RectangleHorizontalIcon size={15} />}
                onClick={() => {
                    setSelectedTool("rect");
                }}
            />
            <IconButton
                activated={selectedTool === "line"}
                icon={<Minus size={15} />}
                onClick={() => {
                    setSelectedTool("line");
                }}
            />
        </div>
    );
}
