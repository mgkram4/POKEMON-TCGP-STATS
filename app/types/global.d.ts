interface Window {
  adsbygoogle: {
    push: (params: object) => void;
  }[];
}

// Replace any existing content with:
declare global {
  interface Window {
    adsbygoogle: {
      push: (params: object) => void;
    }[];
  }
}

export { };

