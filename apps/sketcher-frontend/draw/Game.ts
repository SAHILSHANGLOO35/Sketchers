import { getExistingShapes } from "./http";
import { Tool } from "@/components/Canvas";

type Shape =
    | {
          type: "rect";
          x: number;
          y: number;
          width: number;
          height: number;
          color: string;
          lineWidth: number;
      }
    | {
          type: "circle";
          centerX: number;
          centerY: number;
          radius: number;
          color: string;
          lineWidth: number;
      }
    | {
          type: "pencil";
          points: Array<{ x: number; y: number }>;
          color: string;
          lineWidth: number;
      }
    | {
          type: "line";
          startX: number;
          startY: number;
          endX: number;
          endY: number;
          color: string;
          lineWidth: number;
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
    private currentPencilPoints: Array<{ x: number; y: number }> = [];
    private minDistance = 2;
    socket: WebSocket;
    private scale = 1;
    private offsetX = 0;
    private offsetY = 0;
    private currentColor = "#FFFFFF";
    private currentLineWidth = 3;
    private undoStack: Shape[][] = [];
    private redoStack: Shape[][] = [];
    private showGrid = false;

    // Add dragging state
    private selectedShape: Shape | null = null;
    private isDragging = false;
    private dragStartX = 0;
    private dragStartY = 0;
    private shapeInitialPosition: { x: number; y: number } | null = null;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.initHandlers();
        this.initMouseHandlers();
        this.clicked = false;

        // Save initial state for undo/redo
        this.saveState();
        this.init();
        this.setCursor();
    }

    setCursor() {
        if (this.selectedShape) {
            this.canvas.style.cursor = "move";
        } else if (
            this.selectedTool === "pencil" ||
            this.selectedTool === "line" ||
            this.selectedTool === "rect" ||
            this.selectedTool === "circle"
        ) {
            this.canvas.style.cursor = "crosshair";
        } else if (this.selectedTool === "pan") {
            this.canvas.style.cursor = "grab";
        } else if (this.selectedTool === "eraser") {
            this.canvas.style.cursor =
                'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="5" fill="white" stroke="black" stroke-width="1"/></svg>\') 10 10, auto';
        } else {
            this.canvas.style.cursor = "default";
        }
    }

    // Helper function to save the current state to the undo stack
    saveState() {
        this.undoStack.push(JSON.parse(JSON.stringify(this.existingShapes)));
        this.redoStack = []; // Clear redo stack when a new action is performed
    }

    // Helper function to check if a point is inside a shape
    isPointInShape(x: number, y: number, shape?: Shape): boolean {
        if (!shape) {
            console.error("Error: shape is undefined or null");
            return false;
        }
    
        switch (shape.type) {
            case "rect":
                return (
                    x >= shape.x &&
                    x <= shape.x + shape.width &&
                    y >= shape.y &&
                    y <= shape.y + shape.height
                );
            case "circle":
                const dx = x - shape.centerX;
                const dy = y - shape.centerY;
                return Math.sqrt(dx * dx + dy * dy) <= shape.radius;
            case "line":
                const lineWidth = shape.lineWidth + 3; // Clickable area around the line
                const dxLine = shape.endX - shape.startX;
                const dyLine = shape.endY - shape.startY;
                const length = Math.sqrt(dxLine * dxLine + dyLine * dyLine);
                if (length === 0) return false;
    
                const t = Math.max(
                    0,
                    Math.min(
                        1,
                        ((x - shape.startX) * dxLine + (y - shape.startY) * dyLine) /
                            (length * length)
                    )
                );
    
                const projX = shape.startX + t * dxLine;
                const projY = shape.startY + t * dyLine;
    
                const distSq = (x - projX) * (x - projX) + (y - projY) * (y - projY);
                return distSq <= lineWidth * lineWidth;
            case "pencil":
                const tolerance = shape.lineWidth + 3;
                for (let i = 1; i < shape.points.length; i++) {
                    const p1 = shape.points[i - 1];
                    const p2 = shape.points[i];
    
                    const dxPencil = p2.x - p1.x;
                    const dyPencil = p2.y - p1.y;
                    const lengthPencil = Math.sqrt(dxPencil * dxPencil + dyPencil * dyPencil);
    
                    if (lengthPencil === 0) continue;
    
                    const tPencil = Math.max(
                        0,
                        Math.min(
                            1,
                            ((x - p1.x) * dxPencil + (y - p1.y) * dyPencil) / (lengthPencil * lengthPencil)
                        )
                    );
    
                    const projXPencil = p1.x + tPencil * dxPencil;
                    const projYPencil = p1.y + tPencil * dyPencil;
    
                    const distSqPencil =
                        (x - projXPencil) * (x - projXPencil) + (y - projYPencil) * (y - projYPencil);
                    if (distSqPencil <= tolerance * tolerance) return true;
                }
                return false;
            default:
                console.error("Error: Unknown shape type", shape);
                return false;
        }
    }
    

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mousedownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseupHandler);
        this.canvas.removeEventListener("mousemove", this.mousemoveHandler);
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
        if (tool === "pan") {
            this.selectedShape = null;
        }
        this.setCursor();
    }

    setColor(color: string) {
        this.currentColor = color;
    }

    setLineWidth(width: number) {
        this.currentLineWidth = width;
    }

    setTransform(scale: number, offsetX: number, offsetY: number) {
        this.scale = scale;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
    }

    redraw() {
        this.drawAllShapes();
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                if (message.type === "chat") {
                    const parsedShape = JSON.parse(message.message);
                    if (message.source !== "self") {
                        if (parsedShape.action === "update") {
                            // Update existing shape
                            const index = this.existingShapes.findIndex(
                                (s) =>
                                    JSON.stringify(s) ===
                                    JSON.stringify(parsedShape.originalShape)
                            );
                            if (index !== -1) {
                                this.existingShapes[index] = parsedShape.shape;
                            }
                        } else if (parsedShape.action === "clear") {
                            // Clear all shapes
                            this.existingShapes = [];
                        } else {
                            // Add new shape
                            this.existingShapes.push(parsedShape.shape);
                        }
                        this.clearCanvas();
                    }
                }
            } catch (e) {
                console.error("Error handling socket message:", e);
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawGrid();
        this.drawAllShapes();
    }

    drawGrid() {
        if (!this.showGrid) return;

        const ctx = this.ctx;
        const canvas = this.canvas;
        const gridSize = 50; // Size of each grid cell
        const gridColor = "rgba(255, 255, 255, 0.1)";

        // Transform the grid to match the current zoom and pan
        const startX =
            Math.floor(-this.offsetX / this.scale / gridSize) * gridSize;
        const startY =
            Math.floor(-this.offsetY / this.scale / gridSize) * gridSize;
        const endX =
            Math.ceil((canvas.width - this.offsetX) / this.scale / gridSize) *
            gridSize;
        const endY =
            Math.ceil((canvas.height - this.offsetY) / this.scale / gridSize) *
            gridSize;

        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1 / this.scale; // Adjust line width based on zoom level

        // Draw vertical lines
        for (let x = startX; x <= endX; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = startY; y <= endY; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }
    }

    drawAllShapes() {
        this.existingShapes.forEach((shape) => {
            if (!shape) return;
            const isSelected = this.selectedShape === shape;

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
                if (shape.points.length < 2) return;
                this.drawSmoothLine(shape.points, shape.color, shape.lineWidth);
            }
        });

        if (
            this.selectedTool === "pencil" &&
            this.clicked &&
            this.currentPencilPoints.length >= 2
        ) {
            this.ctx.strokeStyle = this.currentColor;
            this.ctx.lineWidth = this.currentLineWidth;
            this.drawSmoothLine(
                this.currentPencilPoints,
                this.currentColor,
                this.currentLineWidth
            );
        }
    }

    drawSmoothLine(
        points: Array<{ x: number; y: number }>,
        color: string = this.currentColor,
        lineWidth: number = this.currentLineWidth
    ) {
        if (points.length < 2) return;

        this.ctx.beginPath();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";

        this.ctx.moveTo(points[0].x, points[0].y);

        if (points.length === 2) {
            this.ctx.lineTo(points[1].x, points[1].y);
        } else {
            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }

            const last = points.length - 1;
            this.ctx.quadraticCurveTo(
                points[last - 1].x,
                points[last - 1].y,
                points[last].x,
                points[last].y
            );
        }

        this.ctx.stroke();
        this.ctx.closePath();
    }

    transformScreenToCanvas(screenX: number, screenY: number) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = screenX - rect.left;
        const clientY = screenY - rect.top;

        const canvasX = (clientX - this.offsetX) / this.scale;
        const canvasY = (clientY - this.offsetY) / this.scale;

        return { x: canvasX, y: canvasY };
    }

    // Add methods needed by Canvas component
    undo() {
        if (this.undoStack.length > 1) {
            const currentState = this.undoStack.pop()!;
            this.redoStack.push(currentState);
            this.existingShapes = JSON.parse(
                JSON.stringify(this.undoStack[this.undoStack.length - 1])
            );
            this.clearCanvas();
        }
    }

    redo() {
        if (this.redoStack.length > 0) {
            const nextState = this.redoStack.pop()!;
            this.undoStack.push(nextState);
            this.existingShapes = JSON.parse(JSON.stringify(nextState));
            this.clearCanvas();
        }
    }

    clear() {
        this.saveState();
        this.existingShapes = [];
        this.clearCanvas();

        // Notify other clients
        this.socket.send(
            JSON.stringify({
                type: "chat",
                message: JSON.stringify({
                    action: "clear",
                }),
                roomId: this.roomId,
                source: "self",
            })
        );
    }

    toggleGrid(show: boolean) {
        this.showGrid = show;
        this.clearCanvas();
    }

    mousedownHandler = (e: MouseEvent) => {
        if (this.selectedTool === "pan") return;

        const { x, y } = this.transformScreenToCanvas(e.clientX, e.clientY);

        // Check if clicking on an existing shape
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            const shape = this.existingShapes[i];
            if (this.isPointInShape(x, y, shape)) {
                // Handle eraser tool
                if (this.selectedTool === "eraser") {
                    this.saveState();
                    this.existingShapes.splice(i, 1);
                    this.clearCanvas();

                    // Notify other clients
                    this.socket.send(
                        JSON.stringify({
                            type: "chat",
                            message: JSON.stringify({
                                action: "remove",
                                index: i,
                            }),
                            roomId: this.roomId,
                            source: "self",
                        })
                    );
                    return;
                }

                this.selectedShape = shape;
                this.isDragging = true;
                this.dragStartX = x;
                this.dragStartY = y;

                // Store initial position
                switch (shape.type) {
                    case "rect":
                        this.shapeInitialPosition = { x: shape.x, y: shape.y };
                        break;
                    case "circle":
                        this.shapeInitialPosition = {
                            x: shape.centerX,
                            y: shape.centerY,
                        };
                        break;
                    case "line":
                        this.shapeInitialPosition = {
                            x: shape.startX,
                            y: shape.startY,
                        };
                        break;
                    case "pencil":
                        this.shapeInitialPosition = {
                            x: shape.points[0].x,
                            y: shape.points[0].y,
                        };
                        break;
                }

                this.setCursor();
                this.clearCanvas();
                return;
            }
        }

        // If not clicking on a shape, start drawing
        this.clicked = true;
        this.startX = x;
        this.startY = y;
        this.selectedShape = null;

        if (this.selectedTool === "pencil") {
            this.currentPencilPoints = [{ x: this.startX, y: this.startY }];
        }
    };

    mouseupHandler = (e: MouseEvent) => {
        if (this.selectedTool === "pan") return;

        if (
            this.isDragging &&
            this.selectedShape &&
            this.shapeInitialPosition
        ) {
            // Save state for undo/redo
            this.saveState();

            // Send shape update to other clients
            const originalShape = JSON.parse(
                JSON.stringify(this.selectedShape)
            );
            this.socket.send(
                JSON.stringify({
                    type: "chat",
                    message: JSON.stringify({
                        action: "update",
                        originalShape,
                        shape: this.selectedShape,
                    }),
                    roomId: this.roomId,
                    source: "self",
                })
            );

            this.isDragging = false;
            this.shapeInitialPosition = null;
            return;
        }

        if (!this.clicked) return;

        this.clicked = false;
        const { x: endX, y: endY } = this.transformScreenToCanvas(
            e.clientX,
            e.clientY
        );
        const width = endX - this.startX;
        const height = endY - this.startY;

        let shape: Shape | null = null;

        if (this.selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                height,
                width,
                color: this.currentColor,
                lineWidth: this.currentLineWidth,
            };
        } else if (this.selectedTool === "circle") {
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            shape = {
                type: "circle",
                centerX: this.startX + width / 2,
                centerY: this.startY + height / 2,
                radius,
                color: this.currentColor,
                lineWidth: this.currentLineWidth,
            };
        } else if (this.selectedTool === "line") {
            shape = {
                type: "line",
                startX: this.startX,
                startY: this.startY,
                endX: endX,
                endY: endY,
                color: this.currentColor,
                lineWidth: this.currentLineWidth,
            };
        } else if (this.selectedTool === "pencil") {
            const lastPoint =
                this.currentPencilPoints[this.currentPencilPoints.length - 1];
            if (lastPoint.x !== endX || lastPoint.y !== endY) {
                this.currentPencilPoints.push({ x: endX, y: endY });
            }

            if (this.currentPencilPoints.length >= 2) {
                shape = {
                    type: "pencil",
                    points: [...this.currentPencilPoints],
                    color: this.currentColor,
                    lineWidth: this.currentLineWidth,
                };
            }
            this.currentPencilPoints = [];
        }

        if (!shape) return;

        this.saveState();
        this.existingShapes.push(shape);
        this.clearCanvas();

        this.socket.send(
            JSON.stringify({
                type: "chat",
                message: JSON.stringify({
                    shape,
                }),
                roomId: this.roomId,
                source: "self",
            })
        );
    };

    mousemoveHandler = (e: MouseEvent) => {
        if (this.selectedTool === "pan") return;

        const { x: currentX, y: currentY } = this.transformScreenToCanvas(
            e.clientX,
            e.clientY
        );

        // Handle shape dragging
        if (
            this.isDragging &&
            this.selectedShape &&
            this.shapeInitialPosition
        ) {
            const dx = currentX - this.dragStartX;
            const dy = currentY - this.dragStartY;

            switch (this.selectedShape.type) {
                case "rect":
                    this.selectedShape.x = this.shapeInitialPosition.x + dx;
                    this.selectedShape.y = this.shapeInitialPosition.y + dy;
                    break;
                case "circle":
                    this.selectedShape.centerX =
                        this.shapeInitialPosition.x + dx;
                    this.selectedShape.centerY =
                        this.shapeInitialPosition.y + dy;
                    break;
                case "line": {
                    const lineWidth =
                        this.selectedShape.endX - this.selectedShape.startX;
                    const lineHeight =
                        this.selectedShape.endY - this.selectedShape.startY;
                    this.selectedShape.startX =
                        this.shapeInitialPosition.x + dx;
                    this.selectedShape.startY =
                        this.shapeInitialPosition.y + dy;
                    this.selectedShape.endX =
                        this.selectedShape.startX + lineWidth;
                    this.selectedShape.endY =
                        this.selectedShape.startY + lineHeight;
                    break;
                }
                case "pencil": {
                    const originalFirstPoint = this.shapeInitialPosition;
                    const firstPoint = this.selectedShape.points[0];
                    const offsetX = dx + (originalFirstPoint.x - firstPoint.x);
                    const offsetY = dy + (originalFirstPoint.y - firstPoint.y);

                    this.selectedShape.points = this.selectedShape.points.map(
                        (point) => ({
                            x: point.x + offsetX,
                            y: point.y + offsetY,
                        })
                    );
                    break;
                }
            }

            this.clearCanvas();
            return;
        }

        if (!this.clicked) return;

        const width = currentX - this.startX;
        const height = currentY - this.startY;

        if (this.selectedTool === "pencil") {
            if (this.currentPencilPoints.length > 0) {
                const lastPoint =
                    this.currentPencilPoints[
                        this.currentPencilPoints.length - 1
                    ];

                const dx = currentX - lastPoint.x;
                const dy = currentY - lastPoint.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance >= this.minDistance) {
                    this.currentPencilPoints.push({ x: currentX, y: currentY });
                }
            } else {
                this.currentPencilPoints.push({ x: currentX, y: currentY });
            }

            this.clearCanvas();
            return;
        }

        this.clearCanvas();
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.currentLineWidth;

        if (this.selectedTool === "rect") {
            this.ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (this.selectedTool === "circle") {
            const centerX = this.startX + width / 2;
            const centerY = this.startY + height / 2;
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();
        } else if (this.selectedTool === "line") {
            this.ctx.beginPath();
            this.ctx.moveTo(this.startX, this.startY);
            this.ctx.lineTo(currentX, currentY);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mousedownHandler);
        this.canvas.addEventListener("mouseup", this.mouseupHandler);
        this.canvas.addEventListener("mousemove", this.mousemoveHandler);
    }
}
