import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Square, Circle, 
  PenTool, Eraser, ChevronUp, ChevronDown,
  Type, Move,  
} from 'lucide-react';

interface PenOptionsProps {
  activeTool: string;
  onSelectTool: (tool: string) => void;
}

export const PenOptions: React.FC<PenOptionsProps> = ({ activeTool, onSelectTool }) => {
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const dragOriginRef = useRef({ x: 0, y: 0 });
  
  const handleMouseDown = (e: React.MouseEvent) => {
   
    if ((e.target as Element).closest('.toolbar-header')) {
      setIsDragging(true);
      dragOriginRef.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOriginRef.current.x,
        y: e.clientY - dragOriginRef.current.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMouseMove = (e: MouseEvent) => {
        setPosition({
          x: e.clientX - dragOriginRef.current.x,
          y: e.clientY - dragOriginRef.current.y
        });
      };

      const handleGlobalMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging]);

  const tools = [
    { id: 'pen', icon: <PenTool />, label: 'Pen' },
    { id: 'rectangle', icon: <Square />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle />, label: 'Circle' },
    
    { id: 'text', icon: <Type />, label: 'Text' },
  
    { id: 'eraser', icon: <Eraser />, label: 'Eraser' },
  ];

  return (
    <motion.div 
      className="absolute z-50"
      style={{ top: position.y, left: position.x }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 overflow-hidden">
        
        <div 
          className="toolbar-header flex items-center justify-between px-3 py-2 bg-neutral-700 border-b border-neutral-600" 
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div className="flex items-center gap-1.5 text-sm font-medium text-white">
            <Move size={14} className="text-gray-400" />
            Drawing Tools
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)} 
            className="p-1 hover:bg-neutral-600 rounded focus:outline-none"
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
        
        
        {!collapsed && (
          <div className="p-2">
            <div className="grid grid-cols-5 gap-1 ">
              {tools.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className={`
                    flex flex-col items-center justify-center p-2 rounded transition-colors
                    ${activeTool === tool.id 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-neutral-700'}
                  `}
                  title={tool.label}
                >
                  <div className="mb-1">{tool.icon}</div>
                  <span className="text-xs">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PenOptions;