"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  createOrder,
  getCartSnapshot,
} from "@/app/(site)/checkout/actions";
import { ghostButton } from "@/components/home/buttons";
import {
  ChoiceCard,
  eyebrow,
  Field,
  FormSection,
  TextArea,
  TextInput,
} from "@/components/checkout/fields";
import {
  selectItemCount,
  selectTotal,
  useCartStore,
  type CartItem,
} from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { DELIVERY_LABELS, PAYMENT_LABELS } from "@/lib/orders";
import {
  checkoutSchema,
  type CheckoutData,
  type CheckoutValues,
} from "@/lib/validation/checkout";
import { useHydrated } from "@/lib/use-hydrated";

// Compara el carrito antes y después de alinearlo con la base y lo cuenta en palabras.
function describeChanges(before: CartItem[], after: CartItem[]) {
  const notes: string[] = [];
  for (const item of before) {
    const current = after.find((candidate) => candidate.id === item.id);
    if (!current) {
      notes.push(`${item.name} ya no está disponible y lo quitamos del carrito.`);
      continue;
    }
    if (current.quantity < item.quantity) {
      notes.push(
        `Ajustamos ${item.name} a ${current.quantity} ${current.quantity === 1 ? "unidad" : "unidades"} por stock.`,
      );
    }
    if (current.price !== item.price) {
      notes.push(
        `El precio de ${item.name} cambió: ahora es ${formatPrice(current.price)}.`,
      );
    }
  }
  return notes;
}

