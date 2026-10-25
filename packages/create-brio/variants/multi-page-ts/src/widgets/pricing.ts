import { createApp } from '@jnreis/briojs';

type Plan = { name: string; monthly: number; blurb: string };

export const pricing = () => createApp({
  state: () => ({
    yearly: false,
    plans: [
      { name: 'Starter', monthly: 9, blurb: 'For a single site.' },
      { name: 'Team', monthly: 29, blurb: 'For a few people and a few sites.' },
      { name: 'Studio', monthly: 79, blurb: 'For agencies juggling clients.' },
    ],
    price(plan: Plan) {
      const amount = this.yearly ? plan.monthly * 0.8 : plan.monthly;
      return `$${amount.toFixed(amount % 1 ? 2 : 0)}`;
    },
  }),
});
