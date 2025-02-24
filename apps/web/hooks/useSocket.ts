import { useEffect, useState } from "react";
import { WS_URL } from "../config";


export function useSocket() {
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState<WebSocket>();

    useEffect(() => {
        const ws = new WebSocket(WS_URL as string);
        ws.onopen = () => {
            setLoading(false);
            setSocket(ws);
        }

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    
        ws.onclose = () => {
            console.log("WebSocket closed");
            setLoading(true);
            setSocket(undefined);
        };
    
        return () => {
            ws.close();
        };
    }, []);

    return {
        socket,
        loading
    }
}