function Summary({
  items,
  total,
  pending,
  serverError,
  onEditCart,
}: {
  items: CartItem[];
  total: number;
  pending: boolean;
  serverError: string | null;
  onEditCart: () => void;
}) {
  return (
    <aside
      aria-labelledby="resumen-titulo"
      className="border border-hairline-mid bg-card p-6 lg:sticky lg:top-24 lg:p-8"
    >
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2
          id="resumen-titulo"
          className="font-display text-[26px] leading-none font-normal text-cream"
        >
          Tu pedido
        </h2>
        <button
          type="button"
          onClick={onEditCart}
          className="relative after:absolute after:inset-x-0 after:top-1/2 after:z-10 after:h-11 after:-translate-y-1/2 after:content-[''] text-[10px] tracking-[0.16em] text-sand uppercase underline-offset-4 transition-colors hover:text-gold hover:underline"
        >
          Modificar
        </button>
      </div>

      <ul className="divide-y divide-hairline border-y border-hairline">
        {items.map((item) => (
          <li key={item.id} className="flex gap-4 py-5">
            <div className="relative h-[84px] w-[58px] shrink-0 border border-hairline bg-white/[0.03]">
              <Image
                src={item.imageUrl}
                alt=""
                fill
                sizes="58px"
                className="object-contain p-1"
              />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="font-display text-lg leading-tight text-cream">
                {item.name}
              </p>
              <p className="mt-1 text-xs tracking-[0.06em] text-stone tabular-nums">
                {item.quantity} × {formatPrice(item.price)}
              </p>
              <p className="mt-auto pt-2 text-right font-display text-lg font-light text-cream tabular-nums">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-5 flex flex-col gap-2.5 text-sm">
        <div className="flex justify-between text-sand">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(total)}</dd>
        </div>
        <div className="flex justify-between text-sand">
          <dt>Envío</dt>
          <dd>A coordinar</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-hairline-mid pt-4">
          <dt className={eyebrow}>Total</dt>
          <dd className="font-display text-4xl leading-none font-light text-cream tabular-nums">
            {formatPrice(total)}
          </dd>
        </div>
      </dl>

      {serverError && (
        <p
          role="alert"
          className="mt-6 border-l-2 border-red-400 bg-red-500/10 px-4 py-3 text-sm leading-snug text-red-200"
        >
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 flex h-[52px] w-full cursor-pointer items-center justify-center bg-wine text-xs tracking-[0.18em] text-cream uppercase transition-[background-color,transform] duration-200 hover:bg-[#501320] active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Enviando pedido…" : "Confirmar pedido"}
      </button>
      <p className="mt-4 text-xs leading-relaxed text-stone">
        No se cobra nada online. Al confirmar, la bodega se contacta con vos
        para coordinar el pago y la entrega.
      </p>
    </aside>
  );
}

export function CheckoutForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const items = useCartStore((state) => state.items);
  const count = useCartStore(selectItemCount);
  const total = useCartStore(selectTotal);
  const syncItems = useCartStore((state) => state.syncItems);
  const clear = useCartStore((state) => state.clear);
  const openCart = useCartStore((state) => state.open);

  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [notices, setNotices] = useState<string[]>([]);
  // Si el carrito queda vacío por un cambio de stock, lo explicamos en vez de redirigir sin aviso.
  const [emptyReason, setEmptyReason] = useState<string | null>(null);
  const synced = useRef(false);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutValues, unknown, CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      street: "",
      apartment: "",
      city: "",
      province: "",
      postalCode: "",
      notes: "",
      website: "",
    },
  });
  const delivery = useWatch({ control, name: "deliveryMethod" });

  // Carrito vacío => catálogo (salvo que acabemos de confirmar un pedido).
  useEffect(() => {
    if (hydrated && !done && !emptyReason && items.length === 0) {
      router.replace("/catalogo");
    }
  }, [hydrated, done, emptyReason, items.length, router]);

  // Una vez: alinea precios y stock del carrito con la base antes de que el cliente confirme.
  useEffect(() => {
    if (!hydrated || synced.current) return;
    const before = useCartStore.getState().items;
    if (before.length === 0) return;
    synced.current = true;

    getCartSnapshot(before.map((item) => item.id))
      .then((fresh) => {
        syncItems(fresh);
        const after = useCartStore.getState().items;
        const notes = describeChanges(before, after);
        setNotices(notes);
        if (after.length === 0) setEmptyReason(notes.join(" "));
      })
      .catch(() => {
        // Sin conexión con la base: seguimos con lo guardado; el servidor valida igual.
      });
  }, [hydrated, syncItems]);

  async function onSubmit(values: CheckoutData) {
    setServerError(null);
    const result = await createOrder(
      values,
      items.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
    );

    if (result.ok) {
      // `done` primero: evita que el carrito vacío nos redirija al catálogo.
      setDone(true);
      clear();
      router.push(`/checkout/confirmacion?pedido=${result.orderId}`);
      return;
    }

    if (result.kind === "validation") {
      const fields = Object.keys(result.fieldErrors) as (keyof CheckoutValues)[];
      for (const field of fields) {
        setError(field, { message: result.fieldErrors[field] });
      }
      if (fields[0]) setFocus(fields[0]);
      return;
    }

    if (result.kind === "cart") {
      const before = useCartStore.getState().items;
      syncItems(result.fresh);
      const after = useCartStore.getState().items;
      setNotices(describeChanges(before, after));
      if (after.length === 0) {
        setEmptyReason(`${result.message} Tu carrito quedó vacío.`);
        return;
      }
      setServerError(
        `${result.message} Actualizamos tu carrito: revisalo y confirmá de nuevo.`,
      );
      return;
    }

    setServerError(result.message);
  }

  if (hydrated && items.length === 0 && emptyReason) {
    return (
      <div role="alert" className="flex flex-col items-start gap-5 border-t border-hairline-mid py-12">
        <p className={eyebrow}>Tu carrito</p>
        <p className="max-w-xl font-display text-3xl leading-tight font-light text-cream">
          {emptyReason}
        </p>
        <Link href="/catalogo" className={ghostButton}>
          Volver al catálogo
        </Link>
      </div>
    );
  }

  if (!hydrated || items.length === 0) {
    // Mientras se lee el carrito (o se redirige) mostramos el esqueleto.
    return (
      <div aria-busy="true" className="grid gap-12 lg:grid-cols-[1fr_400px] motion-safe:animate-pulse">
        <div className="h-[520px] border-t border-hairline-mid" />
        <div className="h-[420px] border border-hairline-mid bg-card" />
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-x-16 lg:grid-cols-[1fr_400px]"
    >
      {/* Honeypot: fuera de la vista y del foco. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Sitio web</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <div className="min-w-0">
        {notices.length > 0 && (
          <div
            role="status"
            className="mb-2 border-l-2 border-gold bg-white/[0.04] px-5 py-4 text-sm leading-relaxed text-cream"
          >
            {notices.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        )}

        <FormSection step="01" title="Tus datos">
          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field
              label="Nombre completo"
              htmlFor="fullName"
              error={errors.fullName?.message}
              className="sm:col-span-2"
            >
              <TextInput
                id="fullName"
                register={register("fullName")}
                error={errors.fullName?.message}
                autoComplete="name"
                placeholder="Nombre y apellido"
              />
            </Field>
            <Field
              label="Teléfono (WhatsApp)"
              htmlFor="phone"
              error={errors.phone?.message}
              hint="Con código de área y sin el 15. Por acá te contactamos."
            >
              <TextInput
                id="phone"
                type="tel"
                inputMode="tel"
                register={register("phone")}
                error={errors.phone?.message}
                autoComplete="tel"
                placeholder="11 5555-0101"
              />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <TextInput
                id="email"
                type="email"
                inputMode="email"
                register={register("email")}
                error={errors.email?.message}
                autoComplete="email"
                placeholder="tu@email.com"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection step="02" title="Entrega">
          <fieldset aria-describedby={errors.deliveryMethod ? "delivery-error" : undefined}>
            <legend className="sr-only">Modalidad de entrega</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                register={register("deliveryMethod")}
                value="retiro"
                title={DELIVERY_LABELS.retiro}
                description="Coordinamos día y horario para que pases a buscarlo."
              />
              <ChoiceCard
                register={register("deliveryMethod")}
                value="envio"
                title={DELIVERY_LABELS.envio}
                description="El costo y los tiempos del envío se acuerdan con la bodega."
              />
            </div>
            {errors.deliveryMethod && (
              <p id="delivery-error" role="alert" className="mt-3 text-xs font-medium text-red-300">
                {errors.deliveryMethod.message}
              </p>
            )}
          </fieldset>

          {delivery === "envio" && (
            <div className="mt-6 grid gap-x-6 gap-y-5 border-l border-hairline-mid pl-5 sm:grid-cols-2 sm:pl-6">
              <Field
                label="Calle y número"
                htmlFor="street"
                error={errors.street?.message}
                className="sm:col-span-2"
              >
                <TextInput
                  id="street"
                  register={register("street")}
                  error={errors.street?.message}
                  autoComplete="address-line1"
                  placeholder="Av. Santa Fe 1234"
                />
              </Field>
              <Field label="Piso / depto" htmlFor="apartment" optional error={errors.apartment?.message}>
                <TextInput
                  id="apartment"
                  register={register("apartment")}
                  error={errors.apartment?.message}
                  autoComplete="address-line2"
                  placeholder="5° B"
                />
              </Field>
              <Field label="Código postal" htmlFor="postalCode" error={errors.postalCode?.message}>
                <TextInput
                  id="postalCode"
                  register={register("postalCode")}
                  error={errors.postalCode?.message}
                  autoComplete="postal-code"
                  placeholder="1425"
                />
              </Field>
              <Field label="Localidad" htmlFor="city" error={errors.city?.message}>
                <TextInput
                  id="city"
                  register={register("city")}
                  error={errors.city?.message}
                  autoComplete="address-level2"
                />
              </Field>
              <Field label="Provincia" htmlFor="province" error={errors.province?.message}>
                <TextInput
                  id="province"
                  register={register("province")}
                  error={errors.province?.message}
                  autoComplete="address-level1"
                />
              </Field>
            </div>
          )}
        </FormSection>

        <FormSection step="03" title="Pago a coordinar">
          <fieldset aria-describedby={errors.paymentMethod ? "payment-error" : undefined}>
            <legend className="sr-only">Método de pago</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceCard
                register={register("paymentMethod")}
                value="efectivo"
                title={PAYMENT_LABELS.efectivo}
                description="Lo abonás al recibir o retirar tu pedido."
              />
              <ChoiceCard
                register={register("paymentMethod")}
                value="transferencia"
                title={PAYMENT_LABELS.transferencia}
                description="Te pasamos los datos de la cuenta por WhatsApp."
              />
            </div>
            {errors.paymentMethod && (
              <p id="payment-error" role="alert" className="mt-3 text-xs font-medium text-red-300">
                {errors.paymentMethod.message}
              </p>
            )}
          </fieldset>
        </FormSection>

        <FormSection step="04" title="Comentarios">
          <Field label="Algo que quieras aclararnos" htmlFor="notes" optional error={errors.notes?.message}>
            <TextArea
              id="notes"
              register={register("notes")}
              error={errors.notes?.message}
              placeholder="Horarios que te vienen mejor, si es un regalo, etc."
            />
          </Field>
        </FormSection>
      </div>

      <div className="mt-2 lg:mt-0">
        <Summary
          items={items}
          total={total}
          pending={isSubmitting}
          serverError={serverError}
          onEditCart={openCart}
        />
        <p className="sr-only" aria-live="polite">
          {count} {count === 1 ? "producto" : "productos"} en tu pedido
        </p>
      </div>
    </form>
  );
}
