"use client"
import { Pen } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import {PenOptions} from "./PenOptions"

const DrawBoard = () => {
    const screenRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)


     

    
     useEffect(() => {
           const screen = screenRef.current
           const canvas = canvasRef.current
           const { width, height } = screen?.getBoundingClientRect() || { width: 0, height: 0 }
            canvas?.setAttribute('width', `${width}`)
            canvas?.setAttribute('height', `${height}`)
            const ctx = canvas?.getContext('2d')
                
             if (!ctx) return

             canvas?.addEventListener('mousedown', (e) => {
               
             })

           


     }, [canvasRef])
  return (
    <div className="w-full h-screen" ref={screenRef}>
      <canvas ref={canvasRef}  id="draw-board">
      <PenOptions activeTool="pen" onSelectTool={(tool) => console.log(tool)} />
      </canvas>
    </div>
   
  )
}

export default DrawBoard