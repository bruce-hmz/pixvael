// @vitest-environment jsdom
// 新版转换器 PixelStudio 的界面契约。和 pixel-converter.test 一样不跑真实转换
// (jsdom 没有 canvas 和 Worker),只验证控件、状态切换和锚点。

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PixelStudio } from '../src/components/studio/PixelStudio';
import { isStudioPath } from '../src/lib/studio';

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
    {} as unknown as CanvasRenderingContext2D,
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('PixelStudio', () => {
  it('keeps the #tool anchor and the shared file input id', () => {
    const { container } = render(<PixelStudio />);
    expect(container.querySelector('#tool')).not.toBeNull();
    expect(container.querySelector('#pixvael-image-input')).not.toBeNull();
  });

  it('shows upload, samples and download controls before any conversion', () => {
    render(<PixelStudio />);
    expect(screen.getByRole('button', { name: /upload your image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Portrait' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download png/i })).toBeDisabled();
    expect(screen.getByText('Loading sample…')).toBeInTheDocument();
  });

  it('starts in compare view with the default palette selected', () => {
    render(<PixelStudio defaultPaletteId="retro" />);
    expect(screen.getByRole('button', { name: 'Compare' })).toHaveAttribute('aria-pressed', 'true');
    const retro = screen.getAllByRole('button', { name: /PICO-8/ });
    expect(retro[0]).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches palette, block size and view from the controls', () => {
    render(<PixelStudio />);
    fireEvent.click(screen.getAllByRole('button', { name: /Game Boy/ })[0]);
    expect(screen.getAllByRole('button', { name: /Game Boy/ })[0]).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(screen.getByRole('button', { name: '24 pixel blocks' }));
    expect(screen.getByText('24 px')).toBeInTheDocument();
    expect(screen.getByLabelText('Block size')).toHaveValue('24');

    fireEvent.click(screen.getByRole('button', { name: 'Original' }));
    expect(screen.getByRole('button', { name: 'Original' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('toggles dithering and the preview grid as switches', () => {
    render(<PixelStudio />);
    const dither = screen.getByRole('switch', { name: /dithering/i });
    expect(dither).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(dither);
    expect(dither).toHaveAttribute('aria-checked', 'true');
  });

  it('rejects files that are not images', () => {
    const { container } = render(<PixelStudio />);
    const input = container.querySelector('#pixvael-image-input') as HTMLInputElement;
    const file = new File(['hello'], 'notes.txt', { type: 'text/plain' });
    fireEvent.change(input, { target: { files: [file] } });
    expect(screen.getByRole('alert')).toHaveTextContent(/image file/i);
  });
});

describe('isStudioPath', () => {
  it('matches migrated pages with or without a trailing slash', () => {
    expect(isStudioPath('/image-to-pixel-art')).toBe(true);
    expect(isStudioPath('/image-to-pixel-art/')).toBe(true);
    expect(isStudioPath('/')).toBe(false);
    expect(isStudioPath('/minecraft-pixel-art')).toBe(false);
    expect(isStudioPath(null)).toBe(false);
  });
});

describe('PixelLanding variants', () => {
  it('renders the studio converter when a pixel page opts in', async () => {
    const { PixelLanding } = await import('../src/components/PixelLanding');
    const { container } = render(
      <PixelLanding variant="studio" eyebrow="/ test" title="Test page" description="Desc" />,
    );
    expect(container.querySelector('[data-theme="studio"]')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 1, name: 'Test page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /upload your image/i })).toBeInTheDocument();
  });

  it('keeps the classic layout by default (homepage and Minecraft pages)', async () => {
    const { PixelLanding } = await import('../src/components/PixelLanding');
    const { container } = render(
      <PixelLanding eyebrow="/ test" title="Test page" description="Desc" />,
    );
    expect(container.querySelector('[data-theme="studio"]')).toBeNull();
    expect(screen.getByText('/ open tool')).toBeInTheDocument();
  });
});
