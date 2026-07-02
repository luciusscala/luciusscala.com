"use client";

import { useEffect, useRef } from "react";

const SIM_SCALE = 0.5; // sim resolution relative to canvas

const VERT = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

// Direct port of your Buffer A
const SIM_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform vec3 uMouse;   // xy = sim pixels, z > 0 while pointer is held
uniform float uRadius; // ripple radius in sim pixels
out vec4 o;

const float delta = 1.0;

void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  ivec2 sz = textureSize(uState, 0);

  vec4 data = texelFetch(uState, c, 0);
  float pressure = data.x;
  float pVel = data.y;

  float p_right = texelFetch(uState, c + ivec2( 1, 0), 0).x;
  float p_left  = texelFetch(uState, c + ivec2(-1, 0), 0).x;
  float p_up    = texelFetch(uState, c + ivec2( 0, 1), 0).x;
  float p_down  = texelFetch(uState, c + ivec2( 0,-1), 0).x;

  // Free (non-fixed) screen boundaries
  if (c.x == 0)        p_left  = p_right;
  if (c.x == sz.x - 1) p_right = p_left;
  if (c.y == 0)        p_down  = p_up;
  if (c.y == sz.y - 1) p_up    = p_down;

  // Horizontal + vertical wave function
  pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
  pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;

  pressure += delta * pVel;

  // Spring motion (water-like, not sound-like)
  pVel -= 0.005 * delta * pressure;

  // Damping
  pVel *= 1.0 - 0.002 * delta;
  pressure *= 0.999;

  o = vec4(pressure, pVel, (p_right - p_left) / 2.0, (p_up - p_down) / 2.0);

  if (uMouse.z > 0.5) {
    float dist = distance(gl_FragCoord.xy, uMouse.xy);
    if (dist <= uRadius) {
      o.x += 1.0 - dist / uRadius;
    }
  }
}`;

// Direct port of your Image pass (glint + optional refracted texture)
const RENDER_FRAG = `#version 300 es
precision highp float;
uniform sampler2D uState;
uniform sampler2D uTex;
uniform int uHasTex;
uniform vec2 uRes;
out vec4 o;

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec4 data = texture(uState, uv);

  // Sunlight glint — identical to the Shadertoy
  vec3 normal = normalize(vec3(-data.z, 0.2, -data.w));
  float glint = pow(max(0.0, dot(normal, normalize(vec3(-3.0, 10.0, 3.0)))), 60.0);

  if (uHasTex == 1) {
    // Color = refracted background texture, exactly like the Shadertoy
    vec3 col = texture(uTex, uv + 0.2 * data.zw).rgb + vec3(glint);
    o = vec4(col, 1.0);
  } else {
    // Transparent overlay: glint only (subtract flat-water baseline
    // so the screen is fully clear when calm)
    float a = clamp(glint - 0.0075, 0.0, 1.0);
    o = vec4(vec3(a), a); // premultiplied
  }
}`;

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
    throw new Error(gl.getShaderInfoLog(s) ?? "shader error");
  return s;
}

function program(gl: WebGL2RenderingContext, fs: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(p) ?? "link error");
  return p;
}

export default function WaterRipple({
  backgroundSrc,
}: {
  /** Optional: image URL to refract, exactly like iChannel1 in the Shadertoy.
   *  When set, the canvas renders opaque and should sit BEHIND your content. */
  backgroundSrc?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
    });
    if (!gl) return;
    if (!gl.getExtension("EXT_color_buffer_float")) return;

    const simProg = program(gl, SIM_FRAG);
    const renderProg = program(gl, RENDER_FRAG);
    const vao = gl.createVertexArray();

    const dpr = Math.min(window.devicePixelRatio, 2);
    let simW = 0,
      simH = 0;
    let textures: WebGLTexture[] = [];
    let fbos: WebGLFramebuffer[] = [];
    let curr = 0,
      next = 1;

    const makeTargets = () => {
      textures.forEach((t) => gl.deleteTexture(t));
      fbos.forEach((f) => gl.deleteFramebuffer(f));
      textures = [];
      fbos = [];
      for (let i = 0; i < 2; i++) {
        const t = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, t);
        // zero-initialized = the iFrame == 0 reset
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, simW, simH, 0, gl.RGBA, gl.HALF_FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const f = gl.createFramebuffer()!;
        gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        textures.push(t);
        fbos.push(f);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    };

    const resize = () => {
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      simW = Math.max(2, Math.floor(canvas.width * SIM_SCALE));
      simH = Math.max(2, Math.floor(canvas.height * SIM_SCALE));
      makeTargets();
    };
    resize();
    window.addEventListener("resize", resize);

    // Optional background texture (iChannel1)
    let bgTex: WebGLTexture | null = null;
    if (backgroundSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        bgTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, bgTex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      };
      img.src = backgroundSrc;
    }

    // Mouse: continuous injection while held, like iMouse.z > 1.0
    const mouse = { x: 0, y: 0, down: false };
    const setPos = (e: PointerEvent) => {
      mouse.x = e.clientX * dpr * SIM_SCALE;
      mouse.y = simH - e.clientY * dpr * SIM_SCALE; // flip Y for GL
    };
    const onDown = (e: PointerEvent) => {
      setPos(e);
      mouse.down = true;
    };
    const onMove = (e: PointerEvent) => setPos(e);
    const onUp = () => (mouse.down = false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    const radius = 20.0 * dpr * SIM_SCALE; // ~20 css px, like the Shadertoy

    let raf = 0;
    const frame = () => {
      gl.bindVertexArray(vao);

      // --- simulation pass ---
      gl.disable(gl.BLEND);
      gl.viewport(0, 0, simW, simH);
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbos[next]);
      gl.useProgram(simProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[curr]);
      gl.uniform1i(gl.getUniformLocation(simProg, "uState"), 0);
      gl.uniform3f(
        gl.getUniformLocation(simProg, "uMouse"),
        mouse.x,
        mouse.y,
        mouse.down ? 1 : 0
      );
      gl.uniform1f(gl.getUniformLocation(simProg, "uRadius"), radius);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      [curr, next] = [next, curr];

      // --- render pass ---
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.useProgram(renderProg);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, textures[curr]);
      gl.uniform1i(gl.getUniformLocation(renderProg, "uState"), 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, bgTex);
      gl.uniform1i(gl.getUniformLocation(renderProg, "uTex"), 1);
      gl.uniform1i(gl.getUniformLocation(renderProg, "uHasTex"), bgTex ? 1 : 0);
      gl.uniform2f(gl.getUniformLocation(renderProg, "uRes"), canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [backgroundSrc]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 h-svh w-full ${
        backgroundSrc ? "-z-10" : "z-50"
      }`}
    />
  );
}