import React, { useEffect, useRef } from 'react';
import Engine from '../game/Engine';

export default function Game({ setUIState }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const engine = new Engine(canvas, setUIState);

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            engine.width = canvas.width;
            engine.height = canvas.height;
        };
        window.addEventListener('resize', handleResize);

        return () => {
            engine.cleanup();
            window.removeEventListener('resize', handleResize);
        };
    }, [setUIState]);

    return <canvas ref={canvasRef} style={{ display: 'block' }} />;
}