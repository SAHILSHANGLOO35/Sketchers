import { BACKEND_URL } from "@/config";
import axios from "axios";

type Shape = | {
    type: "rect"
    x: number
    y: number
    width: number
    height: number
} | {
    type: "circle"
    centerX: number
    centerY: number
    radius: number
} | {
    type: "pencil"
    startX: number
    startY: number
    endX: Number
    endY: Number
}

export async function initDraw( canvas: HTMLCanvasElement, roomId: string, socket: WebSocket ) {
    const ctx = canvas.getContext("2d");

    let existingShapes: Shape[] = await getExistingShapes(roomId);

    if (!ctx) return;

    socket.onmessage = (event) => {
        const message = JSON.parse(event.data);

        if(message.type === "chat") {
            const parsedShape = JSON.parse(message.message);
            existingShapes.push(parsedShape.shape);
            clearCanvas(existingShapes, canvas, ctx);
        }
    }

    ctx.strokeStyle = "white";

    clearCanvas(existingShapes, canvas, ctx);

    let clicked = false;
    let startX = 0;
    let startY = 0;

    canvas.addEventListener("mousedown", (e) => {
        clicked = true;
        startX = e.clientX;
        startY = e.clientY;
    });

    canvas.addEventListener("mouseup", (e) => {
        clicked = false;
        const width = e.clientX - startX;
        const height = e.clientY - startY;

        // @ts-ignore
        const selectedTool = window.selectedTool;

        let shape: Shape | null = null;

        if(selectedTool === "rectangle") {
            shape = {
                type: "rect",
                x: startX,
                y: startY,
                height,
                width
            }
        } else if(selectedTool === "circle") {
            const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
            shape = {
                type: "circle",
                centerX: startX + width / 2,
                centerY: startY + height / 2,
                radius
            }
        }
        
        if(!shape) {
            return;
        }

        existingShapes.push(shape);


        socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({
                shape,
            }),
            roomId
        }))
        
    });

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            clearCanvas(existingShapes, canvas, ctx);
            // @ts-ignore
            const selectedTool = window.selectedTool;
            if(selectedTool === "rectangle") {
                ctx.strokeRect(startX, startY, width, height);
            } else if(selectedTool === "circle") {
                const centerX = startX + width / 2;
                const centerY = startY + height / 2;
                const radius = Math.sqrt(width ** 2 + height ** 2) / 2;
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
                ctx.stroke();
                ctx.beginPath();
                ctx.closePath();
            }
        }
    });
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    existingShapes.map((shape) => {
        if(shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        } else if(shape.type === "circle") {
            ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2)
            ctx.stroke();
            ctx.beginPath();
            ctx.closePath();
        }
    })
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message);
        return messageData.shape;
    });
    return shapes;
}