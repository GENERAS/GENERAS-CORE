// Shared option lists for the public collaboration form and the admin inbox.
// Kept in their own module so the admin panel does not have to import the form.

export const COLLABORATION_TYPES = [
  { value: 'new_project', label: 'I have a project that needs building' },
  { value: 'idea', label: 'I have an idea or prototype to validate' },
  { value: 'partnership', label: 'Partnership or joint venture' },
  { value: 'freelance', label: 'Freelance or contract work' },
  { value: 'internship', label: 'Internship or junior developer role' },
  { value: 'open_source', label: 'Open source contribution' },
  { value: 'mentorship', label: 'Mentorship or coaching' },
  { value: 'other', label: 'Something else' },
];

export const COLLABORATION_TYPE_LABEL = Object.fromEntries(
  COLLABORATION_TYPES.map((type) => [type.value, type.label])
);

export const BUDGET_RANGES = [
  'Not decided yet',
  'Under 500k RWF',
  '500k - 1.5M RWF',
  '1.5M - 5M RWF',
  'Above 5M RWF',
  'No budget - I am offering skills, equity or time',
];

export const TIMELINES = [
  'As soon as possible',
  'Within 2 weeks',
  'Within a month',
  '1 - 3 months',
  'More than 3 months',
  'Flexible / not decided',
];