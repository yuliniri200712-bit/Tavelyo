// @vitest-environment jsdom
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeAll, expect, it, vi } from 'vitest';
import type { PaymentInput } from '../domain/index.ts';
import { PaymentForm } from './PaymentForm.tsx';

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
  };
});

it.each(['Datáfono', 'Transferencia'])(
  'revisa %s sin turno y conserva la clave al reintentar el mismo cobro',
  async (method) => {
    const pay = vi
      .fn<(input: PaymentInput) => Promise<boolean>>()
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    render(
      <PaymentForm
        amountMinor="3200000"
        suggestedTipMinor="320000"
        revision="r1"
        cashTillOpen={false}
        onPay={pay}
      />,
    );
    fireEvent.click(screen.getByLabelText(method));
    const review = screen.getByRole('button', { name: 'Revisar cobro' });
    fireEvent.click(review);
    expect(screen.getByLabelText('Número de comprobante').getAttribute('aria-invalid')).toBe(
      'true',
    );
    fireEvent.change(screen.getByLabelText('Número de comprobante'), {
      target: { value: 'T-100' },
    });
    fireEvent.change(screen.getByLabelText('Propina (pesos, voluntaria)'), {
      target: { value: '2000' },
    });
    fireEvent.click(review);
    const dialog = screen.getByRole('dialog');
    expect(dialog.textContent).toMatch(/Total\s*\$\s*34\.000/);
    expect(pay).not.toHaveBeenCalled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Registrar cobro' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(review);
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Registrar cobro' }),
    );
    await waitFor(() => expect(review.hasAttribute('disabled')).toBe(true));
    expect(pay).toHaveBeenCalledTimes(2);
    expect(pay.mock.calls[0]).toEqual(pay.mock.calls[1]);
    expect(pay.mock.calls[0]?.[0]).toMatchObject({
      amountMinor: '3200000',
      tipMinor: '200000',
      method: method === 'Datáfono' ? 'TERMINAL' : 'TRANSFER',
      receiptNumber: 'T-100',
      idempotencyKey: expect.any(String),
    });
  },
);
