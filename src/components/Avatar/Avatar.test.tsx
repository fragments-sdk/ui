import { describe, it, expect } from 'vitest';
import { render, screen, expectNoA11yViolations } from '../../test/utils';
import { Avatar } from './index';

describe('Avatar', () => {
  it('renders an image when src is provided', () => {
    render(<Avatar src="https://example.com/photo.jpg" alt="Jane Doe" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
    expect(img).toHaveAttribute('alt', 'Jane Doe');
  });

  it('renders initials from the name prop when no src', () => {
    render(<Avatar name="John Smith" />);
    expect(screen.getByText('JS')).toBeInTheDocument();
  });

  it('renders explicit initials prop over name-derived initials', () => {
    render(<Avatar name="John Smith" initials="AB" />);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('renders Avatar.Group and limits visible avatars with max', () => {
    render(
      <Avatar.Group max={2}>
        <Avatar name="Alice" />
        <Avatar name="Bob" />
        <Avatar name="Charlie" />
        <Avatar name="Diana" />
      </Avatar.Group>
    );
    // 2 visible + 1 overflow indicator
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Avatar name="Jane Doe" />);
    await expectNoA11yViolations(container);
  });
});
