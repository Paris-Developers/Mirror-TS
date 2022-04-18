// const jest = require('ts-jest');
import 'ts-jest';
import {colorCheck} from '../../src/resources/embedColorCheck'

test('check that the color of the development guild is RANDOM', () => {
    expect(colorCheck('938519232155648011',false)).toBe('RANDOM');
});


test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});

function sum(a:number, b:number) {
    return a + b;
}