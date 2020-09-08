const brand = {
  100: '#EEDBF5',
  200: '#DBB2EB',
  300: '#C88AE0',
  400: '#B562D5',
  500: '#A13ACB',
  600: '#832CA5',
  700: '#63217D',
  800: '#431655',
  900: '#230C2C',
};

module.exports = {
  theme: {
    extend: {
      colors: {
        brand,
        primary: brand['500'],
        accent: brand['800'],
        subtle: brand['100'],
      },
      CodeBlock: {
        '@apply text-sm': true,
      },
      LiveCode: {
        '& .editor': {
          '@apply text-sm': true,
        },
      },
    },
  },
};
