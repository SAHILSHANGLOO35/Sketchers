import { useEffect, useRef, useState } from "react";
import { 
  Circle, 
  Minus, 
  Pencil, 
  RectangleHorizontal, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Undo, 
  Redo, 
  Save, 
  Trash2, 
  Home, 
  Settings, 
  X, 
  Palette,
  Minimize2,
  Maximize2,
  Image as ImageIcon,
  Info,
  Grid,
  Check,
  ChevronUp,
  ChevronDown,
  Users
} from "lucide-react";
import { Game } from "@/draw/Game";

export type Tool = "pencil" | "rect" | "circle" | "line" | "pan" | "eraser" | "text" | "image";

// Define IconButton component since we're not using ShadCn UI
function IconButton({
  icon,
  activated = false,
  onClick,
  tooltip = "",
}: {
  icon: React.ReactNode;
  activated?: boolean;
  onClick: () => void;
  tooltip?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        className={`rounded-lg p-2 transition-colors ${
          activated ? "bg-white/20" : "hover:bg-white/10"
        }`}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {icon}
      </button>
      {showTooltip && tooltip && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
          {tooltip}
        </div>
      )}
    </div>
  );
}

const COLORS = [
  "#FF3B30", // Red
  "#FF9500", // Orange
  "#FFCC00", // Yellow
  "#34C759", // Green
  "#00C7BE", // Teal
  "#007AFF", // Blue
  "#5856D6", // Indigo
  "#AF52DE", // Purple
  "#FF2D55", // Pink
  "#FFFFFF", // White
  "#8E8E93", // Gray
  "#1D1D1F", // Black
];

