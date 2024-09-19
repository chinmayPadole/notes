import React, { useRef, useEffect } from "react";

// Utility functions to generate random values
const randomColor = (): string => {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const randomBetween = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Avatar Component
export const RandomAvatar: React.FC<{ onClick?: () => void }> = ({
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (ctx && canvas) {
      const width = canvas.width;
      const height = canvas.height;

      // Fill the background
      ctx.fillStyle = randomColor();
      ctx.fillRect(0, 0, width, height);

      // Generate random shapes
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
          randomBetween(0, width), // x position
          randomBetween(0, height), // y position
          randomBetween(10, 30), // radius
          0,
          2 * Math.PI
        );
        ctx.fillStyle = randomColor();
        ctx.fill();
      }

      // Add some squares
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = randomColor();
        ctx.fillRect(
          randomBetween(0, width - 50),
          randomBetween(0, height - 50),
          randomBetween(20, 50),
          randomBetween(20, 50)
        );
      }
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={100}
      onClick={onClick}
      style={{
        borderRadius: "50%",
        transform: "scale(0.8)",
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        cursor: "pointer",
      }}
    />
  );
};
