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
    private minDistance = 2; // Minimum distance between points for smoothing
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
        this.setCursor();

    }

    setCursor() {
        if (this.selectedTool === "pencil" || this.selectedTool === "line" || 
            this.selectedTool === "rect" || this.selectedTool === "circle") {
          // Apply cursor directly to style
          this.canvas.style.cursor = "crosshair";
        } else {
          this.canvas.style.cursor = "default";
        }
        
        // Log to confirm the method is being called
        console.log("Cursor set for tool:", this.selectedTool);
      }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mousedownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseupHandler);
        this.canvas.removeEventListener("mousemove", this.mousemoveHandler);
    }

    setTool(tool: "circle" | "pencil" | "rect" | "line") {
        this.selectedTool = tool;
        this.setCursor();
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
                this.drawSmoothLine(shape.points);
            }
        });
        
        if (this.selectedTool === "pencil" && this.clicked && this.currentPencilPoints.length >= 2) {
            this.drawSmoothLine(this.currentPencilPoints);
        }
    }

    drawSmoothLine(points: Array<{x: number, y: number}>) {
        if (points.length < 2) return;
        
        this.ctx.beginPath();
        this.ctx.lineWidth = 2; // Thicker line for smoother appearance
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Start from the first point
        this.ctx.moveTo(points[0].x, points[0].y);
        
        // For the first segment, just draw a line
        if (points.length === 2) {
            this.ctx.lineTo(points[1].x, points[1].y);
        } else {
            // For multiple points, create smooth curves
            for (let i = 1; i < points.length - 1; i++) {
                // Calculate control points for a quadratic curve
                const xc = (points[i].x + points[i+1].x) / 2;
                const yc = (points[i].y + points[i+1].y) / 2;
                
                // Use quadraticCurveTo for a smooth transition
                this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            
            // Connect to the last point
            const last = points.length - 1;
            this.ctx.quadraticCurveTo(
                points[last-1].x, 
                points[last-1].y, 
                points[last].x, 
                points[last].y
            );
        }
        
        this.ctx.stroke();
        this.ctx.closePath();
    }

    mousedownHandler = (e: any) => {
        this.clicked = true;
        this.startX = e.clientX - this.canvas.getBoundingClientRect().left;
        this.startY = e.clientY - this.canvas.getBoundingClientRect().top;

        if(this.selectedTool === "pencil") {
            this.currentPencilPoints = [{x: this.startX, y: this.startY}];
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
                this.currentPencilPoints.push({x: endX, y: endY});
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
            const currentX = e.clientX - this.canvas.getBoundingClientRect().left;
            const currentY = e.clientY - this.canvas.getBoundingClientRect().top;
            const width = currentX - this.startX;
            const height = currentY - this.startY;

            // @ts-ignore
            const selectedTool = this.selectedTool;

            if(selectedTool === "pencil") {
                if (this.currentPencilPoints.length > 0) {
                    const lastPoint = this.currentPencilPoints[this.currentPencilPoints.length - 1];
                    
                    // Only add points that are a minimum distance away to reduce jitter
                    const dx = currentX - lastPoint.x;
                    const dy = currentY - lastPoint.y;
                    const distance = Math.sqrt(dx*dx + dy*dy);
                    
                    if (distance >= this.minDistance) {
                        this.currentPencilPoints.push({x: currentX, y: currentY});
                    }
                } else {
                    this.currentPencilPoints.push({x: currentX, y: currentY});
                }
                
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
                this.ctx.lineTo(currentX, currentY);
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