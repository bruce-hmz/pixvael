// @vitest-environment jsdom
// PixelConverter 组件核心交互测试(空状态/形态切换/锚点契约)。
// 刻意不触发真实上传(避免 canvas 2d + Web Worker 的浏览器依赖链),
// 聚焦"纯渲染可验证"的组件契约。

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, cleanup, waitFor } from '@testing-library/react';
import { PixelConverter } from '../src/components/PixelConverter';
import { DEFAULT_CROP } from '../src/lib/crop';
import { serializeProject } from '../src/lib/project-file';

beforeEach(() => {
  // jsdom 的 canvas getContext 返回 null;PixelConverter 空状态下不绘制,
  // 但 mount 后若有任何意外绘制路径,no-op context 可防止测试崩溃。
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    {} as unknown as CanvasRenderingContext2D,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('PixelConverter 空状态(上传前)', () => {
  it('pixel 模式渲染上传按钮、隐私芯片与工具标签', () => {
    render(<PixelConverter />);
    expect(screen.getByText('/ open tool')).toBeInTheDocument();
    expect(screen.getByText('Upload image')).toBeInTheDocument();
    expect(screen.getByText('local canvas')).toBeInTheDocument();
    expect(screen.getByText('no upload')).toBeInTheDocument();
  });

  it('minecraft planner 模式渲染规划器形态与"Choose a build image"', () => {
    render(<PixelConverter mode="minecraft" minecraftTool="planner" />);
    expect(screen.getByText('/ minecraft build planner')).toBeInTheDocument();
    expect(screen.getByText('Choose a build image')).toBeInTheDocument();
  });

  it('maker / converter 形态渲染各自的工具标签', () => {
    const { unmount } = render(
      <PixelConverter mode="minecraft" minecraftTool="maker" />,
    );
    expect(screen.getByText('/ minecraft block editor')).toBeInTheDocument();
    unmount();

    render(<PixelConverter mode="minecraft" minecraftTool="converter" />);
    expect(
      screen.getByText('/ minecraft conversion lab'),
    ).toBeInTheDocument();
  });

  it('根节点保留 id="tool" 锚点契约(Header/Footer #tool 链接依赖它)', () => {
    const { container } = render(<PixelConverter />);
    expect(container.querySelector('#tool')).not.toBeNull();
  });

  it('接受 defaultPaletteId / defaultPixelSize 初始值而不抛错', () => {
    render(
      <PixelConverter
        defaultPaletteId="retro"
        defaultPixelSize={8}
        inputId="pixvael-image-input"
      />,
    );
    expect(screen.getByText('/ open tool')).toBeInTheDocument();
  });

  it('generator 打开 map_art 工程后立即应用 Map Art 运行时语义', async () => {
    render(<PixelConverter mode="minecraft" minecraftTool="generator" />);
    expect(screen.getByText('/ minecraft pixel art generator')).toBeInTheDocument();
    const json = serializeProject({
      gridWidth: 128,
      gridHeight: 128,
      blockVersion: 'latest',
      blockIds: Array.from({ length: 128 * 128 }, (_, index) => index === 0 ? 'red-wool' : 'white-wool'),
      completedCells: [0],
      sourceImage: 'data:image/png;base64,aGVsbG8=',
      mode: 'map_art',
      edition: 'java',
      mapGrid: '1x1',
      crop: { ...DEFAULT_CROP, aspect: 'square', zoom: 1.5, offsetX: 0.1, offsetY: -0.1 },
      orientation: 'flat',
      exportFormat: 'litematic',
      dither: false,
    });
    const file = new File([json], 'map.json', { type: 'application/json' });
    if (!file.text) Object.defineProperty(file, 'text', { value: async () => json });
    fireEvent.change(screen.getByLabelText('Open a Pixvael project file'), {
      target: { files: [file] },
    });
    await waitFor(() => {
      expect(screen.getByText('/ minecraft map art generator')).toBeInTheDocument();
    });
    expect(screen.getByText('Choose an image for map art')).toBeInTheDocument();
  });
});
