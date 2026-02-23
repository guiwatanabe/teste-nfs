const generateRandomProtocol: () => string = () => {
  return `PROT-${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')}`;
};

export default generateRandomProtocol;
