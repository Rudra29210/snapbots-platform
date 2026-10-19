import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import Products from '@/pages/Products';
import FAQ from '@/pages/FAQ';
import Projects from '@/pages/Projects';
import Contact from '@/pages/Contact';
import { products } from '@/content/site';

const renderWithProviders = (ui: React.ReactNode, route = '/') =>
  render(
    <AuthProvider>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </AuthProvider>,
  );

describe('Products page', () => {
  it('lists every product by default', () => {
    renderWithProviders(<Products />);
    expect(screen.getByText(`${products.length} items`)).toBeInTheDocument();
  });

  it('filters by search text and reports the count politely', async () => {
    renderWithProviders(<Products />);
    await userEvent.type(screen.getByLabelText('Search products'), 'motor');
    expect(screen.getByText('1 item')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Motor driver boards' })).toBeInTheDocument();
  });

  it('shows an empty state with a working reset control', async () => {
    renderWithProviders(<Products />);
    await userEvent.type(screen.getByLabelText('Search products'), 'zzz-no-match');
    expect(screen.getByText('No products match')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByLabelText('Search products')).toHaveValue('');
    expect(screen.queryByText('No products match')).not.toBeInTheDocument();
  });

  it('labels catalogue items honestly and does not offer checkout', () => {
    renderWithProviders(<Products />);
    expect(screen.queryByRole('button', { name: /checkout|add to cart|buy/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('Demonstration').length).toBeGreaterThan(0);
  });
});

describe('FAQ page', () => {
  it('filters questions by keyword', async () => {
    renderWithProviders(<FAQ />);
    await userEvent.type(screen.getByLabelText('Search questions'), 'NDA');
    expect(screen.getByRole('button', { name: /NDAs/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /checkout/i })).not.toBeInTheDocument();
  });

  it('expands and collapses an answer with correct ARIA state', async () => {
    renderWithProviders(<FAQ />);
    const toggle = screen.getByRole('button', { name: /Do you sign NDAs/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Yes, on request/)).toBeInTheDocument();
  });
});

describe('Projects page', () => {
  it('searches by tag', async () => {
    renderWithProviders(<Projects />);
    await userEvent.type(screen.getByLabelText('Search projects'), 'IoT');
    expect(screen.getByRole('link', { name: /Environmental monitoring node/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Line-following/ })).not.toBeInTheDocument();
  });
});

describe('Navbar', () => {
  it('opens and closes the mobile menu with aria-expanded and Escape', async () => {
    renderWithProviders(<Navbar />);
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(within(screen.getByRole('navigation', { name: 'Mobile' })).getByText('Services')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('Contact page', () => {
  it('shows validation errors and does not submit an empty form', async () => {
    renderWithProviders(<Contact />, '/contact');
    await userEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect((await screen.findAllByRole('alert')).length).toBeGreaterThan(0);
    expect(screen.queryByText('Received and saved')).not.toBeInTheDocument();
  });

  it('pre-selects the category and subject from the URL', () => {
    renderWithProviders(<Contact />, '/contact?category=product&subject=Enquiry%3A%20Sensor%20modules');
    expect(screen.getByLabelText('What is this about?')).toHaveValue('product');
    expect(screen.getByLabelText('Subject')).toHaveValue('Enquiry: Sensor modules');
  });

  it('reports that submission is not connected when Firebase is absent', async () => {
    renderWithProviders(<Contact />, '/contact');
    await userEvent.type(screen.getByLabelText('Full name'), 'Asha Verma');
    await userEvent.type(screen.getByLabelText('Email'), 'asha@example.com');
    await userEvent.type(screen.getByLabelText('Subject'), 'Test enquiry');
    await userEvent.type(screen.getByLabelText('Message'), 'This is a long enough test message.');
    await userEvent.click(screen.getByLabelText(/I agree that SNAPBOTS/));
    await userEvent.click(screen.getByRole('button', { name: 'Send enquiry' }));
    expect(await screen.findByText(/not connected in this environment/)).toBeInTheDocument();
  });
});
