// Signature generator for high-resolution executive fountain-pen signatures

export interface SignatureOptions {
  name: string;
  style?: 'executive' | 'academic';
  inkColor?: string;
  width?: number;
  height?: number;
}

export function createSignatureDataUrl(options: SignatureOptions): Promise<string | null> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(null);
  }

  const {
    name,
    style = 'executive',
    inkColor = '#0d254c', // Royal Executive Ink Navy
    width = 600,
    height = 180
  } = options;

  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(null);

      // Function to render signature once fonts are active
      const render = () => {
        ctx.clearRect(0, 0, width, height);

        ctx.save();
        // Slight natural handwriting tilt
        ctx.translate(width / 2, height / 2 - 10);
        ctx.rotate(style === 'executive' ? -0.045 : -0.035); // ~ -2.5 to -2 degrees

        // Primary cursive font hierarchy
        ctx.font = 'italic 62px "Alex Brush", "Great Vibes", "Dancing Script", "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Ink effect with subtle shadow
        ctx.shadowColor = 'rgba(13, 37, 76, 0.25)';
        ctx.shadowBlur = 1.5;
        ctx.shadowOffsetX = 0.5;
        ctx.shadowOffsetY = 0.5;

        ctx.fillStyle = inkColor;
        ctx.fillText(name, 0, 0);

        // Reset shadow for fine swashes
        ctx.shadowColor = 'transparent';

        // Calligraphic flourish / underline swash
        ctx.strokeStyle = inkColor;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (style === 'executive') {
          // Engr Nadeem Ali - Elegant executive swash
          ctx.beginPath();
          ctx.lineWidth = 2.4;
          ctx.moveTo(-160, 22);
          // Flowing bezier under the name
          ctx.bezierCurveTo(-90, 28, 40, 16, 150, 26);
          // Return tail loop
          ctx.bezierCurveTo(175, 29, 185, 23, 175, 14);
          ctx.bezierCurveTo(160, 6, 120, 18, 145, 28);
          ctx.stroke();

          // Subtle ink dot
          ctx.beginPath();
          ctx.arc(188, 26, 2.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Dr. S. A. Rehman - Distinguished academic controller swash
          ctx.beginPath();
          ctx.lineWidth = 2.2;
          ctx.moveTo(-150, 24);
          ctx.bezierCurveTo(-60, 16, 20, 30, 130, 22);
          ctx.bezierCurveTo(160, 19, 175, 26, 165, 30);
          ctx.stroke();

          // Double accent ink dots
          ctx.beginPath();
          ctx.arc(176, 28, 2, 0, Math.PI * 2);
          ctx.arc(184, 27, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        resolve(canvas.toDataURL('image/png'));
      };

      // If document.fonts API is available, wait for font loading
      if ('fonts' in document && document.fonts.ready) {
        document.fonts.ready.then(() => {
          setTimeout(render, 50);
        }).catch(() => {
          render();
        });
      } else {
        render();
      }
    } catch {
      resolve(null);
    }
  });
}
