// Nutrition facts, copied from the printed jar labels.
// All flavors share the same values. If a flavor ever differs, copy the entry, change the numbers and give it its own title.
export const NUTRITION = [
  {
    title: 'All Flavors',
    flavors: ['Quezo de Bola Pimiento', 'Spicy Quezo de Bola Pimiento', 'Truffle de Bola', 'Basil Pesto de Bola'],
    serving: '1 tbsp (20g)',
    perContainer: 10,
    rows: [
      { label: 'Energy', value: '84 kcal', bold: true },
      { label: 'Protein', value: '2.1 g', bold: true },
      { label: 'Total Fat', value: '8.1 g', bold: true },
      { label: 'Saturated Fat', value: '4 g', indent: true },
      { label: 'Trans Fat', value: '0 g', indent: true },
      { label: 'Carbohydrates', value: '0.8 g', bold: true },
      { label: 'Calcium', value: '47 mg', bold: true },
      { label: 'Phosphorus', value: '72 mg', bold: true },
      { label: 'Iron', value: '0.1 mg', bold: true },
    ],
    footnote: '*Based on Philippine Dietary Reference Intakes (PDRI) 2015 for 19-29 year old male.',
  },
];
