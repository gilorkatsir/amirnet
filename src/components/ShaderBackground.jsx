import { useRef, useEffect, useState } from 'react';

const VERTEX_SHADER = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;

  vec3 palette(float t) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
    float d = length(uv);
    vec3 col = palette(d + u_time * 0.15);

    d = sin(d * 6.0 + u_time * 0.4) / 6.0;
    d = abs(d);
    d = 0.02 / d;

    col *= d;
    gl_FragColor = vec4(col, 1.0);
  }
`;

const ShaderBackground = ({ opacity = 0.4, speed = 1.0 }) => {
    const canvasRef = useRef(null);
    const [fallback, setFallback] = useState(false);
    const prefersReducedMotion = typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext('webgl');
        if (!gl) {
            setFallback(true);
            return;
        }

        const compile = (type, src) => {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                gl.deleteShader(s);
                return null;
            }
            return s;
        };

        const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        if (!vs || !fs) { setFallback(true); return; }

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            setFallback(true);
            return;
        }
        gl.useProgram(prog);

        const posLoc = gl.getAttribLocation(prog, 'a_position');
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const uTime = gl.getUniformLocation(prog, 'u_time');
        const uRes = gl.getUniformLocation(prog, 'u_resolution');

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio, 2);
            canvas.width = canvas.clientWidth * dpr * 0.5;
            canvas.height = canvas.clientHeight * dpr * 0.5;
            gl.viewport(0, 0, canvas.width, canvas.height);
        };
        resize();
        window.addEventListener('resize', resize);

        let raf;
        const start = performance.now();

        const draw = (now) => {
            const t = ((now - start) / 1000) * speed;
            gl.uniform1f(uTime, t);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            if (!prefersReducedMotion) raf = requestAnimationFrame(draw);
        };

        draw(performance.now());

        return () => {
            window.removeEventListener('resize', resize);
            if (raf) cancelAnimationFrame(raf);
            gl.deleteBuffer(buf);
            gl.deleteProgram(prog);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
        };
    }, [speed, prefersReducedMotion]);

    if (fallback) {
        return (
            <div style={{
                position: 'fixed', inset: 0, zIndex: -1, opacity,
                background: 'radial-gradient(ellipse at 30% 50%, rgba(139,92,246,0.15), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(236,72,153,0.1), transparent 60%)',
            }} />
        );
    }

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed', inset: 0, zIndex: -1,
                width: '100%', height: '100%',
                opacity,
            }}
        />
    );
};

export default ShaderBackground;
