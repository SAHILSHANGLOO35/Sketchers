import { BACKEND_URL } from "@/config";
import axios from "axios";

type Shape = {
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
}

export async function initDraw( canvas: HTMLCanvasElement, roomId: string ) {
    const ctx = canvas.getContext("2d");

    let existingShapes: Shape[] = await getExistingShapes(roomId);

    if (!ctx) return;

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
        existingShapes.push({
            type: "rect",
            x: startX,
            y: startY,
            height,
            width
        });

        
    });

    canvas.addEventListener("mousemove", (e) => {
        if (clicked) {
            const width = e.clientX - startX;
            const height = e.clientY - startY;
            clearCanvas(existingShapes, canvas, ctx);
            ctx.strokeRect(startX, startY, width, height);
        }
    });
}

function clearCanvas(existingShapes: Shape[], canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    existingShapes.map((shape) => {
        if(shape.type === "rect") {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
    })
}

async function getExistingShapes(roomId: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message);
        return messageData;
    });
    return shapes;
}