export function Canvas({
  roomId,
  socket,
  userName = "Anonymous",
}: {
  roomId: string;
  socket: WebSocket;
  userName?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const gameRef = useRef<Game | null>(null);
  
  // Zoom and pan state
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // UI state
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [selectedColor, setSelectedColor] = useState<string>("#FFFFFF");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([userName]);
  const [showUsers, setShowUsers] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Handle resize specifically
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && gameRef.current) {
        // Store current canvas dimensions
        const prevWidth = canvasRef.current.width;
        const prevHeight = canvasRef.current.height;
        
        // Update canvas dimensions to match window
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        
        // Only redraw if dimensions actually changed
        if (prevWidth !== window.innerWidth || prevHeight !== window.innerHeight) {
          applyTransform();
        }
      }
    };

    // Initial setup
    handleResize();
    
    // Add resize listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Set tool when it changes
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.setTool(selectedTool);
      
      // Update cursor based on tool
      if (canvasRef.current) {
        switch (selectedTool) {
          case "pan":
            canvasRef.current.style.cursor = "grab";
            break;
          case "eraser":
            canvasRef.current.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\"><circle cx=\"10\" cy=\"10\" r=\"5\" fill=\"white\" stroke=\"black\" stroke-width=\"1\"/></svg>') 10 10, auto";
            break;
          case "pencil":
            canvasRef.current.style.cursor = "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"20\" height=\"20\" viewBox=\"0 0 20 20\"><circle cx=\"10\" cy=\"10\" r=\"3\" fill=\"" + selectedColor.replace("#", "%23") + "\" stroke=\"white\" stroke-width=\"1\"/></svg>') 10 10, auto";
            break;
          default:
            canvasRef.current.style.cursor = "crosshair";
        }
      }
    }
  }, [selectedTool, selectedColor]);

  // Initialize game once
  useEffect(() => {
    if (canvasRef.current) {
      // Set initial canvas dimensions
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
      
      // Create game instance and store in ref
      const game = new Game(canvasRef.current, roomId, socket);
      gameRef.current = game;
      
      // Set initial tool and color
      game.setTool(selectedTool);
      game.setColor(selectedColor);
      game.setLineWidth(lineWidth);

      // Apply initial transform
      applyTransform();

      // Set up socket listeners for user presence
      socket.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'userJoined') {
            setActiveUsers(prev => [...new Set([...prev, data.userName])]);
          } else if (data.type === 'userLeft') {
            setActiveUsers(prev => prev.filter(user => user !== data.userName));
          }
        } catch (e) {
          console.error('Error parsing socket message:', e);
        }
      });

      // Cleanup on unmount
      return () => {
        game.destroy();
        gameRef.current = null;
      }
    }
  }, [roomId, socket]);

  // Update game properties when they change
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.setColor(selectedColor);
      gameRef.current.setLineWidth(lineWidth);
    }
  }, [selectedColor, lineWidth]);

  // Apply transform function
  const applyTransform = () => {
    if (!canvasRef.current || !gameRef.current) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Reset transform
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Clear the canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Apply new transform
    ctx.setTransform(
      scale, 0,
      0, scale,
      offset.x, offset.y
    );
    
    // Update game class with transform values
    gameRef.current.setTransform(scale, offset.x, offset.y);
    
    // Redraw content
    gameRef.current.redraw();
  };

  // Effect to apply transform whenever scale or offset changes
  useEffect(() => {
    applyTransform();
  }, [scale, offset]);

  // Handle zoom
  const handleZoom = (factor: number) => {
    setScale(prevScale => {
      const newScale = prevScale * factor;
      // Limit scale to reasonable bounds
      return Math.min(Math.max(newScale, 0.1), 10);
    });
  };

  // Reset view to default
  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  // Handle wheel event for panning and zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    
    // Check if it's a trackpad gesture by looking at deltaMode and ctrlKey
    // deltaMode === 0 indicates pixels (usually trackpad)
    // ctrlKey is false for trackpad gestures, true for pinch-zoom
    if (e.deltaMode === 0 && !e.ctrlKey) {
      // Trackpad gesture - use for panning
      setOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    } else {
      // Mouse wheel or pinch zoom - use for zooming
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(Math.max(scale * factor, 0.1), 10);
      
      const newOffsetX = mouseX - (mouseX - offset.x) * (newScale / scale);
      const newOffsetY = mouseY - (mouseY - offset.y) * (newScale / scale);
      
      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    }
  };

  // Handle mouse down for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (selectedTool === "pan") {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      if (canvasRef.current) {
        canvasRef.current.style.cursor = "grabbing";
      }
    }
  };

  // Handle mouse move for panning
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedTool === "pan") {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      
      setOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  // Handle mouse up for panning
  const handleMouseUp = () => {
    if (isDragging && selectedTool === "pan" && canvasRef.current) {
      canvasRef.current.style.cursor = "grab";
    }
    setIsDragging(false);
  };

  // Handle undo/redo
  const handleUndo = () => {
    if (gameRef.current) {
      gameRef.current.undo();
    }
  };

  const handleRedo = () => {
    if (gameRef.current) {
      gameRef.current.redo();
    }
  };

  // Handle save
  const handleSave = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataURL;
      a.download = `whiteboard-${roomId}-${new Date().toISOString().slice(0, 10)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Handle clear
  const handleClear = () => {
    if (gameRef.current && confirm("Are you sure you want to clear the entire canvas?")) {
      gameRef.current.clear();
    }
  };

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Handle grid toggle
  const toggleGrid = () => {
    setShowGrid(!showGrid);
    if (gameRef.current) {
      gameRef.current.toggleGrid(!showGrid);
    }
  };

  return (
    <div className="overflow-hidden h-screen text-white">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full bg-gray-900"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      ></canvas>
      
      {/* Top toolbar */}
      <div
        className="fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 border border-white/15 py-2 px-3 rounded-xl shadow-lg backdrop-blur-sm"
        style={{ backgroundColor: "rgba(36, 36, 36, 0.8)" }}
      >
        <IconButton
          icon={<Pencil size={16} />}
          activated={selectedTool === "pencil"}
          onClick={() => setSelectedTool("pencil")}
          tooltip="Pencil"
        />
        
        <IconButton
          icon={<Circle size={16} />}
          activated={selectedTool === "circle"}
          onClick={() => setSelectedTool("circle")}
          tooltip="Circle"
        />
        
        <IconButton
          icon={<RectangleHorizontal size={16} />}
          activated={selectedTool === "rect"}
          onClick={() => setSelectedTool("rect")}
          tooltip="Rectangle"
        />
        
        <IconButton
          icon={<Minus size={16} />}
          activated={selectedTool === "line"}
          onClick={() => setSelectedTool("line")}
          tooltip="Line"
        />
        
        <IconButton
          icon={<Trash2 size={16} />}
          activated={selectedTool === "eraser"}
          onClick={() => setSelectedTool("eraser")}
          tooltip="Eraser"
        />
        
        <div className="border-l border-white/15 h-6 mx-1"></div>
        
        <IconButton
          icon={<Move size={16} />}
          activated={selectedTool === "pan"}
          onClick={() => setSelectedTool("pan")}
          tooltip="Pan"
        />
        
        <IconButton
          icon={<ZoomIn size={16} />}
          onClick={() => handleZoom(1.1)}
          tooltip="Zoom In"
        />
        
        <IconButton
          icon={<ZoomOut size={16} />}
          onClick={() => handleZoom(0.9)}
          tooltip="Zoom Out"
        />
        
        <IconButton
          icon={<Home size={16} />}
          onClick={resetView}
          tooltip="Reset View"
        />
        
        <div className="text-xs opacity-80 ml-1 min-w-8 text-center">
          {Math.round(scale * 100)}%
        </div>
      </div>
      
      {/* Left toolbar */}
      <div
        className="fixed left-4 top-1/2 transform -translate-y-1/2 flex flex-col items-center gap-2 border border-white/15 py-3 px-2 rounded-xl shadow-lg backdrop-blur-sm"
        style={{ backgroundColor: "rgba(36, 36, 36, 0.8)" }}
      >
        <IconButton
          icon={<Undo size={16} />}
          onClick={handleUndo}
          tooltip="Undo"
        />
        
        <IconButton
          icon={<Redo size={16} />}
          onClick={handleRedo}
          tooltip="Redo"
        />
        
        <div className="border-t border-white/15 w-6 my-1"></div>
        
        <IconButton
          icon={<Save size={16} />}
          onClick={handleSave}
          tooltip="Save"
        />
        
        <IconButton
          icon={<X size={16} />}
          onClick={handleClear}
          tooltip="Clear Canvas"
        />
        
        <div className="border-t border-white/15 w-6 my-1"></div>
        
        <IconButton
          icon={<Grid size={16} />}
          activated={showGrid}
          onClick={toggleGrid}
          tooltip="Toggle Grid"
        />
        
        <IconButton
          icon={isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          onClick={toggleFullscreen}
          tooltip={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        />
        
        <IconButton
          icon={<Settings size={16} />}
          activated={showSettings}
          onClick={() => setShowSettings(!showSettings)}
          tooltip="Settings"
        />
      </div>
      
      {/* Bottom toolbar - Color picker and line width */}
      <div
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 border border-white/15 py-2 px-3 rounded-xl shadow-lg backdrop-blur-sm"
        style={{ backgroundColor: "rgba(36, 36, 36, 0.8)" }}
      >
        {/* Color picker toggle */}
        <div className="relative">
          <button 
            className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center"
            style={{ backgroundColor: selectedColor }}
            onClick={() => setShowColorPicker(!showColorPicker)}
          >
            <Palette 
              size={14} 
              className={selectedColor === "#1D1D1F" ? "text-white" : "text-black"} 
            />
          </button>
          
          {/* Color picker dropdown */}
          {showColorPicker && (
            <div 
              className="absolute bottom-full mb-2 bg-gray-800 p-2 rounded-lg border border-white/15 shadow-lg z-10"
              style={{ left: "50%", transform: "translateX(-50%)" }}
            >
              <div className="grid grid-cols-6 gap-1 w-64">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      setSelectedColor(color);
                      setShowColorPicker(false);
                    }}
                  >
                    {color === selectedColor && (
                      <Check size={12} className={color === "#1D1D1F" ? "text-white" : "text-black"} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Line width control */}
        <div className="h-8 flex items-center w-32 mx-2">
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-full"
          />
        </div>
        
        <div className="text-xs opacity-80 ml-1 min-w-8 text-center">
          {lineWidth}px
        </div>
      </div>
      
      {/* Settings panel */}
      {showSettings && (
        <div
          className="fixed right-4 top-1/2 transform -translate-y-1/2 border border-white/15 p-4 rounded-xl shadow-lg backdrop-blur-sm w-64"
          style={{ backgroundColor: "rgba(36, 36, 36, 0.95)" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Settings</h3>
            <button
              className="p-1 rounded-lg hover:bg-white/10"
              onClick={() => setShowSettings(false)}
            >
              <X size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm opacity-80 block mb-1">Room ID</label>
              <div className="text-sm bg-white/5 p-2 rounded border border-white/10 flex items-center">
                <Info size={12} className="mr-2 opacity-50" />
                {roomId}
              </div>
            </div>
            
            <div>
              <label className="text-sm opacity-80 block mb-1">Your Name</label>
              <div className="text-sm bg-white/5 p-2 rounded border border-white/10">
                {userName}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm opacity-80 flex items-center">
                  <Users size={12} className="mr-1" />
                  Users ({activeUsers.length})
                </label>
                <button
                  className="text-xs flex items-center opacity-80 hover:opacity-100"
                  onClick={() => setShowUsers(!showUsers)}
                >
                  {showUsers ? (
                    <>
                      Hide <ChevronUp size={12} className="ml-1" />
                    </>
                  ) : (
                    <>
                      Show <ChevronDown size={12} className="ml-1" />
                    </>
                  )}
                </button>
              </div>
              
              {showUsers && (
                <div className="text-sm bg-white/5 p-2 rounded border border-white/10 max-h-32 overflow-y-auto">
                  {activeUsers.map((user, index) => (
                    <div key={index} className="py-1 border-b border-white/5 last:border-0">
                      {user}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Room info */}
      <div className="fixed top-4 right-4 text-xs opacity-60 bg-black/40 px-3 py-1.5 rounded-full flex items-center">
        <Users size={12} className="mr-1.5" />
        {activeUsers.length}
        <span className="mx-1">|</span>
        <span className="opacity-80">Room: {roomId}</span>
      </div>
    </div>
  );
}

export default Canvas;