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
          points: Array<{x: number, y: number}>;
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
    private currentPencilPoints: Array<{x: number, y: number}> = [];
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
                // Only add the shape if it came from another client
                // Skip shapes that originated from this client
                if (message.source !== 'self') {
                    this.existingShapes.push(parsedShape.shape);
                    this.clearCanvas();
                }
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
                this.ctx.beginPath();
                this.ctx.arc(
                    shape.centerX,
                    shape.centerY,
                    shape.radius,
                    0,
                    Math.PI * 2
                );
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(shape.startX, shape.startY);
                this.ctx.lineTo(shape.endX, shape.endY);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "pencil") {
                if(shape.points.length < 2) return;
                this.ctx.beginPath();
                
                this.ctx.moveTo(shape.points[0].x, shape.points[0].y);

                for (let i = 1; i < shape.points.length; i++) {
                    this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                
                this.ctx.stroke();
                this.ctx.closePath();
            }
        });
        if (this.selectedTool === "pencil" && this.clicked && this.currentPencilPoints.length >= 2) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.currentPencilPoints[0].x, this.currentPencilPoints[0].y);
            
            for (let i = 1; i < this.currentPencilPoints.length; i++) {
                this.ctx.lineTo(this.currentPencilPoints[i].x, this.currentPencilPoints[i].y);
            }
            
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }

    mousedownHandler = (e: any) => {
        this.clicked = true;
        this.startX = e.clientX - this.canvas.getBoundingClientRect().left;
        this.startY = e.clientY - this.canvas.getBoundingClientRect().top;

        if(this.selectedTool === "pencil") {
            this.currentPencilPoints = [{x: this.startX, y: this.startY}]
        }
    };

    mouseupHandler = (e: any) => {
        if (!this.clicked) return;
        
        this.clicked = false;
        const endX = e.clientX - this.canvas.getBoundingClientRect().left;
        const endY = e.clientY - this.canvas.getBoundingClientRect().top;
        const width = endX - this.startX;
        const height = endY - this.startY;

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
                endX: endX,
                endY: endY,
            };
        } else if (selectedTool === "pencil") {
            const lastPoint = this.currentPencilPoints[this.currentPencilPoints.length -1];
            if(lastPoint.x !== endX || lastPoint.y !== endY) {
                this.currentPencilPoints.push({x: endX, y: endY})
            }

            if (this.currentPencilPoints.length >= 2) {
                shape = {
                    type: "pencil",
                    points: [...this.currentPencilPoints]
                };
            }
            this.currentPencilPoints = [];
        }

        if (!shape) {
            return;
        }

        // Add the shape to our local collection
        this.existingShapes.push(shape);
        
        // Redraw the canvas
        this.clearCanvas();

        // Send the shape to other clients with a source indicator
        this.socket.send(
            JSON.stringify({
                type: "chat",
                message: JSON.stringify({
                    shape,
                }),
                roomId: this.roomId,
                source: 'self' // Add this to identify messages from this client
            })
        );
    };

    mousemoveHandler = (e: any) => {
        if (this.clicked) {
            const endX = e.clientX - this.canvas.getBoundingClientRect().left;
            const endY = e.clientY - this.canvas.getBoundingClientRect().top;
            const width = endX - this.startX;
            const height = endY - this.startY;

            // @ts-ignore
            const selectedTool = this.selectedTool;

            if(selectedTool === "pencil") {
                // @ts-ignore
                this.currentPencilPoints.push({x: endX, y: endY});
                this.clearCanvas();
                return;
            }

            this.clearCanvas();
            this.ctx.strokeStyle = "white";

            if (selectedTool === "rect") {
                this.ctx.strokeRect(this.startX, this.startY, width, height);
            } else if (selectedTool === "circle") {
                const centerX = this.startX + width / 2;
                const centerY = this.startY + height / 2;
                const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (selectedTool === "line") {
                this.ctx.beginPath();
                this.ctx.moveTo(this.startX, this.startY);
                this.ctx.lineTo(endX, endY);
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