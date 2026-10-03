'use client';

import { useEffect, useState } from 'react';

// Shows the year the site was built, then switches to the visitor's current year.
export default function Year({ initial }) {
  const [year, setYear] = useState(initial);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);
  return <span>{year}</span>;
}
