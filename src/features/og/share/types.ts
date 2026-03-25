export type ShareOGPayload =
  | {
      kind: 'scripture';
      title: string;
      body: string;
      meta: string;
      imageUrl?: string | null;
      eyebrow?: string;
    }
  | {
      kind: 'media';
      title: string;
      body: string;
      meta: string;
      imageUrl: string;
      eyebrow?: string;
    };
