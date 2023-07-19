'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  hexcode: z.string().min(6).max(6),
});

/**
 * @param H : hexcode, expected format: #000 or #000000
 * @returns HSL values, format: 0deg 0% 0%
 * @see: https://css-tricks.com/converting-color-spaces-in-javascript/, slighly modified to be typesafe
 */
const hexToHSL = (H: string) => {
  // Convert hex to RGB first
  let r = 0,
    g = 0,
    b = 0;
  if (H.length == 4) {
    r = Number('0x' + H[1] + H[1]);
    g = Number('0x' + H[2] + H[2]);
    b = Number('0x' + H[3] + H[3]);
  } else if (H.length == 7) {
    r = Number('0x' + H[1] + H[2]);
    g = Number('0x' + H[3] + H[4]);
    b = Number('0x' + H[5] + H[6]);
  }
  // Then to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h}deg ${s}% ${l}%`;
};

export default function Home() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hexcode: '',
    },
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(
      `hexcode: ${values.hexcode}, hsl: ${hexToHSL(`#${values.hexcode}`)}`
    );
  }
  return (
    <main className="dark grid place-items-center min-h-screen bg-background text-foreground">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="hexcode"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Hex code</FormLabel>
                  <div className="pl-3 before:left-0 before:top-0 before:bottom-0 before:absolute before:content-['#'] relative before:text-muted">
                    <FormControl>
                      <input
                        maxLength={6}
                        inputMode="numeric"
                        className=" bg-transparent focus:border-transparent focus:outline-none"
                        placeholder="000000"
                        {...field}
                      />
                    </FormControl>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Copy result to clipboard</Button>
        </form>
      </Form>
    </main>
  );
}
