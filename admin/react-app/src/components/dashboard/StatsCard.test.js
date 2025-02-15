import React from 'react';
import { render, screen, fireEvent } from '../../test/test-utils';
import StatsCard from './StatsCard';

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total Appointments',
    value: 150,
    icon: <div data-testid="mock-icon" />,
    description: 'Total number of appointments',
    trend: 25,
    trendLabel: 'vs last month',
    color: 'primary',
  };

  it('renders with all props correctly', () => {
    render(<StatsCard {...defaultProps} />);

    // Check title
    expect(screen.getByText('Total Appointments')).toBeInTheDocument();

    // Check value
    expect(screen.getByText('150')).toBeInTheDocument();

    // Check icon
    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();

    // Check description
    expect(screen.getByText('Total number of appointments')).toBeInTheDocument();

    // Check trend
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
  });

  it('shows loading state correctly', () => {
    render(<StatsCard {...defaultProps} loading={true} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error state correctly', () => {
    const error = 'Failed to load data';
    render(<StatsCard {...defaultProps} error={error} />);
    expect(screen.getByText(error)).toBeInTheDocument();
  });

  it('displays positive trend with correct color', () => {
    render(<StatsCard {...defaultProps} trend={25} />);
    const trendElement = screen.getByText('25%').parentElement;
    expect(trendElement).toHaveStyle({ color: expect.stringMatching(/success|#/) });
  });

  it('displays negative trend with correct color', () => {
    render(<StatsCard {...defaultProps} trend={-25} />);
    const trendElement = screen.getByText('25%').parentElement;
    expect(trendElement).toHaveStyle({ color: expect.stringMatching(/error|#/) });
  });

  it('displays progress bar correctly', () => {
    render(<StatsCard {...defaultProps} progress={75} />);
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute('aria-valuenow', '75');
  });

  it('handles undefined trend gracefully', () => {
    const { container } = render(<StatsCard {...defaultProps} trend={undefined} />);
    expect(container.querySelector('[data-testid="trend-indicator"]')).not.toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<StatsCard {...defaultProps} onClick={handleClick} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies custom color correctly', () => {
    const customColor = 'secondary';
    render(<StatsCard {...defaultProps} color={customColor} />);
    
    const icon = screen.getByTestId('mock-icon').closest('.MuiBox-root');
    expect(icon).toHaveStyle({ 
      backgroundColor: expect.stringMatching(/secondary|#/)
    });
  });

  describe('responsive behavior', () => {
    it('adjusts layout for mobile screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400,
      });

      window.dispatchEvent(new Event('resize'));

      const { container } = render(<StatsCard {...defaultProps} />);
      const card = container.firstChild;

      expect(card).toHaveStyle({ 
        flexDirection: expect.stringMatching(/column|block/) 
      });
    });

    it('adjusts layout for desktop screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      window.dispatchEvent(new Event('resize'));

      const { container } = render(<StatsCard {...defaultProps} />);
      const card = container.firstChild;

      expect(card).toHaveStyle({ 
        flexDirection: expect.stringMatching(/row|flex/) 
      });
    });
  });

  describe('accessibility', () => {
    it('has correct ARIA attributes', () => {
      render(<StatsCard {...defaultProps} />);
      
      // Check for proper heading structure
      expect(screen.getByRole('heading', { name: 'Total Appointments' }))
        .toBeInTheDocument();

      // Check for proper button role when clickable
      const card = screen.getByRole('button');
      expect(card).toHaveAttribute('tabindex', '0');
    });

    it('supports keyboard navigation', () => {
      const handleClick = jest.fn();
      render(<StatsCard {...defaultProps} onClick={handleClick} />);
      
      const card = screen.getByRole('button');
      card.focus();
      fireEvent.keyDown(card, { key: 'Enter' });
      
      expect(handleClick).toHaveBeenCalled();
    });
  });
});
