const AttentionExample = (() => {
  const memory = [
    { name: 'The', key: [2, 0, 0, 0], value: [1, 0] },
    { name: 'black', key: [0, 2, 0, 0], value: [0, 2] },
    { name: 'cat', key: [0, 0, 2, 0], value: [3, 1] },
    { name: 'sleeps', key: [0, 0, 0, 2], value: [-1, 1] }
  ];
  const steps = [
    { word: 'Le', source: 0 },
    { word: 'chat', source: 2 },
    { word: 'noir', source: 1 },
    { word: 'dort', source: 3 }
  ];
  function compute(query) {
    const scores = memory.map(item => item.key.reduce((sum, k, i) => sum + query[i] * k, 0) / 2);
    const max = Math.max(...scores);
    const exp = scores.map(score => Math.exp(score - max));
    const sum = exp.reduce((a, b) => a + b, 0);
    const weights = exp.map(value => value / sum);
    const contributions = memory.map((item, i) => item.value.map(value => value * weights[i]));
    const context = [0, 1].map(axis => contributions.reduce((total, item) => total + item[axis], 0));
    return { scores, weights, contributions, context };
  }
  function read(step, strength) {
    const query = memory.map((_, i) => i === steps[step].source ? strength : 0);
    return { query, ...compute(query) };
  }
  return { memory, steps, compute, read };
})();
