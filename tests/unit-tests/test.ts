// const jest = require('ts-jest');
import 'ts-jest';




test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});

function sum(a:number, b:number) {
    return a + b;
}