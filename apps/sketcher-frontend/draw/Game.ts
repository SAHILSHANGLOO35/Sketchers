import { init } from "next/dist/compiled/webpack/webpack";
import { getExistingShapes } from "./http";
import { Tool } from "@/components/Canvas";

type Shape =
    | {
          type: "rect";
          x: number;
          y: number;
          width: number;
          height: number;
      }
    | {
          type: "circle";
          centerX: number;
          centerY: number;
          radius: number;
      }
    | {
          type: "pencil";
          startX: number;
          startY: number;
          endX: number;
          endY: number;
      }
    | {
          type: "line";
          startX: number;
          startY: number;
          endX: number;
          endY: number;
      };

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.initHandlers();
        this.initMouseHandlers();
        this.clicked = false;

        this.init();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mousedownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseupHandler);
        this.canvas.removeEventListener("mousemove", this.mousemoveHandler);
    }

    setTool(tool: "circle" | "pencil" | "rect" | "line") {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.strokeStyle = "white";

        this.existingShapes.map((shape) => {
            if (shape.type === "rect") {
                this.ctx.strokeRect(
                    shape.x,
                    shape.y,
                    shape.width,
                    shape.height
                );
            } else if (shape.type === "circle") {
                this.ctx.arc(
                    shape.centerX,
                    shape.centerY,
                    shape.radius,
                    0,
                    Math.PI * 2
                );
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.closePath();
            } else if (shape.type === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
                this.ctx.closePath();
            }
        });
    }

    mousedownHandler = (e: any) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
    };

    mouseupHandler = (e: any) => {
        this.clicked = false;
        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        // @ts-ignore
        const selectedTool = this.selectedTool;

        let shape: Shape | null = null;

        if (selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width,
            };
        } else if (selectedTool === "circle") {
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            shape = {
                type: "circle",
                centerX: this.startX + width / 2,
                centerY: this.startY + height / 2,
                radius,
            };
        } else if (selectedTool === "line") {
            shape = {
                type: "line",
                startX: this.startX,
                startY: this.startY,
                endX: e.clientX - this.canvas.getBoundingClientRect().left,
                endY: e.clientY - this.canvas.getBoundingClientRect().top,
            };
        }

        if (!shape) {
            return;
        }

        this.existingShapes.push(shape);

        this.socket.send(
            JSON.stringify({
                type: "chat",
                message: JSON.stringify({
                    shape,
                }),
                roomId: this.roomId,
            })
        );
    };

    mousemoveHandler = (e: any) => {
        if (this.clicked) {
            const width = e.clientX - this.startX;
            const height = e.clientY - this.startY;
            this.clearCanvas();

            // @ts-ignore
            const selectedTool = this.selectedTool;
            if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (selectedTool === "circle") {
                const centerX = this.startX + width / 2;
                const centerY = this.startY + height / 2;
                const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.closePath();
            } else if (selectedTool === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(
                    e.clientX - this.canvas.getBoundingClientRect().left,
                    e.clientY - this.canvas.getBoundingClientRect().top
                );
                this.ctx.stroke();
                this.ctx.closePath();
            }
        }
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mousedownHandler);
        this.canvas.addEventListener("mouseup", this.mouseupHandler);
        this.canvas.addEventListener("mousemove", this.mousemoveHandler);
    }
}
