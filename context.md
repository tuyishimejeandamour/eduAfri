 example for the implementation
 
 here is how to implement the i18n for the page without "use client"

 app/[lang]/page.tsx

 import { getDictionary } from '@/get-dictionary'
 
export default async function Page({
  params,
}: {
  params: Promise<{ lang: 'en' | 'nl' }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang) // en
  return <button>{dict.products.cart}</button> // Add to Cart
}

and for the client component make sure to pass the directonary to the client.

here is example 

"use client";

import { useState } from "react";
import { type getDictionary } from "../../../get-dictionary";

export default function Counter({
  dictionary,
}: {
  dictionary: Awaited<ReturnType<typeof getDictionary>>["counter"];
}) {
  const [count, setCount] = useState(0);
  return (
    <p>
      This component is rendered on client:
      <button onClick={() => setCount((n) => n - 1)}>
        {dictionary.decrement}
      </button>
      {count}
      <button onClick={() => setCount((n) => n + 1)}>
        {dictionary.increment}
      </button>
    </p>
  );
}

ATTENTION. make sure you follow this quide line
  1. use promise on the parms of the components as in example
  2. always pass dicitionary to children so to avoit the havy lifting on the frontent
  3. before implenting the i18n for the components first check if the dictionary for that component or page is there. 

  MUST NOT DO: DO NOT CHANGE THE UI ONLY CHANGE THE WORDS
