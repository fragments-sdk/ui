import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, expectNoA11yViolations } from '../../test/utils';
import { Image } from './index';

describe('Image', () => {
  it('renders an img element with src and alt', () => {
    render(<Image src="/photo.jpg" alt="A photo" />);
    const img = screen.getByRole('img', { name: 'A photo' });
    expect(img).toHaveAttribute('src', '/photo.jpg');
  });

  it('shows fallback while loading', () => {
    render(<Image src="/photo.jpg" alt="Photo" fallback={<span>Loading...</span>} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    // Image should be present but hidden (opacity 0)
    const img = screen.getByRole('img');
    expect(img.style.opacity).toBe('0');
  });

  it('shows fallback on error', () => {
    render(<Image src="/broken.jpg" alt="Broken" fallback={<span>Error</span>} />);
    const img = screen.getByRole('img');
    // Simulate error
    act(() => {
      img.dispatchEvent(new Event('error', { bubbles: false }));
    });
    expect(screen.getByText('Error')).toBeInTheDocument();
  });

  it('applies aspect ratio class', () => {
    const { container } = render(<Image src="/photo.jpg" alt="Photo" aspectRatio="16:9" />);
    expect(container.firstChild).toHaveClass('aspect-16-9');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Image src="/photo.jpg" alt="Accessible photo" />);
    await expectNoA11yViolations(container);
  });

  it('forwards root props and imgProps and fires image event callbacks', () => {
    const onImageLoad = vi.fn();
    const onImageError = vi.fn();

    render(
      <Image
        src="/photo.jpg"
        alt="Photo"
        data-testid="container"
        imgProps={{ loading: 'lazy', decoding: 'async', crossOrigin: 'anonymous' }}
        onImageLoad={onImageLoad}
        onImageError={onImageError}
      />
    );

    const container = screen.getByTestId('container');
    const img = screen.getByRole('img');
    expect(container).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
    expect(img).toHaveAttribute('crossorigin', 'anonymous');

    act(() => {
      img.dispatchEvent(new Event('load', { bubbles: false }));
      img.dispatchEvent(new Event('error', { bubbles: false }));
    });

    expect(onImageLoad).toHaveBeenCalledTimes(1);
    expect(onImageError).toHaveBeenCalledTimes(1);
  });
});
