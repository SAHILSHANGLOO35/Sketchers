import { Canvas } from "@/components/Canvas";

export default async function CanvasPage({ params }: {
    params: {
        roomId: string
    }
}) {
    const roomId = (await params).roomId;
    console.log(roomId);

    return <Canvas roomId={roomId} />
}
